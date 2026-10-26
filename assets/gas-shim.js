/**
 * gas-shim.js – In-memory emulation of the Google Apps Script services used by the LIS backend
 * (SpreadsheetApp, CacheService, LockService, PropertiesService, Utilities, ContentService).
 *
 * Purpose: run the REAL backend code (*.gs) in the browser (DEMO mode) and in Node (automated tests)
 * without a Google account. Not loaded in production (config.js → API_URL = real Web App URL).
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------- SHA-256 (sync) */
  function sha256Bytes(str) {
    var utf8 = unescape(encodeURIComponent(str));
    var msg = [];
    for (var i = 0; i < utf8.length; i++) msg.push(utf8.charCodeAt(i));
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
      0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
      0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb,
      0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f,
      0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var l = msg.length * 8;
    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    for (var s = 7; s >= 0; s--) msg.push(s >= 4 ? 0 : (l >>> (s * 8)) & 0xff);
    var w = new Array(64);
    for (var off = 0; off < msg.length; off += 64) {
      for (var t = 0; t < 16; t++) w[t] = (msg[off + t * 4] << 24) | (msg[off + t * 4 + 1] << 16) | (msg[off + t * 4 + 2] << 8) | msg[off + t * 4 + 3];
      for (t = 16; t < 64; t++) {
        var s0 = ror(w[t - 15], 7) ^ ror(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = ror(w[t - 2], 17) ^ ror(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = [];
    H.forEach(function (x) { for (var k = 3; k >= 0; k--) { var v = (x >>> (k * 8)) & 0xff; out.push(v > 127 ? v - 256 : v); } });
    return out;
    function ror(x, n) { return (x >>> n) | (x << (32 - n)); }
  }

  /* ------------------------------------------------------------- Utilities */
  function partsInTz(date, tz) {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    var o = {};
    f.formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    if (o.hour === '24') o.hour = '00';
    return o;
  }
  var Utilities = {
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' },
    computeDigest: function (alg, text) { return sha256Bytes(String(text)); },
    getUuid: function () {
      if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    },
    formatDate: function (date, tz, pattern) {
      var p = partsInTz(date, tz);
      return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, function (tok) {
        return { yyyy: p.year, MM: p.month, dd: p.day, HH: p.hour, mm: p.minute, ss: p.second }[tok];
      });
    },
    base64Encode: function (bytes) {
      var s = '';
      (bytes || []).forEach(function (b) { s += String.fromCharCode(b & 0xff); });
      return typeof btoa === 'function' ? btoa(s) : Buffer.from(s, 'binary').toString('base64');
    }
  };

  /* ------------------------------------------------------------- Spreadsheet model */
  var STORE = { spreadsheets: {} };

  function Range(sheet, row, col, nr, nc) {
    this.sheet = sheet; this.row = row; this.col = col; this.nr = nr || 1; this.nc = nc || 1;
  }
  Range.prototype.getValues = function () {
    var out = [];
    for (var r = 0; r < this.nr; r++) {
      var src = this.sheet.data[this.row - 1 + r] || [];
      var line = [];
      for (var c = 0; c < this.nc; c++) {
        var v = src[this.col - 1 + c];
        line.push(v === undefined || v === null ? '' : v);
      }
      out.push(line);
    }
    return out;
  };
  Range.prototype.setValues = function (vals) {
    for (var r = 0; r < vals.length; r++) {
      var idx = this.row - 1 + r;
      while (this.sheet.data.length <= idx) this.sheet.data.push([]);
      var line = this.sheet.data[idx];
      for (var c = 0; c < vals[r].length; c++) line[this.col - 1 + c] = vals[r][c];
    }
    STORE.dirty = true;
    return this;
  };
  Range.prototype.clearContent = function () {
    var blank = [];
    for (var r = 0; r < this.nr; r++) { var l = []; for (var c = 0; c < this.nc; c++) l.push(''); blank.push(l); }
    return this.setValues(blank);
  };
  Range.prototype.getRow = function () { return this.row; };
  ['setNumberFormat', 'setFontWeight', 'setBackground', 'setFontColor'].forEach(function (m) {
    Range.prototype[m] = function () { return this; };
  });
  Range.prototype.createTextFinder = function (text) {
    var self = this, entire = false, mcase = false;
    var tf = {
      matchEntireCell: function (b) { entire = b; return tf; },
      matchCase: function (b) { mcase = b; return tf; },
      findAll: function () {
        var vals = self.getValues(), out = [];
        var needle = mcase ? String(text) : String(text).toLowerCase();
        for (var r = 0; r < vals.length; r++) {
          for (var c = 0; c < vals[r].length; c++) {
            var hay = mcase ? String(vals[r][c]) : String(vals[r][c]).toLowerCase();
            if (entire ? hay === needle : hay.indexOf(needle) > -1) out.push(new Range(self.sheet, self.row + r, self.col + c, 1, 1));
          }
        }
        return out;
      }
    };
    return tf;
  };

  function Sheet(ss, name) { this.ss = ss; this.name = name; this.data = []; }
  Sheet.prototype.getName = function () { return this.name; };
  Sheet.prototype.getParent = function () { return this.ss; };
  Sheet.prototype.getLastRow = function () {
    for (var r = this.data.length - 1; r >= 0; r--) {
      if ((this.data[r] || []).some(function (v) { return v !== '' && v !== null && v !== undefined; })) return r + 1;
    }
    return 0;
  };
  Sheet.prototype.getLastColumn = function () {
    var m = 0;
    this.data.forEach(function (row) {
      for (var c = row.length - 1; c >= 0; c--) if (row[c] !== '' && row[c] !== undefined && row[c] !== null) { m = Math.max(m, c + 1); break; }
    });
    return m;
  };
  Sheet.prototype.getMaxRows = function () { return Math.max(1000, this.data.length + 1); };
  Sheet.prototype.getRange = function (r, c, nr, nc) { return new Range(this, r, c, nr, nc); };
  Sheet.prototype.deleteRow = function (r) { this.data.splice(r - 1, 1); STORE.dirty = true; };
  Sheet.prototype.insertRowsAfter = function () { return this; };
  Sheet.prototype.setFrozenRows = function () { return this; };

  function Spreadsheet(id) { this.id = id; this.sheets = {}; this.order = []; }
  Spreadsheet.prototype.getId = function () { return this.id; };
  Spreadsheet.prototype.getName = function () { return 'DEMO_' + this.id.substring(0, 6); };
  Spreadsheet.prototype.getUrl = function () { return 'https://docs.google.com/spreadsheets/d/' + this.id; };
  Spreadsheet.prototype.getSheetByName = function (n) { return this.sheets[n] || null; };
  Spreadsheet.prototype.insertSheet = function (n) { var s = new Sheet(this, n); this.sheets[n] = s; this.order.push(n); STORE.dirty = true; return s; };
  Spreadsheet.prototype.getSheets = function () { var self = this; return this.order.map(function (n) { return self.sheets[n]; }); };

  var SpreadsheetApp = {
    openById: function (id) {
      if (!STORE.spreadsheets[id]) STORE.spreadsheets[id] = new Spreadsheet(id);
      return STORE.spreadsheets[id];
    },
    flush: function () {}
  };

  /* ------------------------------------------------------------- Cache / Lock / Properties */
  function makeCache() {
    var m = {};
    var alive = function (k) { var e = m[k]; if (!e) return null; if (e.exp < Date.now()) { delete m[k]; return null; } return e.v; };
    return {
      get: function (k) { return alive(k); },
      put: function (k, v, ttl) { m[k] = { v: String(v), exp: Date.now() + (ttl || 600) * 1000 }; },
      remove: function (k) { delete m[k]; },
      getAll: function (keys) { var o = {}; keys.forEach(function (k) { var v = alive(k); if (v !== null) o[k] = v; }); return o; },
      putAll: function (obj, ttl) { Object.keys(obj).forEach(function (k) { m[k] = { v: String(obj[k]), exp: Date.now() + (ttl || 600) * 1000 }; }); },
      removeAll: function (keys) { keys.forEach(function (k) { delete m[k]; }); },
      _raw: m
    };
  }
  var scriptCache = makeCache();
  var props = {};

  global.Utilities = Utilities;
  global.SpreadsheetApp = SpreadsheetApp;
  global.CacheService = { getScriptCache: function () { return scriptCache; } };
  global.LockService = { getScriptLock: function () { return { tryLock: function () { return true; }, waitLock: function () {}, releaseLock: function () {} }; } };
  global.PropertiesService = { getScriptProperties: function () {
    return { getProperty: function (k) { return props[k] || null; }, setProperty: function (k, v) { props[k] = String(v); } };
  } };
  global.ContentService = {
    MimeType: { JSON: 'JSON' },
    createTextOutput: function (s) { return { _c: s, setMimeType: function () { return this; }, getContent: function () { return this._c; } }; }
  };

  /* ------------------------------------------------------------- Persistence helpers */
  global.GasShim = {
    STORE: STORE,
    exportState: function () {
      var o = { props: props, ss: {} };
      Object.keys(STORE.spreadsheets).forEach(function (id) {
        var s = STORE.spreadsheets[id];
        o.ss[id] = { order: s.order, sheets: {} };
        s.order.forEach(function (n) { o.ss[id].sheets[n] = s.sheets[n].data; });
      });
      return o;
    },
    importState: function (o) {
      Object.keys(o.props || {}).forEach(function (k) { props[k] = o.props[k]; });
      Object.keys(o.ss || {}).forEach(function (id) {
        var s = SpreadsheetApp.openById(id);
        (o.ss[id].order || []).forEach(function (n) { var sh = s.getSheetByName(n) || s.insertSheet(n); sh.data = o.ss[id].sheets[n] || []; });
      });
    },
    clearCache: function () { Object.keys(scriptCache._raw).forEach(function (k) { delete scriptCache._raw[k]; }); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
