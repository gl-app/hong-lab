/**
 * app.js – Core: state, helpers, router, login, shell.
 * Views live in views-order.js & views-admin.js (registered into App.views).
 */
(function (global) {
  'use strict';

  /* ================================================================ HELPERS */
  var U = {
    esc: function (s) {
      return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    money: function (n) { return n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('vi-VN') + ' đ'; },
    num: function (n) { return n === null || n === undefined || n === '' ? '' : Number(n).toLocaleString('vi-VN'); },
    vnDate: function (s) { if (!s) return ''; var d = String(s).substring(0, 10).split('-'); return d.length === 3 ? d[2] + '/' + d[1] + '/' + d[0] : s; },
    vnDateTime: function (s) { if (!s) return ''; return U.vnDate(s) + ' ' + String(s).substring(11, 16); },
    today: function () { var d = new Date(); return U.iso(d); },
    iso: function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); },
    addDays: function (s, n) { var p = s.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + Number(n)); return U.iso(d); },
    debounce: function (fn, ms) { var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); }; },
    $: function (sel, root) { return (root || document).querySelector(sel); },
    $$: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    on: function (root, evt, sel, fn) {
      root.addEventListener(evt, function (e) {
        var el = e.target.closest(sel);
        if (el && root.contains(el)) fn.call(el, e, el);
      });
    },
    loading: function (on) {
      var bar = document.getElementById('loading-bar');
      U._busy = (U._busy || 0) + (on ? 1 : -1);
      if (U._busy > 0) bar.classList.add('on');
      else { U._busy = 0; bar.classList.remove('on'); bar.style.width = '100%'; setTimeout(function () { bar.style.width = ''; }, 250); }
    },
    toast: function (msg, type) {
      var id = 't' + Date.now();
      var color = type === 'error' ? 'text-bg-danger' : (type === 'warn' ? 'text-bg-warning' : 'text-bg-dark');
      document.getElementById('toasts').insertAdjacentHTML('beforeend',
        '<div id="' + id + '" class="toast align-items-center ' + color + ' border-0" role="status"><div class="d-flex"><div class="toast-body">' +
        U.esc(msg) + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>');
      var el = document.getElementById(id);
      var t = new bootstrap.Toast(el, { delay: type === 'error' ? 6000 : 3000 });
      el.addEventListener('hidden.bs.toast', function () { el.remove(); });
      t.show();
    },
    /** Api call with loading bar + error toast. */
    api: function (action, payload, opts) {
      opts = opts || {};
      U.loading(true);
      return Api.call(action, payload).then(function (d) { U.loading(false); return d; }, function (e) {
        U.loading(false);
        if (!opts.silent && e.code !== 'UNAUTHORIZED') U.toast(e.message || 'Lỗi', 'error');
        throw e;
      });
    },
    modal: function (html, opts) {
      opts = opts || {};
      var el = document.getElementById('app-modal');
      el.querySelector('.modal-dialog').className = 'modal-dialog modal-dialog-scrollable ' + (opts.size ? 'modal-' + opts.size : '');
      document.getElementById('app-modal-content').innerHTML = html;
      var m = bootstrap.Modal.getOrCreateInstance(el);
      m.show();
      return { el: el, hide: function () { m.hide(); }, body: document.getElementById('app-modal-content') };
    },
    confirm: function (title, message, okLabel, danger) {
      return new Promise(function (resolve) {
        var m = U.modal('<div class="modal-header"><h5 class="modal-title">' + U.esc(title) + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>' +
          '<div class="modal-body">' + message + '</div><div class="modal-footer"><button class="btn btn-light" data-bs-dismiss="modal">Hủy</button>' +
          '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" id="cf-ok">' + U.esc(okLabel || 'Đồng ý') + '</button></div>');
        var done = false;
        m.body.querySelector('#cf-ok').onclick = function () { done = true; m.hide(); resolve(true); };
        m.el.addEventListener('hidden.bs.modal', function h() { m.el.removeEventListener('hidden.bs.modal', h); if (!done) resolve(false); });
      });
    },
    prompt: function (title, label, required) {
      return new Promise(function (resolve) {
        var m = U.modal('<div class="modal-header"><h5 class="modal-title">' + U.esc(title) + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>' +
          '<div class="modal-body"><label class="form-label">' + U.esc(label) + '</label><textarea class="form-control" id="pr-val" rows="2"></textarea></div>' +
          '<div class="modal-footer"><button class="btn btn-light" data-bs-dismiss="modal">Hủy</button><button class="btn btn-primary" id="pr-ok">Xác nhận</button></div>');
        var done = false;
        m.body.querySelector('#pr-ok').onclick = function () {
          var v = m.body.querySelector('#pr-val').value.trim();
          if (required && !v) { m.body.querySelector('#pr-val').classList.add('is-invalid'); return; }
          done = true; m.hide(); resolve(v);
        };
        m.el.addEventListener('hidden.bs.modal', function h() { m.el.removeEventListener('hidden.bs.modal', h); if (!done) resolve(null); });
      });
    },
    downloadBase64: function (b64, name, mime) {
      var bin = atob(b64), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([arr], { type: mime }));
      var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    },
    empty: function (msg, icon) { return '<div class="empty"><i class="bi ' + (icon || 'bi-inbox') + '"></i>' + U.esc(msg) + '</div>'; },
    statusLabel: function (s) {
      return { REGISTERED: 'Đã tiếp nhận', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy',
               PAID: 'Đã thu', UNPAID: 'Chưa thu', PENDING: 'Chờ tái khám', DONE: 'Đã tái khám', SKIPPED: 'Bỏ qua',
               OVERDUE: 'Quá hạn', TODAY: 'Hôm nay', UPCOMING: 'Sắp đến', RETURNED: 'Đã quay lại' }[s] || s || '';
    },
    badge: function (s) { return s ? '<span class="st st-' + U.esc(s) + '">' + U.esc(U.statusLabel(s)) + '</span>' : ''; },
    chips: function (codes) {
      return String(codes || '').split(',').filter(String).map(function (c) {
        var p = App.panel(c);
        return '<span class="panel-chip" title="' + U.esc(p ? p.PanelName : c) + '">' + U.esc(c) + '</span>';
      }).join('');
    },
    flagLabel: function (f) { return { H: '↑ Cao', L: '↓ Thấp', POS: 'Dương tính', A: 'Bất thường', N: 'Bình thường' }[f] || ''; },
    formData: function (form) {
      var o = {};
      U.$$('[name]', form).forEach(function (el) {
        if (el.type === 'checkbox') o[el.name] = el.checked;
        else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
        else o[el.name] = el.value;
      });
      return o;
    }
  };

  /* ================================================================ STATE */
  var App = {
    U: U,
    views: {},
    state: null,
    can: function (perm) {
      if (!App.state) return false;
      var p = App.state.permissions;
      if (p.indexOf('*') > -1) return true;
      return String(perm).split('|').some(function (x) { return p.indexOf(x) > -1; });
    },
    panel: function (code) { return (App.state.catalog.panels || []).filter(function (p) { return p.PanelCode === code; })[0]; },
    test: function (code) {
      if (!App._tm) { App._tm = {}; App.state.catalog.tests.forEach(function (t) { App._tm[t.TestCode] = t; }); }
      return App._tm[code];
    },
    testsOfPanel: function (code) {
      return App.state.catalog.panelTests.filter(function (x) { return x.PanelCode === code; })
        .map(function (x) { return App.test(x.TestCode); }).filter(Boolean);
    },
    activePanels: function () { return App.state.catalog.panels.filter(function (p) { return p.IsActive; }); },
    setCatalog: function (cat) { App.state.catalog = cat; App._tm = null; },
    refFor: function (t, gender) {
      var f = gender === 'Nữ';
      var min = f ? t.RefMinF : t.RefMinM, max = f ? t.RefMaxF : t.RefMaxM;
      if (f && min === null && max === null) { min = t.RefMinM; max = t.RefMaxM; }
      return { min: min, max: max, text: t.RefText || '' };
    },
    /** Client-side flag preview (same rules as backend Catalog.flag). */
    flag: function (t, v, gender) {
      v = String(v === null || v === undefined ? '' : v).trim();
      if (!v || !t) return '';
      if (t.ResultType === 'NUM') {
        var n = Number(v.replace(',', '.'));
        if (isNaN(n)) return '';
        var r = App.refFor(t, gender);
        if (r.max !== null && n > r.max) return 'H';
        if (r.min !== null && n < r.min) return 'L';
        return 'N';
      }
      if (t.ResultType === 'QUAL') {
        if (/^pos/i.test(v)) return 'POS';
        if (/^neg/i.test(v)) return 'N';
      }
      return '';
    },
    lookup: function (code) { return (App.state.catalog.lookups || {})[code] || []; },
    setting: function (k, d) { var v = (App.state.settings || {})[k]; return v === undefined || v === '' ? d : v; }
  };

  /* ================================================================ PATIENT INDEX (client-side search) */
  /**
   * Danh bạ BN rút gọn tải 1 lần / phiên (sessionStorage, xóa khi đăng xuất / đóng tab),
   * đồng bộ tăng dần mỗi 60s → tìm theo tên / SĐT tức thì, không chờ server.
   */
  App.Patients = (function () {
    var KEY = 'lis_pidx_v1', rows = null, stamp = '', syncedAt = 0, pending = null;
    var key = function (s) {
      return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase().replace(/\s+/g, ' ').trim();
    };
    var digits = function (s) {
      var d = String(s || '').replace(/\D/g, '');
      if (d.indexOf('84') === 0 && d.length === 11) d = '0' + d.substring(2);
      if (d.length === 9 && /^[235789]/.test(d)) d = '0' + d;
      return d;
    };
    var toObj = function (r) {
      return { PatientID: r[0], FullName: r[1], Gender: r[2], BirthYear: r[3] || null, Phone: digits(r[4]), Address: r[5], Ward: r[6], Province: r[7],
               _active: r[8] !== 0, _k: key(r[1]), _a: key([r[5], r[6], r[7]].join(' ')) };
    };
    try { var o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (o) { rows = o.rows.map(toObj); stamp = o.stamp; } } catch (e) { /* ignore */ }
    function persist() {
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ stamp: stamp, rows: rows.map(function (p) { return [p.PatientID, p.FullName, p.Gender, p.BirthYear, p.Phone, p.Address, p.Ward, p.Province, p._active ? 1 : 0]; }) }));
      } catch (e) { /* quota */ }
    }
    function sync() {
      if (pending) return pending;
      pending = Api.call('patient.index', { since: rows ? stamp : '' }).then(function (d) {
        if (d.full || !rows) rows = d.rows.map(toObj);
        else {
          var idx = {};
          rows.forEach(function (p, i) { idx[p.PatientID] = i; });
          d.rows.forEach(function (r) { var o = toObj(r); if (idx[o.PatientID] !== undefined) rows[idx[o.PatientID]] = o; else rows.push(o); });
        }
        stamp = d.stamp || stamp; syncedAt = Date.now(); persist();
      }).finally(function () { pending = null; });
      return pending;
    }
    return {
      ready: function () { return !!rows; },
      /** Có sẵn dữ liệu → trả ngay (đồng bộ nền nếu cũ > 60s); chưa có → chờ tải lần đầu. */
      load: function () {
        if (rows) { if (Date.now() - syncedAt > 60000) sync().catch(function () {}); return Promise.resolve(); }
        return sync();
      },
      search: function (q, birthYear, ward, limit) {
        var out = [];
        if (!rows) return { total: 0, rows: [] };
        var qd = digits(q), isPhone = /^[\d\s.+-]{3,}$/.test(q || '');
        var tokens = isPhone ? [] : key(q).split(' ').filter(String);
        var by = Number(birthYear) || 0, wk = key(ward);
        rows.forEach(function (p) {
          if (!p._active) return;
          if (isPhone && p.Phone.indexOf(qd.replace(/^0/, '')) === -1) return;
          for (var i = 0; i < tokens.length; i++) if (p._k.indexOf(tokens[i]) === -1) return;
          if (by && Number(p.BirthYear) !== by) return;
          if (wk && p._a.indexOf(wk) === -1) return;
          out.push(p);
        });
        var kq = key(q);
        out.sort(function (a, b) {
          var sa = (isPhone ? (a.Phone === qd ? 0 : 1) : (a._k === kq ? 0 : (a._k.indexOf(kq) === 0 ? 1 : 2)));
          var sb = (isPhone ? (b.Phone === qd ? 0 : 1) : (b._k === kq ? 0 : (b._k.indexOf(kq) === 0 ? 1 : 2)));
          return sa - sb || a.FullName.localeCompare(b.FullName, 'vi');
        });
        return { total: out.length, rows: out.slice(0, limit || 30) };
      },
      upsert: function (p) {
        if (!rows || !p) return;
        var o = toObj([p.PatientID, p.FullName, p.Gender, p.BirthYear, p.Phone, p.Address, p.Ward, p.Province, 1]);
        var i = rows.findIndex(function (x) { return x.PatientID === p.PatientID; });
        if (i > -1) rows[i] = o; else rows.push(o);
        persist();
      },
      clear: function () { rows = null; stamp = ''; syncedAt = 0; try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
    };
  })();

  /* ================================================================ USERS (người phụ trách) */
  App.Users = (function () {
    var list = null, pending = null;
    return {
      load: function () {
        if (list) return Promise.resolve(list);
        if (!pending) pending = Api.call('user.options').then(function (l) { list = l; return l; }).finally(function () { pending = null; });
        return pending;
      },
      name: function (u) { var x = (list || []).filter(function (y) { return y.Username === u; })[0]; return x ? x.FullName : u; },
      names: function (arr) { return (arr || []).map(App.Users.name).join(', '); },
      reset: function () { list = null; }
    };
  })();

  /**
   * Ô chọn nhiều người phụ trách (dropdown checkbox). Trả về { get(): [username] }.
   */
  App.assigneePicker = function (el, selected, opts) {
    selected = (selected || []).slice();
    var inline = opts && opts.inline;
    el.innerHTML = inline
      ? '<div class="test-pick d-flex flex-wrap column-gap-3"><button type="button" class="d-none"></button><div class="dropdown-menu-inline d-flex flex-wrap column-gap-3">Đang tải…</div></div>'
      : '<div class="dropdown"><button type="button" class="form-select text-start text-truncate" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Đang tải…</button>' +
        '<div class="dropdown-menu p-2 w-100 shadow" style="max-height:280px;overflow:auto"></div></div>';
    var btn = el.querySelector('button'), menu = el.querySelector(inline ? '.dropdown-menu-inline' : '.dropdown-menu');
    function label() { btn.textContent = selected.length ? App.Users.names(selected) : '— Chưa phân công —'; }
    App.Users.load().then(function (users) {
      // Chỉ giữ người có trong danh sách được phép phụ trách (loại Quản trị hệ thống)
      selected = selected.filter(function (s) { return users.some(function (u) { return u.Username === s; }); });
      menu.innerHTML = users.map(function (u, i) {
        var id = 'asg-' + Math.random().toString(36).slice(2, 7) + i;
        return '<div class="form-check py-1"><input class="form-check-input" type="checkbox" id="' + id + '" value="' + U.esc(u.Username) + '"' + (selected.indexOf(u.Username) > -1 ? ' checked' : '') + '>' +
          '<label class="form-check-label w-100" for="' + id + '">' + U.esc(u.FullName) + ' <span class="small text-muted">' + U.esc(u.RoleName) + '</span></label></div>';
      }).join('') || '<div class="small text-muted px-2">Chưa có nhân viên</div>';
      label();
    }).catch(function () { btn.textContent = 'Không tải được danh sách'; });
    menu.addEventListener('change', function () {
      selected = U.$$('input:checked', menu).map(function (x) { return x.value; });
      label();
    });
    return { get: function () { return selected.slice(); } };
  };

  /* ================================================================ CALC (xem trước – server là nguồn chính) */
  App.Calc = (function () {
    var DEF = {
      LDL_FRIEDEWALD: { deps: ['TG', 'CHOL', 'HDL'], dec: 2, label: 'Cholesterol − HDL − Triglycerid/2.2',
        fn: function (v) { if (!(v.TG > 0 && v.CHOL > 0 && v.HDL > 0)) return null; var r = v.CHOL - v.HDL - v.TG / 2.2; return r > 0 ? r : null; } },
      EGFR_CKD_EPI_2021: { deps: ['CREA'], dec: 0, label: 'CKD-EPI 2021 từ Creatinin, giới, tuổi',
        fn: function (v, c) {
          if (!(v.CREA > 0) || !(c.age > 0)) return null;
          var k = c.female ? 0.7 : 0.9, a = c.female ? -0.241 : -0.302, s = v.CREA / 88.4 / k;
          return 142 * Math.pow(Math.min(s, 1), a) * Math.pow(Math.max(s, 1), -1.2) * Math.pow(0.9938, c.age) * (c.female ? 1.012 : 1);
        } }
    };
    var DEFAULT = { LDL: 'LDL_FRIEDEWALD', EGFR: 'EGFR_CKD_EPI_2021' };
    function f(code) { var t = App.test(code); var k = (t && t.Formula) || DEFAULT[code]; return k ? DEF[k] : null; }
    return {
      is: function (code) { return !!f(code); },
      deps: function (code) { var x = f(code); return x ? x.deps.slice() : []; },
      label: function (code) { var x = f(code); return x ? x.label : ''; },
      /** Các chỉ số tự tính phụ thuộc vào `dep`. */
      dependents: function (dep, codes) { return (codes || []).filter(function (c) { var x = f(c); return x && x.deps.indexOf(dep) > -1; }); },
      compute: function (code, values, ctx) {
        var x = f(code);
        if (!x) return '';
        var v = {};
        x.deps.forEach(function (d) { var n = Number(String(values[d] === undefined ? '' : values[d]).replace(',', '.')); v[d] = isNaN(n) || values[d] === '' ? null : n; });
        var r = x.fn(v, { age: Number(ctx.age) || 0, female: ctx.gender === 'Nữ' });
        if (r === null || !isFinite(r)) return '';
        var m = Math.pow(10, x.dec);
        return String(Math.round(r * m) / m);
      }
    };
  })();

  /**
   * Tiền từng nhóm khi chỉ số trùng chỉ tính 1 lần (giống backend buildLines_).
   * sel: { PanelCode: [TestCode] } theo thứ tự chọn → { amounts: {PanelCode: n}, dup: {PanelCode: {TestCode: 'tính ở X'}} }
   */
  App.priceLines = function (sel) {
    var covered = {}, charged = {}, amounts = {}, dup = {};
    Object.keys(sel).forEach(function (pc) { var p = App.panel(pc); if (p && p.PricingMode === 'PANEL') sel[pc].forEach(function (c) { covered[c] = pc; }); });
    Object.keys(sel).forEach(function (pc) {
      var p = App.panel(pc); dup[pc] = {};
      if (p.PricingMode === 'PANEL') { amounts[pc] = Number(p.Price || 0); return; }
      var unpriced = sel[pc].every(function (c) { var t = App.test(c); return !(t && Number(t.Price)); });
      var a = 0;
      sel[pc].forEach(function (c) {
        if (covered[c] || charged[c]) { dup[pc][c] = covered[c] || charged[c]; return; }
        charged[c] = pc; var t = App.test(c); a += t ? Number(t.Price || 0) : 0;
      });
      amounts[pc] = unpriced ? Number(p.Price || 0) : a;
    });
    return { amounts: amounts, dup: dup };
  };

  /* ================================================================ ROUTER */
  var TITLES = {
    'order-new': 'Tạo phiếu yêu cầu xét nghiệm', 'order-search': 'Tra cứu phiếu xét nghiệm', 'order': 'Chi tiết phiếu xét nghiệm',
    'patient': 'Hồ sơ bệnh nhân', 'my-work': 'Việc của tôi', 'followup': 'Cảnh báo tái khám', 'report': 'Thống kê', 'audit': 'Nhật ký hệ thống', 'admin': 'Quản trị hệ thống'
  };

  function route() {
    if (!App.state) return;
    var hash = location.hash.replace(/^#\/?/, '') || '';
    var parts = hash.split('/');
    var key = parts[0];
    if (!key || !App.views[key]) {
      var first = App.state.menu[0];
      location.replace('#/' + (first ? first.key : 'order-search'));
      return;
    }
    document.body.classList.remove('sidebar-open');
    U.$$('#nav .nav-link').forEach(function (a) {
      var k = a.getAttribute('data-key');
      a.classList.toggle('active', k === key || (key === 'order' && k === 'order-search') || (key === 'patient' && k === 'order-search'));
    });
    document.getElementById('page-title').textContent = TITLES[key] || '';
    var view = document.getElementById('view');
    if (App._cleanup) { try { App._cleanup(); } catch (e) { /* ignore */ } App._cleanup = null; }
    view.innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
    try { App.views[key](view, parts.slice(1).map(decodeURIComponent)); }
    catch (e) { console.error(e); view.innerHTML = U.empty('Lỗi hiển thị: ' + e.message, 'bi-bug'); }
  }
  App.applyBranding = function (s) { applyBranding(s); };
  App.go = function (path) { if (location.hash === '#/' + path) route(); else location.hash = '#/' + path; };

  /* ================================================================ BRANDING */
  function applyBranding(s) {
    s = s || {};
    var logo = s.CLINIC_LOGO_DATA || s.CLINIC_LOGO_URL;
    var name = s.CLINIC_NAME || 'PHÒNG XN Y KHOA';
    U.$$('[data-logo]').forEach(function (el) {
      el.innerHTML = logo ? '<img src="' + U.esc(logo) + '" alt="Logo">' : '<span>XN</span>';
    });
    U.$$('[data-clinic-name]').forEach(function (el) { el.textContent = name; });
    U.$$('[data-clinic-address]').forEach(function (el) { el.textContent = s.CLINIC_ADDRESS || ''; });
    U.$$('[data-app-version]').forEach(function (el) { el.textContent = s.APP_VERSION ? 'v' + s.APP_VERSION : ''; });
    document.title = 'LIS – ' + name;
    // Màn đăng nhập: ảnh nền (LOGIN_BG_URL, trống = ảnh mặc định) + độ mờ lớp phủ (LOGIN_BG_DIM 0–0.8)
    var bg = document.getElementById('login-bg'), dim = document.getElementById('login-dim');
    if (bg) bg.style.backgroundImage = s.LOGIN_BG_URL ? 'url("' + String(s.LOGIN_BG_URL).replace(/["\\\n\r]/g, '') + '")' : '';
    if (dim) { var d = Number(s.LOGIN_BG_DIM); dim.style.opacity = isFinite(d) && s.LOGIN_BG_DIM !== '' && s.LOGIN_BG_DIM !== undefined ? Math.min(0.8, Math.max(0, d)) : ''; }
    var yr = document.getElementById('login-year');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ================================================================ LOGIN / SESSION */
  function showLogin() {
    App.state = null;
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('login-view').style.display = '';
    // Hiện ngay logo/tên đã lưu lần trước (không chờ máy chủ), rồi cập nhật bản mới nhất
    try { var cached = JSON.parse(localStorage.getItem('lis_brand') || 'null'); if (cached) applyBranding(cached); } catch (e) { /* storage unavailable */ }
    Api.call('sys.publicConfig').then(function (pc) {
      applyBranding(pc);
      try { localStorage.setItem('lis_brand', JSON.stringify(pc)); } catch (e) { /* quota / private mode */ }
    }).catch(function () { /* offline branding */ });
  }

  function startApp(boot) {
    Api.setToken(boot.token || Api.getToken());
    App.state = boot;
    App._tm = null;
    applyBranding(boot.settings);
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'block';
    document.getElementById('demo-banner').classList.toggle('d-none', !Api.isDemo);
    document.getElementById('user-name').textContent = boot.user.fullName;
    document.getElementById('user-role').textContent = boot.user.roleName + ' · ' + boot.user.username;
    document.getElementById('today-label').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    document.getElementById('nav').innerHTML = boot.menu.map(function (m) {
      return '<a class="nav-link" href="#/' + m.key + '" data-key="' + m.key + '"><i class="bi ' + m.icon + '"></i><span>' + U.esc(m.label) + '</span>' +
        (m.key === 'followup' ? '<span class="badge rounded-pill text-bg-warning d-none" id="fu-badge"></span>' : '') + '</a>';
    }).join('');
    if (boot.user.mustChangePassword) changePassword(true);
    route();
    refreshFollowupBadge();
    if (App.can('order.create|order.view')) App.Patients.load().catch(function () {});   // tải trước danh bạ BN
    capacityBanner();
  }

  /** Cảnh báo Admin khi Google Sheet dữ liệu sắp đầy. */
  function capacityBanner() {
    var old = document.getElementById('cap-banner');
    if (old) old.remove();
    if (!App.can('admin.config')) return;
    var warn = (App.state.years || []).filter(function (y) { return y.Mode === 'RW' && y.UsedPercent >= (App.state.capacityWarnPercent || 70); });
    if (!warn.length) return;
    document.querySelector('.content').insertAdjacentHTML('beforebegin', '<div id="cap-banner" class="alert alert-warning rounded-0 mb-0 py-2 small">' +
      '<i class="bi bi-database-exclamation"></i> ' + warn.map(function (y) { return U.esc(y.Note || ('DB_' + y.Year)) + ' đã dùng ' + y.UsedPercent + '% dung lượng'; }).join(' · ') +
      '. Hệ thống tự tạo DB nối tiếp khi đạt 85%, hoặc vào <a href="#/admin/years">Kết nối dữ liệu năm</a> để tạo ngay.</div>');
  }

  function refreshFollowupBadge() {
    if (!App.can('followup.view')) return;
    Api.call('followup.list', {}).then(function (d) {
      var n = d.summary.OVERDUE + d.summary.TODAY;
      var b = document.getElementById('fu-badge');
      if (b) { b.textContent = n; b.classList.toggle('d-none', !n); }
    }).catch(function () { /* ignore */ });
  }
  App.refreshFollowupBadge = refreshFollowupBadge;

  function changePassword(forced) {
    var m = U.modal('<form id="cp-form"><div class="modal-header"><h5 class="modal-title">' + (forced ? 'Đổi mật khẩu lần đầu' : 'Đổi mật khẩu') + '</h5>' +
      (forced ? '' : '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>') + '</div><div class="modal-body">' +
      (forced ? '<div class="alert alert-warning small">Vì lý do bảo mật, vui lòng đổi mật khẩu trước khi sử dụng.</div>' : '') +
      '<div class="mb-2"><label class="form-label">Mật khẩu hiện tại</label><input type="password" class="form-control" name="oldPassword" required autocomplete="current-password"></div>' +
      '<div class="mb-2"><label class="form-label">Mật khẩu mới (≥ 6 ký tự)</label><input type="password" class="form-control" name="newPassword" minlength="6" required autocomplete="new-password"></div>' +
      '<div class="mb-2"><label class="form-label">Nhập lại mật khẩu mới</label><input type="password" class="form-control" name="confirm" minlength="6" required autocomplete="new-password"></div>' +
      '</div><div class="modal-footer"><button class="btn btn-primary" type="submit">Lưu mật khẩu</button></div></form>');
    if (forced) { var inst = bootstrap.Modal.getInstance(m.el); inst._config.backdrop = 'static'; inst._config.keyboard = false; }
    m.body.querySelector('#cp-form').onsubmit = function (e) {
      e.preventDefault();
      var d = U.formData(e.target);
      if (d.newPassword !== d.confirm) { U.toast('Mật khẩu nhập lại không khớp', 'error'); return; }
      U.api('auth.changePassword', { oldPassword: d.oldPassword, newPassword: d.newPassword }).then(function () {
        if (App.state) App.state.user.mustChangePassword = false;
        m.hide(); U.toast('Đã đổi mật khẩu');
      });
    };
  }

  function initLogin() {
    var form = document.getElementById('login-form');
    document.getElementById('toggle-pass').onclick = function () {
      var p = document.getElementById('login-pass');
      p.type = p.type === 'password' ? 'text' : 'password';
    };
    form.onsubmit = function (e) {
      e.preventDefault();
      var btn = document.getElementById('login-btn');
      var err = document.getElementById('login-error');
      err.classList.add('d-none');
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang đăng nhập…';
      Api.call('auth.login', { username: form.username.value, password: form.password.value }).then(function (boot) {
        form.password.value = '';
        startApp(boot);
      }).catch(function (ex) {
        err.textContent = ex.message; err.classList.remove('d-none');
      }).finally(function () { btn.disabled = false; btn.textContent = 'Đăng nhập'; });
    };
    document.getElementById('btn-logout').onclick = function () {
      Api.call('auth.logout').catch(function () {}).finally(function () { Api.setToken(null); App.Patients.clear(); App.Users.reset(); location.hash = ''; showLogin(); });
    };
    document.getElementById('btn-change-pass').onclick = function () { changePassword(false); };
    document.getElementById('menu-toggle').onclick = function () { document.body.classList.toggle('sidebar-open'); };
    document.getElementById('sidebar').addEventListener('click', function (e) {
      if (e.target === this && document.body.classList.contains('sidebar-open')) document.body.classList.remove('sidebar-open');
    });
    global.addEventListener('lis:unauthorized', function () { U.toast('Phiên đăng nhập đã hết hạn', 'warn'); showLogin(); });
    global.addEventListener('hashchange', route);
  }

  function boot() {
    initLogin();
    if (Api.getToken()) {
      Api.call('auth.me').then(startApp).catch(showLogin);
    } else showLogin();
  }

  global.App = App;
  document.addEventListener('DOMContentLoaded', boot);
})(window);
