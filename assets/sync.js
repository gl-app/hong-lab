/**
 * sync.js – Bộ nhớ trên máy + ghi lạc quan + hàng đợi ghi ngầm (v2.0.0 "Hướng A").
 *
 * Nguyên tắc an toàn:
 *  1. Google Sheet (máy chủ) là NGUỒN SỰ THẬT DUY NHẤT. Bộ nhớ trên máy chỉ để hiển thị nhanh, luôn bị ghi đè bởi dữ liệu máy chủ.
 *  2. Chỉ ghi ngầm các thao tác "đặt giá trị" (kết quả XN, trạng thái thanh toán) – gửi lại không làm sai dữ liệu.
 *     Tạo phiếu, tiền (chiết khấu/giá), hủy phiếu: vẫn chờ máy chủ.
 *  3. Mỗi lệnh ghi kèm idemKey (máy chủ chống ghi trùng) và giá trị gốc "base" (phát hiện 2 máy cùng sửa 1 ô).
 *  4. Lỗi mạng → giữ trong hàng đợi (IndexedDB, còn khi tải lại trang), tự thử lại. Lỗi nghiệp vụ → bỏ lệnh, tải lại số máy chủ (hoàn tác).
 *  5. Không in khi phiếu còn lệnh chưa được máy chủ xác nhận.
 *  6. Đăng xuất / đổi người dùng → xóa toàn bộ bộ nhớ trên máy.
 */
(function (global, App) {
  'use strict';
  var U = App.U;

  /* ================================================================ STORE (IndexedDB, dự phòng RAM) */
  App.Store = (function () {
    var DB = 'lis-cache', VER = 1, dbp = null, mem = { orders: {}, outbox: {}, meta: {} };
    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (resolve) {
        try {
          if (!global.indexedDB) return resolve(null);
          var req = global.indexedDB.open(DB, VER);
          req.onupgradeneeded = function () {
            var db = req.result;
            ['orders', 'outbox', 'meta'].forEach(function (n) { if (!db.objectStoreNames.contains(n)) db.createObjectStore(n); });
          };
          req.onsuccess = function () { resolve(req.result); };
          req.onerror = function () { resolve(null); };
          req.onblocked = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
      return dbp;
    }
    function tx(store, mode, fn) {
      return open().then(function (db) {
        if (!db) return fn(null);
        return new Promise(function (resolve) {
          try {
            var t = db.transaction(store, mode), os = t.objectStore(store), out;
            var r = fn(os);
            if (r && typeof r.onsuccess !== 'undefined') r.onsuccess = function () { out = r.result; };
            t.oncomplete = function () { resolve(out); };
            t.onerror = t.onabort = function () { resolve(undefined); };
          } catch (e) { resolve(fn(null)); }
        });
      });
    }
    var clone = function (v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); };
    return {
      get: function (store, key) {
        return open().then(function (db) {
          if (!db) return clone(mem[store][key]);
          return new Promise(function (resolve) {
            try {
              var r = db.transaction(store, 'readonly').objectStore(store).get(key);
              r.onsuccess = function () { resolve(r.result); };
              r.onerror = function () { resolve(clone(mem[store][key])); };
            } catch (e) { resolve(clone(mem[store][key])); }
          });
        });
      },
      put: function (store, key, val) { mem[store][key] = clone(val); return tx(store, 'readwrite', function (os) { return os ? os.put(clone(val), key) : null; }); },
      del: function (store, key) { delete mem[store][key]; return tx(store, 'readwrite', function (os) { return os ? os.delete(key) : null; }); },
      all: function (store) {
        return open().then(function (db) {
          if (!db) return Object.keys(mem[store]).map(function (k) { return clone(mem[store][k]); });
          return new Promise(function (resolve) {
            var out = [];
            try {
              var req = db.transaction(store, 'readonly').objectStore(store).openCursor();
              req.onsuccess = function () { var c = req.result; if (c) { out.push(c.value); c.continue(); } else resolve(out); };
              req.onerror = function () { resolve(out); };
            } catch (e) { resolve(out); }
          });
        });
      },
      clear: function () {
        mem = { orders: {}, outbox: {}, meta: {} };
        return open().then(function (db) {
          if (!db) return;
          return Promise.all(['orders', 'outbox', 'meta'].map(function (n) { return tx(n, 'readwrite', function (os) { return os ? os.clear() : null; }); }));
        });
      }
    };
  })();

  /* ================================================================ ORDERS CACHE + PREFETCH */
  App.Orders = (function () {
    var MAX = 300, inflight = {};
    function isView(d) { return d && d.order && d.order.OrderID && Array.isArray(d.panels) && Array.isArray(d.results); }
    function save(d) {
      if (!isView(d)) return Promise.resolve();
      return App.Store.put('orders', d.order.OrderID, { data: d, at: Date.now() }).then(trim);
    }
    var trimTimer = null;
    function trim() {
      if (trimTimer) return;
      trimTimer = setTimeout(function () {
        trimTimer = null;
        App.Store.all('orders').then(function (rows) {
          if (rows.length <= MAX) return;
          rows.sort(function (a, b) { return a.at - b.at; }).slice(0, rows.length - MAX).forEach(function (r) { App.Store.del('orders', r.data.order.OrderID); });
        });
      }, 1500);
    }
    function fetch(id, silent) {
      if (inflight[id]) return inflight[id];
      var p = (silent ? Api.call('order.get', { orderId: id }) : U.api('order.get', { orderId: id }, { silent: true }));
      inflight[id] = p.then(function (d) { delete inflight[id]; return d; }, function (e) { delete inflight[id]; throw e; });
      return inflight[id];   // lưu vào bộ nhớ: LisOnData (api.js) tự gọi save()
    }
    return {
      save: save,
      cached: function (id) { return App.Store.get('orders', id).then(function (c) { return c && isView(c.data) ? c : null; }); },
      fetch: fetch,
      /** Tải sẵn khi rê chuột / chạm vào dòng phiếu (bỏ qua nếu vừa tải < 60 giây). */
      prefetch: function (id) {
        return App.Orders.cached(id).then(function (c) { if (!c || Date.now() - c.at > 60000) return fetch(id, true).catch(function () {}); });
      }
    };
  })();

  global.LisOnData = function (action, data) {
    if (action === 'sys.batch') return;
    if (data && data.order && data.order.OrderID && Array.isArray(data.panels)) App.Orders.save(data);
  };

  /* ================================================================ OUTBOX (hàng đợi ghi ngầm) */
  App.Outbox = (function () {
    var items = [], running = false, timer = null, listeners = [], loaded = null, lastError = '';
    var RETRY = { NETWORK: 1, HTTP_500: 1, HTTP_502: 1, HTTP_503: 1, HTTP_504: 1, HTTP_429: 1, SERVER_ERROR: 1, LOCK_TIMEOUT: 1, BUSY: 1 };
    var BACKOFF = [2000, 5000, 10000, 20000, 30000];
    function emit(type, detail) { listeners.forEach(function (fn) { try { fn(type, detail); } catch (e) { console.error(e); } }); indicator(); }
    function load() {
      if (!loaded) loaded = App.Store.all('outbox').then(function (rows) { items = rows.sort(function (a, b) { return a.seq - b.seq; }); indicator(); });
      return loaded;
    }
    function uid() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
    function enqueue(action, payload, meta) {
      return load().then(function () {
        var it = { id: uid(), seq: Date.now() + Math.random(), action: action, payload: Object.assign({}, payload), orderId: meta.orderId, label: meta.label || action,
                   kind: meta.kind || '', createdAt: Date.now(), tries: 0, lastError: '' };
        it.payload.idemKey = it.id;
        items.push(it);
        return App.Store.put('outbox', it.id, it).then(function () { emit('queued', it); kick(); return it; });
      });
    }
    function remove(it) {
      items = items.filter(function (x) { return x.id !== it.id; });
      return App.Store.del('outbox', it.id);
    }
    function kick(delay) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (delay) { timer = setTimeout(function () { timer = null; kick(); }, delay); return; }
      if (running) return;
      load().then(run);
    }
    function run() {
      if (running || !items.length || !App.state) return;
      running = true; indicator();
      var it = items[0];
      Api.call(it.action, it.payload).then(function (data) {
        lastError = '';
        return remove(it).then(function () { running = false; emit('synced', { item: it, data: data }); kick(); });
      }, function (err) {
        running = false;
        if (RETRY[err.code] || /^HTTP_5/.test(err.code || '')) {
          it.tries++; it.lastError = err.message; lastError = err.message;
          App.Store.put('outbox', it.id, it);
          emit('retry', { item: it, error: err });
          kick(BACKOFF[Math.min(it.tries - 1, BACKOFF.length - 1)]);
        } else if (err.code === 'UNAUTHORIZED') {
          lastError = 'Phiên đăng nhập hết hạn – đăng nhập lại để gửi tiếp';
          emit('retry', { item: it, error: err });          // giữ lại, gửi tiếp sau khi đăng nhập
        } else {
          remove(it).then(function () { emit('failed', { item: it, error: err }); kick(); });   // lỗi nghiệp vụ → bỏ lệnh, màn hình tự tải lại số máy chủ
        }
      });
    }
    /* ---- chỉ báo đồng bộ trên thanh trên cùng */
    function indicator() {
      var el = document.getElementById('sync-ind');
      if (!el) return;
      var n = items.length;
      el.classList.toggle('d-none', !n);
      if (!n) { el.className = 'sync-ind d-none'; el.innerHTML = ''; return; }
      var err = items.some(function (x) { return x.tries > 0; });
      el.className = 'sync-ind ' + (err ? 'sync-err' : 'sync-busy');
      el.innerHTML = err ? '<i class="bi bi-cloud-slash"></i> ' + n + ' thay đổi chưa đồng bộ · <u>Thử lại</u>'
                         : '<span class="spinner-border spinner-border-sm"></span> Đang lưu ' + n + ' thay đổi…';
      el.title = err ? (lastError || 'Chưa kết nối được máy chủ') + '\nDữ liệu vẫn được giữ trên máy này và sẽ tự gửi khi có mạng.' : 'Đang gửi lên máy chủ';
    }
    global.addEventListener('online', function () { kick(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    global.addEventListener('beforeunload', function (e) {
      if (items.length) { e.preventDefault(); e.returnValue = 'Còn thay đổi chưa đồng bộ.'; return e.returnValue; }
    });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#sync-ind')) { items.forEach(function (x) { x.tries = 0; }); kick(); } });
    return {
      enqueue: enqueue,
      kick: kick,
      load: load,
      count: function () { return items.length; },
      pending: function (orderId) { return items.filter(function (x) { return x.orderId === orderId; }); },
      on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },
      reset: function () { items = []; running = false; if (timer) clearTimeout(timer); timer = null; loaded = null; indicator(); }
    };
  })();

  /** Phủ các kết quả đang chờ gửi lên dữ liệu máy chủ (để không "nhảy về số cũ" trong lúc đang lưu). */
  App.overlayPending = function (d) {
    if (!d || !d.order) return d;
    var pend = App.Outbox.pending(d.order.OrderID);
    if (!pend.length) return d;
    d = JSON.parse(JSON.stringify(d));
    d._pending = {};
    pend.forEach(function (it) {
      if (it.action === 'order.saveResults') {
        var pc = it.payload.panelCode;
        it.payload.results.forEach(function (r) {
          var ex = d.results.filter(function (x) { return x.PanelCode === pc && x.TestCode === r.testCode; })[0];
          var base = it.payload.base && Object.prototype.hasOwnProperty.call(it.payload.base, r.testCode) ? String(it.payload.base[r.testCode]) : null;
          if (ex) ex.Value = r.value; else if (r.value !== '') d.results.push({ PanelCode: pc, TestCode: r.testCode, Value: r.value, Flag: '' });
          if (base === null || base !== String(r.value)) d._pending[pc + '|' + r.testCode] = true;   // chỉ đánh dấu ô thực sự thay đổi
        });
        d._pending['panel:' + pc] = true;
      } else if (it.action === 'order.update' && it.payload.paymentStatus) {
        d.order.PaymentStatus = it.payload.paymentStatus;
        d._pending.payment = true;
      }
    });
    return d;
  };

  /** Đăng xuất / đổi tài khoản: xóa bộ nhớ trên máy. */
  App.clearLocalCache = function () { App.Outbox.reset(); return App.Store.clear(); };
  /** Mở phiên: bộ nhớ thuộc người khác → xóa; rồi gửi tiếp hàng đợi còn tồn. */
  App.initLocalCache = function (username) {
    return App.Store.get('meta', 'owner').then(function (owner) {
      if (owner && owner !== username) return App.clearLocalCache().then(function () { return App.Store.put('meta', 'owner', username); });
      if (!owner) return App.Store.put('meta', 'owner', username);
    }).then(function () { return App.Outbox.load(); }).then(function () { App.Outbox.kick(); });
  };
})(window, window.App);
