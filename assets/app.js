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

  /* ================================================================ ROUTER */
  var TITLES = {
    'order-new': 'Tạo phiếu yêu cầu xét nghiệm', 'order-search': 'Tra cứu phiếu xét nghiệm', 'order': 'Chi tiết phiếu xét nghiệm',
    'patient': 'Hồ sơ bệnh nhân', 'followup': 'Cảnh báo tái khám', 'report': 'Thống kê doanh thu', 'audit': 'Nhật ký hệ thống', 'admin': 'Quản trị hệ thống'
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
  App.go = function (path) { if (location.hash === '#/' + path) route(); else location.hash = '#/' + path; };

  /* ================================================================ BRANDING */
  function applyBranding(s) {
    s = s || {};
    var logo = s.CLINIC_LOGO_URL;
    var name = s.CLINIC_NAME || 'PHÒNG XN Y KHOA';
    U.$$('[data-logo]').forEach(function (el) {
      el.innerHTML = logo ? '<img src="' + U.esc(logo) + '" alt="Logo">' : '<span>XN</span>';
    });
    U.$$('[data-clinic-name]').forEach(function (el) { el.textContent = name; });
    U.$$('[data-clinic-address]').forEach(function (el) { el.textContent = s.CLINIC_ADDRESS || ''; });
    U.$$('[data-app-version]').forEach(function (el) { el.textContent = s.APP_VERSION ? 'v' + s.APP_VERSION : ''; });
    document.title = 'LIS – ' + name;
  }

  /* ================================================================ LOGIN / SESSION */
  function showLogin() {
    App.state = null;
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('login-view').style.display = '';
    document.getElementById('demo-hint').classList.toggle('d-none', !Api.isDemo);
    Api.call('sys.publicConfig').then(applyBranding).catch(function () { /* offline branding */ });
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
      Api.call('auth.logout').catch(function () {}).finally(function () { Api.setToken(null); location.hash = ''; showLogin(); });
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
