/**
 * api.js – Client gọi JSON API của Google Apps Script.
 *  - POST text/plain (không preflight CORS), token phiên đính kèm mỗi request.
 *  - DEMO mode: chạy backend thật (*.gs đã bundle) trên gas-shim trong trình duyệt.
 */
(function (global) {
  'use strict';
  var cfg = global.LIS_CONFIG || { API_URL: 'DEMO' };
  var TOKEN_KEY = 'lis_token';
  var DEMO_KEY = 'lis_demo_state_v3';
  var token = null;
  try { token = sessionStorage.getItem(TOKEN_KEY); } catch (e) { /* storage unavailable */ }

  var isDemo = String(cfg.API_URL).toUpperCase() === 'DEMO';
  var demoReady = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Không tải được ' + src)); };
      document.head.appendChild(s);
    });
  }

  function initDemo() {
    if (demoReady) return demoReady;
    demoReady = loadScript('assets/gas-shim.js?v=1.2.0')
      .then(function () { return loadScript('assets/demo/backend.bundle.js?v=1.2.0'); })
      .then(function () { return loadScript('assets/demo/demo-seed.js?v=1.2.0'); })
      .then(function () {
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { saved = null; }
        if (saved) global.GasShim.importState(saved);
        else { global.setup(); global.DemoSeed.run(); persistDemo(); }
      });
    return demoReady;
  }

  function persistDemo() {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(global.GasShim.exportState())); } catch (e) { /* quota / private mode */ }
  }

  function ApiError(code, message) { this.code = code; this.message = message; }
  ApiError.prototype = Object.create(Error.prototype);

  function call(action, payload) {
    var body = JSON.stringify({ action: action, token: token, payload: payload || {}, reqId: Date.now().toString(36) });
    var p;
    if (isDemo) {
      p = initDemo().then(function () {
        return new Promise(function (resolve) {
          setTimeout(function () {   // yield to UI, emulate latency
            var out = JSON.parse(global.doPost({ postData: { contents: body } }).getContent());
            if (out.ok && !/^(sys\.|catalog\.get|order\.get|order\.search|patient\.search|patient\.get|history\.|followup\.list|report\.|audit\.|admin\.[a-z]+\.list|admin\.settings\.get)/.test(action)) persistDemo();
            resolve(out);
          }, 60);
        });
      });
    } else {
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, cfg.REQUEST_TIMEOUT_MS || 60000) : null;
      p = fetch(cfg.API_URL, {
        method: 'POST', body: body, redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        if (!r.ok) throw new ApiError('HTTP_' + r.status, 'Lỗi kết nối máy chủ (HTTP ' + r.status + ')');
        return r.json();
      }).catch(function (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError('NETWORK', e.name === 'AbortError' ? 'Quá thời gian chờ máy chủ.' : 'Không kết nối được máy chủ. Kiểm tra mạng.');
      }).finally(function () { if (timer) clearTimeout(timer); });
    }
    return p.then(function (res) {
      if (!res.ok) {
        if (res.error && res.error.code === 'UNAUTHORIZED') { setToken(null); global.dispatchEvent(new CustomEvent('lis:unauthorized')); }
        throw new ApiError(res.error ? res.error.code : 'ERROR', res.error ? res.error.message : 'Lỗi không xác định');
      }
      return res.data;
    });
  }

  function setToken(t) {
    token = t;
    try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
  }

  global.Api = {
    call: call,
    setToken: setToken,
    getToken: function () { return token; },
    isDemo: isDemo,
    resetDemo: function () { try { localStorage.removeItem(DEMO_KEY); } catch (e) { /* ignore */ } setToken(null); location.reload(); }
  };
})(window);
