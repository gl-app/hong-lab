/* AUTO-GENERATED from backend/*.gs – do not edit. */
/* ---- 00_Config.gs ---- */
/**
 * ============================================================================
 *  LIS – Laboratory Information System (Phòng XN Y Khoa)
 *  Backend: Google Apps Script Web App (JSON API)  |  Storage: Google Sheets
 * ----------------------------------------------------------------------------
 *  00_Config.gs – Hằng số hệ thống, schema bảng, chuẩn mã định danh.
 * ============================================================================
 *
 *  CHUẨN MÃ ĐỊNH DANH
 *  - Mã bệnh nhân (PatientID) : BN-000001       (toàn hệ thống, không reset theo năm)
 *  - Mã phiếu XN  (OrderID)   : XN-YYMMDD-NNN   (reset theo ngày; YY quyết định DB năm)
 *  - Mã nhóm XN   (PanelCode) : 2 ký tự  (SH, GD, DK, TG, NT, DR, VS, TD, ND, ID, DA, GN)
 *  - Mã chỉ số    (TestCode)  : UPPER_SNAKE (GLU, HBA1C, ALT, U_PH, ...)
 *  - Mã vai trò   (RoleCode)  : ADMIN | DOCTOR | TECH | RECEPTION | <tùy chỉnh>
 */

var APP = {
  NAME: 'LIS Phòng XN Y Khoa',
  VERSION: '1.7.0',
  TZ: 'Asia/Ho_Chi_Minh',
  API_VERSION: 1
};

/** Script Properties keys (Project Settings → Script properties). */
var PROP = {
  CONFIG_DB_ID: 'CONFIG_DB_ID',     // 1QFc_EpawGu_LQs3iJpL3ZTnM_0g1C90snF-YgvF6vjY
  PATIENT_DB_ID: 'PATIENT_DB_ID'    // 1GpAYuXctAAR2gGvCfyHi-1T4ldqnanaX7rYszHMiB6I
};

/** Default IDs – used by setup() to populate Script Properties on first run. */
var DEFAULT_IDS = {
  CONFIG_DB_ID: '1QFc_EpawGu_LQs3iJpL3ZTnM_0g1C90snF-YgvF6vjY',
  PATIENT_DB_ID: '1GpAYuXctAAR2gGvCfyHi-1T4ldqnanaX7rYszHMiB6I',
  YEAR_DBS: [
    { Year: 2025, SpreadsheetId: '1BZsfQPEvjBPv3Gj6RAVZV6LJJsF9ri4HTugch2q0yU8', Mode: 'RW', Note: 'DB_2025' },
    { Year: 2026, SpreadsheetId: '1djrMuW951E7VjQRqdAgJKhZRe4ayOPGS-ZZgNUXjra4', Mode: 'RW', Note: 'DB_2026' }
  ]
};

/** Sheet (table) names. */
var T = {
  // CONFIG DB
  SETTINGS: 'Settings',
  ROLES: 'Roles',
  USERS: 'Users',
  PANELS: 'Panels',
  TESTS: 'Tests',
  PANEL_TESTS: 'PanelTests',
  DOCTORS: 'Doctors',
  LOOKUPS: 'Lookups',
  YEAR_DBS: 'YearDatabases',
  WARDS: 'Wards',
  SEQUENCES: 'Sequences',
  SYS_LOG: 'SystemLog',           // đăng nhập, cấu hình, quản trị
  // PATIENT DB
  PATIENTS: 'Patients',
  // YEAR DB
  ORDERS: 'Orders',
  ORDER_PANELS: 'OrderPanels',
  RESULTS: 'Results',
  AUDIT: 'AuditLog'               // nghiệp vụ phiếu / kết quả của năm
};

/** Column schema per table. Column order = sheet order. Header row = row 1. */
var SCHEMA = {};
SCHEMA[T.SETTINGS]    = ['Key', 'Value', 'Description'];
SCHEMA[T.ROLES]       = ['RoleCode', 'RoleName', 'Permissions', 'IsSystem'];
SCHEMA[T.USERS]       = ['Username', 'FullName', 'RoleCode', 'PasswordHash', 'Salt', 'IsActive',
                         'MustChangePassword', 'LastLoginAt', 'CreatedAt', 'UpdatedAt'];
SCHEMA[T.PANELS]      = ['PanelCode', 'PanelName', 'PrintTitle', 'PrintSubtitle', 'PricingMode', 'Price',
                         'SortOrder', 'IsActive', 'TemplateDocId', 'PageSize'];
SCHEMA[T.TESTS]       = ['TestCode', 'TestName', 'Unit', 'ResultType', 'RefMinM', 'RefMaxM', 'RefMinF',
                         'RefMaxF', 'RefText', 'Price', 'SortOrder', 'IsActive', 'LegacyName', 'Formula'];
SCHEMA[T.PANEL_TESTS] = ['PanelCode', 'TestCode', 'SortOrder'];
SCHEMA[T.DOCTORS]     = ['DoctorName', 'IsActive', 'SortOrder'];
SCHEMA[T.LOOKUPS]     = ['ListCode', 'Value', 'SortOrder'];
SCHEMA[T.YEAR_DBS]    = ['Year', 'SpreadsheetId', 'Mode', 'Note', 'UsedCells', 'CheckedAt', 'OrderRows', 'ResultRows'];
SCHEMA[T.WARDS]       = ['Province', 'WardName', 'SortOrder', 'IsActive'];
SCHEMA[T.SEQUENCES]   = ['SeqKey', 'LastValue', 'UpdatedAt'];
SCHEMA[T.SYS_LOG]     = ['Timestamp', 'Username', 'Action', 'Entity', 'EntityID', 'Detail'];

SCHEMA[T.PATIENTS]    = ['PatientID', 'FullName', 'SearchName', 'Gender', 'BirthYear', 'Phone', 'Address',
                         'Ward', 'Province', 'Note', 'IsActive', 'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy'];

SCHEMA[T.ORDERS]      = ['OrderID', 'OrderDate', 'PatientID', 'PatientName', 'Gender', 'Age', 'Phone', 'Address',
                         'DoctorName', 'PanelCodes', 'GrossAmount', 'Discount', 'NetAmount', 'PaymentStatus',
                         'Status', 'FollowUpDays', 'FollowUpDate', 'FollowUpStatus', 'Note', 'LegacyCode',
                         'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy', 'Version',
                         'AssignedTo', 'FirstResultAt', 'CompletedAt'];
SCHEMA[T.ORDER_PANELS]= ['OrderID', 'PanelCode', 'TestCodes', 'Amount', 'ResultStatus', 'PrintCount', 'LastPrintedAt'];
SCHEMA[T.RESULTS]     = ['OrderID', 'PatientID', 'OrderDate', 'PanelCode', 'TestCode', 'Value', 'NumValue',
                         'Unit', 'RefText', 'Flag', 'EnteredAt', 'EnteredBy'];
SCHEMA[T.AUDIT]       = ['Timestamp', 'Username', 'Action', 'Entity', 'EntityID', 'Detail'];

/** Which DB each table lives in. */
var TABLE_DB = {};
[T.SETTINGS, T.ROLES, T.USERS, T.PANELS, T.TESTS, T.PANEL_TESTS, T.DOCTORS, T.LOOKUPS,
 T.YEAR_DBS, T.WARDS, T.SEQUENCES, T.SYS_LOG].forEach(function (t) { TABLE_DB[t] = 'CONFIG'; });
TABLE_DB[T.PATIENTS] = 'PATIENT';
[T.ORDERS, T.ORDER_PANELS, T.RESULTS, T.AUDIT].forEach(function (t) { TABLE_DB[t] = 'YEAR'; });

/** Enumerations (chuẩn thuật ngữ). */
var ENUM = {
  ORDER_STATUS: {
    REGISTERED: 'REGISTERED',     // Đã tiếp nhận
    IN_PROGRESS: 'IN_PROGRESS',   // Đang thực hiện (có ít nhất 1 kết quả)
    COMPLETED: 'COMPLETED',       // Hoàn tất (đủ kết quả các nhóm)
    CANCELLED: 'CANCELLED'        // Đã hủy
  },
  PANEL_STATUS: { PENDING: 'PENDING', RESULTED: 'RESULTED' },
  PAYMENT: { UNPAID: 'UNPAID', PAID: 'PAID' },
  FOLLOWUP: { NONE: '', PENDING: 'PENDING', DONE: 'DONE', SKIPPED: 'SKIPPED' },
  RESULT_TYPE: { NUM: 'NUM', QUAL: 'QUAL', BLOOD: 'BLOOD', TEXT: 'TEXT' },
  FLAG: { NORMAL: 'N', HIGH: 'H', LOW: 'L', POSITIVE: 'POS', ABNORMAL: 'A' },
  PRICING: { TEST: 'TEST', PANEL: 'PANEL' }
};

/** Permission keys (quyền chức năng). '*' = toàn quyền. */
var PERM = {
  ORDER_CREATE: 'order.create',     // Tạo phiếu yêu cầu XN
  ORDER_EDIT: 'order.edit',         // Sửa thông tin phiếu, thanh toán
  ORDER_CANCEL: 'order.cancel',     // Hủy phiếu
  ORDER_VIEW: 'order.view',         // Tra cứu phiếu
  PRICE_OVERRIDE: 'order.price',    // Sửa đơn giá / chiết khấu
  RESULT_ENTER: 'result.enter',     // Nhập / sửa kết quả
  PATIENT_EDIT: 'patient.edit',     // Sửa hồ sơ bệnh nhân
  HISTORY_VIEW: 'history.view',     // Xem lịch sử chỉ số
  FOLLOWUP_VIEW: 'followup.view',   // Cảnh báo tái khám
  PRINT: 'print',                   // In / xuất phiếu kết quả
  REPORT_REVENUE: 'report.revenue', // Thống kê doanh thu
  REPORT_EXPORT: 'report.export',   // Xuất Excel báo cáo tổng (toàn bộ phiếu, có doanh thu)
  WORK_EXPORT: 'work.export',       // Xuất danh sách phiếu mình phụ trách (không có số tiền)
  AUDIT_VIEW: 'audit.view',         // Xem nhật ký hệ thống
  ADMIN_USERS: 'admin.users',       // Quản lý tài khoản & vai trò
  ADMIN_CONFIG: 'admin.config'      // Cấu hình hệ thống, danh mục, kết nối DB năm
};

/** Menu → permission map (FE uses it to render navigation). */
var MENU = [
  { key: 'order-new', label: 'Tạo phiếu XN', icon: 'bi-file-earmark-plus', perm: PERM.ORDER_CREATE },
  { key: 'order-search', label: 'Tra cứu phiếu', icon: 'bi-search', perm: PERM.ORDER_VIEW },
  { key: 'my-work', label: 'Việc của tôi', icon: 'bi-person-check', perm: PERM.ORDER_VIEW + '|' + PERM.RESULT_ENTER },
  { key: 'followup', label: 'Cảnh báo tái khám', icon: 'bi-bell', perm: PERM.FOLLOWUP_VIEW },
  { key: 'report', label: 'Thống kê', icon: 'bi-graph-up', perm: PERM.REPORT_REVENUE },
  { key: 'audit', label: 'Nhật ký hệ thống', icon: 'bi-journal-text', perm: PERM.AUDIT_VIEW },
  { key: 'admin', label: 'Quản trị', icon: 'bi-gear', perm: PERM.ADMIN_CONFIG + '|' + PERM.ADMIN_USERS }
];

/** Cache keys / TTL (seconds). */
var CACHE = {
  CATALOG: 'catalog_v1',
  SETTINGS: 'settings_v1',
  ROLES: 'roles_v1',
  YEAR_DBS: 'yeardbs_v1',
  SESSION_PREFIX: 'sess_',
  LOGIN_FAIL_PREFIX: 'lf_',
  TTL_LONG: 21600,   // 6h (max of CacheService)
  TTL_SHORT: 600
};

/** Dung lượng Google Sheet: 10 triệu ô / file. Vượt ngưỡng → tự tạo DB nối tiếp. */
var CAPACITY = {
  MAX_CELLS: 10000000,
  WARN_PERCENT: 70,        // cảnh báo Admin
  ROLLOVER_PERCENT: 85,    // tự tạo DB_<năm>_<n> và chuyển DB cũ sang FULL
  // Ngưỡng số dòng mặc định (Admin chỉnh tại Quản trị → Kết nối dữ liệu năm). Results nhiều dòng nhất (~8–10 dòng/phiếu).
  DEFAULT_MAX_ORDER_ROWS: 20000,
  DEFAULT_MAX_RESULT_ROWS: 150000,
  ROW_WARN_PERCENT: 80
};

/** Chế độ DB năm: RW = đang ghi phiếu mới | FULL = đầy, chỉ sửa phiếu cũ | RO = khóa sổ, chỉ đọc. */
var DB_MODE = { RW: 'RW', FULL: 'FULL', RO: 'RO' };

var SECURITY = {
  HASH_ITERATIONS: 300,
  MAX_LOGIN_FAILS: 5,
  LOCKOUT_SECONDS: 300,
  DEFAULT_SESSION_HOURS: 6,
  LOCK_WAIT_MS: 20000
};

/** Public settings exposed to FE before login (branding). */
var PUBLIC_SETTING_KEYS = ['CLINIC_NAME', 'CLINIC_LOGO_URL', 'CLINIC_LOGO_DATA', 'CLINIC_ADDRESS', 'CLINIC_PHONE', 'LOGIN_BG_URL', 'LOGIN_BG_DIM'];

/* ---- 01_Router.gs ---- */
/**
 * 01_Router.gs – JSON API entry point.
 *
 * Request  (POST, Content-Type: text/plain để tránh CORS preflight):
 *   { "action": "order.create", "token": "<session>", "payload": { ... }, "reqId": "..." }
 * Response:
 *   { "ok": true,  "data": {...}, "reqId": "...", "ms": 123 }
 *   { "ok": false, "error": { "code": "FORBIDDEN", "message": "..." }, "reqId": "..." }
 */

/** Route table: action → handler, required permission (null = any logged-in user), auth flag. */
var ROUTES = {
  'sys.ping':              { fn: function () { return { app: APP.NAME, version: APP.VERSION, time: nowIso_() }; }, auth: false },
  'sys.publicConfig':      { fn: function () { return Settings.getPublic(); }, auth: false },

  'auth.login':            { fn: function (p) { return Auth.login(p); }, auth: false },
  'auth.logout':           { fn: function (p, c) { return Auth.logout(c); } },
  'auth.me':               { fn: function (p, c) { return Auth.me(c); } },
  'auth.changePassword':   { fn: function (p, c) { return Auth.changePassword(p, c); } },

  'catalog.get':           { fn: function () { return Catalog.get(); } },

  'patient.index':         { fn: function (p) { return PatientService.index(p); }, perm: PERM.ORDER_VIEW + '|' + PERM.ORDER_CREATE },
  'patient.search':        { fn: function (p) { return PatientService.search(p); }, perm: PERM.ORDER_VIEW + '|' + PERM.ORDER_CREATE },
  'patient.get':           { fn: function (p) { return PatientService.get(p.patientId); }, perm: PERM.ORDER_VIEW + '|' + PERM.ORDER_CREATE },
  'patient.save':          { fn: function (p, c) { return PatientService.save(p, c); }, perm: PERM.ORDER_CREATE + '|' + PERM.PATIENT_EDIT },

  'order.create':          { fn: function (p, c) { return OrderService.create(p, c); }, perm: PERM.ORDER_CREATE },
  'order.update':          { fn: function (p, c) { return OrderService.update(p, c); }, perm: PERM.ORDER_EDIT },
  'order.get':             { fn: function (p, c) { return OrderService.get(p.orderId, c); }, perm: PERM.ORDER_VIEW + '|' + PERM.RESULT_ENTER },
  'order.search':          { fn: function (p, c) { return OrderService.search(p, c); }, perm: PERM.ORDER_VIEW },
  'order.saveResults':     { fn: function (p, c) { return OrderService.saveResults(p, c); }, perm: PERM.RESULT_ENTER },
  'order.cancel':          { fn: function (p, c) { return OrderService.cancel(p, c); }, perm: PERM.ORDER_CANCEL + '|' + PERM.ORDER_CREATE },   // người tạo: tự hủy phiếu dư (kiểm tra trong service)
  'order.audit':           { fn: function (p) { return Audit.listForEntity(p.orderId); }, perm: PERM.ORDER_VIEW },

  'user.options':          { fn: function () { return WorkService.userOptions(); }, perm: PERM.ORDER_VIEW + '|' + PERM.ORDER_CREATE + '|' + PERM.RESULT_ENTER },
  'work.list':             { fn: function (p, c) { return WorkService.list(p, c); }, perm: PERM.ORDER_VIEW + '|' + PERM.RESULT_ENTER },
  'work.summary':          { fn: function (p, c) { return WorkService.summary(p, c); }, perm: PERM.ORDER_VIEW + '|' + PERM.RESULT_ENTER },
  'work.export':           { fn: function (p, c) { return WorkService.exportData(p, c); }, perm: PERM.WORK_EXPORT + '|' + PERM.ADMIN_USERS },
  'report.productivity':   { fn: function (p) { return WorkService.productivity(p); }, perm: PERM.REPORT_REVENUE + '|' + PERM.ADMIN_USERS },

  'history.byPatient':     { fn: function (p) { return HistoryService.byPatient(p); }, perm: PERM.HISTORY_VIEW },

  'followup.list':         { fn: function (p) { return FollowUpService.list(p); }, perm: PERM.FOLLOWUP_VIEW },
  'followup.update':       { fn: function (p, c) { return FollowUpService.update(p, c); }, perm: PERM.FOLLOWUP_VIEW },

  'report.revenue':        { fn: function (p) { return ReportService.revenue(p); }, perm: PERM.REPORT_REVENUE },
  'report.export':         { fn: function (p, c) { return ReportService.exportData(p, c); }, perm: PERM.REPORT_EXPORT },

  'print.render':          { fn: function (p, c) { return PrintService.render(p, c); }, perm: PERM.PRINT },

  'audit.list':            { fn: function (p) { return Audit.list(p); }, perm: PERM.AUDIT_VIEW },

  'admin.users.list':      { fn: function () { return AdminService.listUsers(); }, perm: PERM.ADMIN_USERS },
  'admin.users.save':      { fn: function (p, c) { return AdminService.saveUser(p, c); }, perm: PERM.ADMIN_USERS },
  'admin.users.resetPassword': { fn: function (p, c) { return AdminService.resetPassword(p, c); }, perm: PERM.ADMIN_USERS },
  'admin.roles.list':      { fn: function () { return AdminService.listRoles(); }, perm: PERM.ADMIN_USERS },
  'admin.roles.save':      { fn: function (p, c) { return AdminService.saveRole(p, c); }, perm: PERM.ADMIN_USERS },
  'admin.settings.get':    { fn: function () { return AdminService.getSettings(); }, perm: PERM.ADMIN_CONFIG },
  'admin.logo.upload':     { fn: function (p, c) { return AdminService.uploadLogo(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.logo.remove':     { fn: function (p, c) { return AdminService.removeLogo(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.settings.save':   { fn: function (p, c) { return AdminService.saveSettings(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.list':      { fn: function () { return AdminService.listYearDbs(); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.save':      { fn: function (p, c) { return AdminService.saveYearDb(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.optimize':  { fn: function (p, c) { return AdminService.optimizeStorage(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.limits':    { fn: function (p, c) { return p && p.orders !== undefined ? AdminService.saveYearLimits(p, c) : YearDb.limits(); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.create':    { fn: function (p, c) { return AdminService.createYearDb(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.capacity':  { fn: function () { return AdminService.refreshCapacity(); }, perm: PERM.ADMIN_CONFIG },
  'admin.wards.save':      { fn: function (p, c) { return AdminService.saveWards(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.years.test':      { fn: function (p) { return AdminService.testYearDb(p); }, perm: PERM.ADMIN_CONFIG },
  'admin.catalog.saveTest':  { fn: function (p, c) { return AdminService.saveTest(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.catalog.savePanel': { fn: function (p, c) { return AdminService.savePanel(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.doctors.save':    { fn: function (p, c) { return AdminService.saveDoctor(p, c); }, perm: PERM.ADMIN_CONFIG },
  'admin.cache.clear':     { fn: function () { return AdminService.clearCache(); }, perm: PERM.ADMIN_CONFIG }
};

/**
 * sys.batch – nhiều lệnh trong 1 request (giảm số lần gọi mạng ~1s/lần).
 * payload: { calls: [{ action, payload }] } → [{ ok, data } | { ok:false, error }]
 */
ROUTES['sys.batch'] = { fn: function (p, ctx) {
  return (p.calls || []).slice(0, 10).map(function (c) {
    try {
      var r = ROUTES[c.action];
      if (!r || c.action === 'sys.batch' || r.auth === false) throw new AppError('NOT_FOUND', 'Action không hợp lệ trong batch: ' + c.action);
      if (r.perm && !Auth.hasPerm(ctx, r.perm)) throw new AppError('FORBIDDEN', 'Không có quyền: ' + c.action);
      return { ok: true, data: r.fn(c.payload || {}, ctx) };
    } catch (err) {
      return { ok: false, error: { code: err.code || 'SERVER_ERROR', message: err.message } };
    }
  });
} };

function doPost(e) {
  var started = Date.now();
  var req = {};
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var route = ROUTES[req.action];
    if (!route) throw new AppError('NOT_FOUND', 'Action không tồn tại: ' + req.action);

    var ctx = null;
    if (route.auth !== false) {
      ctx = Auth.requireSession(req.token);
      if (route.perm && !Auth.hasPerm(ctx, route.perm)) {
        throw new AppError('FORBIDDEN', 'Tài khoản không có quyền thực hiện chức năng này.');
      }
    }
    var data = route.fn(req.payload || {}, ctx);
    return json_({ ok: true, data: data, reqId: req.reqId, ms: Date.now() - started });
  } catch (err) {
    var code = err && err.code ? err.code : 'SERVER_ERROR';
    if (code === 'SERVER_ERROR') {
      console.error('[%s] %s\n%s', req.action, err && err.message, err && err.stack);
    }
    return json_({
      ok: false,
      error: { code: code, message: (err && err.message) || String(err) },
      reqId: req.reqId, ms: Date.now() - started
    });
  }
}

/** GET = health check (mở URL /exec trên trình duyệt để kiểm tra deploy). */
function doGet() {
  return json_({ ok: true, data: { app: APP.NAME, version: APP.VERSION, time: nowIso_() } });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Typed application error → surfaces to FE with a code. */
function AppError(code, message) {
  this.code = code;
  this.message = message;
  this.stack = (new Error(message)).stack;
}
AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

/* ---- 02_Utils.gs ---- */
/**
 * 02_Utils.gs – Hàm tiện ích dùng chung (thời gian, chuỗi, hash, khóa).
 */

function nowIso_() {
  return Utilities.formatDate(new Date(), APP.TZ, 'yyyy-MM-dd HH:mm:ss');
}

function todayStr_() {
  return Utilities.formatDate(new Date(), APP.TZ, 'yyyy-MM-dd');
}

/** Date | string → 'yyyy-MM-dd' ('' if invalid). */
function toDateStr_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return isNaN(v.getTime()) ? '' : Utilities.formatDate(v, APP.TZ, 'yyyy-MM-dd');
  }
  var s = String(v).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);        // dd/MM/yyyy
  if (m) return m[3] + '-' + pad_(m[2], 2) + '-' + pad_(m[1], 2);
  return '';
}

/** 'yyyy-MM-dd' → Date at local midnight. */
function parseDate_(s) {
  var d = toDateStr_(s);
  if (!d) return null;
  var p = d.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function addDays_(dateStr, n) {
  var d = parseDate_(dateStr);
  if (!d) return '';
  d.setDate(d.getDate() + Number(n || 0));
  return Utilities.formatDate(d, APP.TZ, 'yyyy-MM-dd');
}

function yearOf_(dateStr) {
  var d = toDateStr_(dateStr);
  return d ? Number(d.substring(0, 4)) : null;
}

/** Normalise any cell value read from Sheets to a JSON-safe primitive. */
function cell_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return '';
    var hasTime = v.getHours() || v.getMinutes() || v.getSeconds();
    return Utilities.formatDate(v, APP.TZ, hasTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
  }
  return v;
}

function pad_(n, len) {
  var s = String(n);
  while (s.length < len) s = '0' + s;
  return s;
}

function toNum_(v, dflt) {
  if (v === null || v === undefined || v === '') return (dflt === undefined ? null : dflt);
  var n = Number(String(v).replace(/,/g, '.').replace(/\s/g, ''));
  return isNaN(n) ? (dflt === undefined ? null : dflt) : n;
}

function toBool_(v) {
  if (v === true || v === false) return v;
  var s = String(v).trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES' || s === 'Y' || s === 'X';
}

/** Bỏ dấu tiếng Việt + upper + gộp khoảng trắng → dùng cho tìm kiếm tên. */
function searchKey_(s) {
  if (!s) return '';
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toUpperCase().replace(/\s+/g, ' ').trim();
}

/** Chuẩn hóa SĐT VN: bỏ ký tự lạ, +84 → 0. */
function normPhone_(s) {
  if (!s) return '';
  var d = String(s).replace(/[^\d+]/g, '');
  if (d.indexOf('+84') === 0) d = '0' + d.substring(3);
  else if (d.indexOf('84') === 0 && d.length === 11) d = '0' + d.substring(2);
  d = d.replace(/\+/g, '');
  if (d.length === 9 && /^[235789]/.test(d)) d = '0' + d;   // Sheet tự bỏ số 0 đầu
  return d;
}

/** Viết hoa họ tên chuẩn hiển thị (giữ nguyên dấu). */
function normName_(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function sha256Hex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function randomToken_() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

/** Run fn under the script-wide lock (serialises writes from concurrent users). */
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(SECURITY.LOCK_WAIT_MS)) {
    throw new AppError('BUSY', 'Hệ thống đang bận, vui lòng thử lại sau vài giây.');
  }
  try {
    return fn();
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function required_(obj, fields) {
  fields.forEach(function (f) {
    if (obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === '') {
      throw new AppError('VALIDATION', 'Thiếu thông tin bắt buộc: ' + f);
    }
  });
}

/** Cache helpers with transparent chunking (CacheService limit 100KB/key). */
var CacheUtil = {
  get: function (key) {
    var c = CacheService.getScriptCache();
    var head = c.get(key);
    if (!head) return null;
    try {
      if (head.indexOf('__chunks:') === 0) {
        var n = Number(head.split(':')[1]);
        var keys = [];
        for (var i = 0; i < n; i++) keys.push(key + '_' + i);
        var parts = c.getAll(keys);
        var s = '';
        for (var j = 0; j < n; j++) {
          if (!parts[key + '_' + j]) return null;
          s += parts[key + '_' + j];
        }
        return JSON.parse(s);
      }
      return JSON.parse(head);
    } catch (e) { return null; }
  },
  put: function (key, value, ttl) {
    var c = CacheService.getScriptCache();
    var s = JSON.stringify(value);
    var size = 90000;
    try {
      if (s.length <= size) { c.put(key, s, ttl); return; }
      var map = {};
      var n = Math.ceil(s.length / size);
      for (var i = 0; i < n; i++) map[key + '_' + i] = s.substring(i * size, (i + 1) * size);
      c.putAll(map, ttl);
      c.put(key, '__chunks:' + n, ttl);
    } catch (e) { console.warn('Cache put failed for ' + key + ': ' + e); }
  },
  remove: function (key) {
    var c = CacheService.getScriptCache();
    var head = c.get(key);
    if (head && head.indexOf('__chunks:') === 0) {
      var n = Number(head.split(':')[1]);
      var keys = [];
      for (var i = 0; i < n; i++) keys.push(key + '_' + i);
      c.removeAll(keys);
    }
    c.remove(key);
  }
};

/* ---- 03_Db.gs ---- */
/**
 * 03_Db.gs – Data access layer trên Google Sheets.
 *
 *  - Mở spreadsheet 1 lần / execution (memo).
 *  - Header-driven: map cột theo tên ở hàng 1 → chịu được việc chèn/đổi thứ tự cột.
 *  - Ghi theo block (setValues) thay vì appendRow từng dòng.
 *  - Tìm theo khóa bằng TextFinder (nhanh, không cần đọc cả sheet).
 *  - Định tuyến DB theo năm qua bảng YearDatabases (Mode RW | RO).
 */

var Db = (function () {
  var ssMemo = {};
  var sheetMemo = {};
  var headerMemo = {};

  function propId_(key) {
    var id = PropertiesService.getScriptProperties().getProperty(key);
    if (!id) throw new AppError('CONFIG', 'Chưa cấu hình Script Property ' + key + '. Hãy chạy setup().');
    return id;
  }

  function openById_(id) {
    if (!ssMemo[id]) {
      try {
        ssMemo[id] = SpreadsheetApp.openById(id);
      } catch (e) {
        throw new AppError('DB_UNAVAILABLE', 'Không mở được Google Sheet ' + id + ': ' + e.message);
      }
    }
    return ssMemo[id];
  }

  /**
   * Resolve spreadsheet ID for a table.
   * YEAR tables accept `db` = Spreadsheet ID (định tuyến chính xác) hoặc năm (→ DB đang ghi RW của năm đó).
   */
  function resolveId_(table, db, forWrite) {
    var kind = TABLE_DB[table];
    if (kind === 'CONFIG') return propId_(PROP.CONFIG_DB_ID);
    if (kind === 'PATIENT') return propId_(PROP.PATIENT_DB_ID);
    if (kind === 'YEAR') {
      if (!db) throw new AppError('VALIDATION', 'Thiếu DB năm cho bảng ' + table);
      if (typeof db === 'string' && db.length > 20) {
        var e = YearDb.byId(db);
        if (forWrite && e && e.Mode === DB_MODE.RO) throw new AppError('READ_ONLY', 'Dữ liệu ' + (e.Note || e.Year) + ' đang ở chế độ chỉ đọc.');
        return db;
      }
      var y = forWrite ? YearDb.active(db) : (YearDb.active(db) || YearDb.forYear(db)[0]);
      if (!y) throw new AppError('NO_YEAR_DB', 'Chưa có Google Sheet dữ liệu năm ' + db + ' (Quản trị → Kết nối dữ liệu năm → Tạo DB mới).');
      return y.SpreadsheetId;
    }
    throw new AppError('SERVER_ERROR', 'Bảng không xác định: ' + table);
  }

  /* ---- Read cache cho bảng đọc nhiều (Orders, OrderPanels): CacheService, tự xóa khi có ghi ---- */
  var CACHED_TABLES = {};
  CACHED_TABLES[T.ORDERS] = true;
  CACHED_TABLES[T.ORDER_PANELS] = true;
  function cacheKey_(table, db) { return 'tbl_' + resolveId_(table, db).substring(0, 24) + '_' + table; }
  function invalidate_(table, db) { if (CACHED_TABLES[table]) CacheUtil.remove(cacheKey_(table, db)); }

  function sheet(table, year, forWrite) {
    var id = resolveId_(table, year, forWrite);
    var key = id + '|' + table;
    if (sheetMemo[key]) return sheetMemo[key];
    var ss = openById_(id);
    var sh = ss.getSheetByName(table);
    if (!sh) sh = ensureSheet_(ss, table);
    else {
      // Tự bổ sung cột mới của schema (nâng cấp phiên bản không cần thao tác tay)
      var hdr = header_(sh);
      if (SCHEMA[table].some(function (c) { return !hdr.map.hasOwnProperty(c); })) {
        ensureSheet_(ss, table);
        forgetHeader_(sh);
      }
    }
    sheetMemo[key] = sh;
    return sh;
  }

  /** Create a table sheet with header + plain-text formatting (giữ số 0 đầu SĐT, ngày dạng text). */
  function ensureSheet_(ss, table) {
    var cols = SCHEMA[table];
    var isNew = !ss.getSheetByName(table);
    var sh = isNew ? ss.insertSheet(table) : ss.getSheetByName(table);
    var current = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    var missing = cols.filter(function (c) { return current.indexOf(c) === -1; });
    if (missing.length) {
      var start = current.filter(String).length + 1;
      var need = start + missing.length - 1;
      if (sh.getMaxColumns() < need) sh.insertColumnsAfter(sh.getMaxColumns(), need - sh.getMaxColumns());   // sheet đã cắt gọn cột
      sh.getRange(1, start, 1, missing.length).setValues([missing]);
      if (!isNew) forgetHeader_(sh);
    }
    var width = Math.max(sh.getLastColumn(), cols.length);
    sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#0f4c5c').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    // Plain text for everything, then numeric columns back to number format.
    sh.getRange(1, 1, sh.getMaxRows(), width).setNumberFormat('@');
    var numeric = ['Price', 'GrossAmount', 'Discount', 'NetAmount', 'Amount', 'NumValue', 'Age', 'BirthYear',
                   'Version', 'SortOrder', 'LastValue', 'FollowUpDays', 'PrintCount', 'Year',
                   'RefMinM', 'RefMaxM', 'RefMinF', 'RefMaxF'];
    var header = sh.getRange(1, 1, 1, width).getValues()[0];
    header.forEach(function (h, i) {
      if (numeric.indexOf(h) > -1) sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1).setNumberFormat('General');
    });
    if (isNew) trimSheet_(sh, ROW_BUFFER);   // bảng mới: bỏ cột/dòng trống mặc định (26 cột × 1000 dòng)
    return sh;
  }

  /**
   * Cắt gọn 1 sheet: xóa cột trống bên phải tiêu đề + dòng trống dư dưới dữ liệu (giữ `rowBuffer` dòng trống).
   * Google tính giới hạn 10 triệu ô theo cả ô trống → càng gọn càng chứa được nhiều phiếu / file.
   * Ghi thêm dữ liệu vẫn an toàn: insert/replaceAll/ensureSheet_ tự mở rộng lưới khi cần.
   */
  var ROW_BUFFER = 200;
  /** Cột cuối thật sự cần giữ: tiêu đề + cột có dữ liệu thật (ô chỉ chứa khoảng trắng/chuỗi rỗng coi như trống). */
  function keepWidth_(sh) {
    var lastCol = sh.getLastColumn(), lastRow = sh.getLastRow();
    if (lastCol < 1) return 1;
    var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    var hw = 0;
    head.forEach(function (h, i) { if (String(h).trim() !== '') hw = i + 1; });
    hw = Math.max(1, hw);
    if (lastCol <= hw || lastRow < 1) return Math.max(hw, 1);
    // Cột bên phải tiêu đề: chỉ giữ nếu còn dữ liệu thật (tránh xóa nhầm dữ liệu không có tiêu đề)
    var extra = sh.getRange(1, hw + 1, lastRow, lastCol - hw).getValues(), keep = hw;
    extra.forEach(function (row) { row.forEach(function (v, j) { if (String(v).trim() !== '' && hw + j + 1 > keep) keep = hw + j + 1; }); });
    return keep;
  }
  function trimSheet_(sh, rowBuffer) {
    var before = sh.getMaxRows() * sh.getMaxColumns();
    var width = keepWidth_(sh), maxCol = sh.getMaxColumns();
    if (maxCol > width) sh.deleteColumns(width + 1, maxCol - width);
    var keep = Math.max(2, sh.getLastRow() + (rowBuffer === undefined ? ROW_BUFFER : rowBuffer));
    var maxRow = sh.getMaxRows();
    if (maxRow > keep) sh.deleteRows(keep + 1, maxRow - keep);
    CacheService.getScriptCache().remove('mr_' + sh.getParent().getId() + '|' + sh.getName());
    return before - sh.getMaxRows() * sh.getMaxColumns();
  }

  /** Cắt gọn mọi bảng của hệ thống trong 1 file (bỏ qua tab do người dùng tự thêm). Lỗi 1 sheet không chặn sheet khác. */
  function optimize(id) {
    var ss = openById_(id), freed = 0, before = usedCells(id), sheets = [];
    ss.getSheets().forEach(function (sh) {
      var name = sh.getName();
      if (!SCHEMA[name]) return;
      var info = { sheet: name, rows: sh.getMaxRows(), cols: sh.getMaxColumns() };
      try {
        info.freed = trimSheet_(sh, ROW_BUFFER);
        freed += info.freed;
      } catch (e) { info.error = e.message; }
      info.rowsAfter = sh.getMaxRows(); info.colsAfter = sh.getMaxColumns();
      sheets.push(info);
    });
    var errs = sheets.filter(function (x) { return x.error; });
    return { id: id, name: ss.getName(), before: before, after: before - freed, freed: freed, sheets: sheets,
             error: errs.length ? errs.map(function (x) { return x.sheet + ': ' + x.error; }).join('; ') : undefined };
  }
  function coreIds() { return [propId_(PROP.CONFIG_DB_ID), propId_(PROP.PATIENT_DB_ID)]; }

  /**
   * Header → column index map (0-based).
   * Lưu thêm vào CacheService (1 giờ) → mỗi request không phải đọc lại dòng tiêu đề (tiết kiệm 2 lệnh gọi / bảng).
   * Đổi cấu trúc cột bằng tay trên Sheet → Quản trị → Hệ thống → "Xóa cache" (đổi phiên bản khóa cache tiêu đề).
   */
  var HDR_TTL = 3600;
  var hdrVer_ = null;
  function hdrVersion_() {
    if (hdrVer_ === null) hdrVer_ = PropertiesService.getScriptProperties().getProperty('HDR_VER') || '1';
    return hdrVer_;
  }
  function hdrKey_(sh) { return 'hdr' + hdrVersion_() + '_' + sh.getParent().getId() + '|' + sh.getName(); }
  function header_(sh) {
    var key = sh.getParent().getId() + '|' + sh.getName();
    if (!headerMemo[key]) {
      var ck = hdrKey_(sh), h = null;
      var cached = CacheService.getScriptCache().get(ck);
      if (cached) { try { h = JSON.parse(cached); } catch (e) { h = null; } }
      if (!h) {
        h = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(function (x) { return x === null || x === undefined ? '' : String(x); });
        try { CacheService.getScriptCache().put(ck, JSON.stringify(h), HDR_TTL); } catch (e) { /* header quá dài – bỏ qua cache */ }
      }
      var map = {};
      h.forEach(function (name, i) { if (name) map[String(name).trim()] = i; });
      headerMemo[key] = { map: map, width: h.length, names: h };
    }
    return headerMemo[key];
  }
  function forgetHeader_(sh) {
    delete headerMemo[sh.getParent().getId() + '|' + sh.getName()];
    CacheService.getScriptCache().remove(hdrKey_(sh));
  }
  /** Bỏ toàn bộ cache tiêu đề (đổi phiên bản khóa). */
  function bumpHeaderVersion() {
    var v = String(Number(hdrVersion_()) + 1);
    PropertiesService.getScriptProperties().setProperty('HDR_VER', v);
    hdrVer_ = v; headerMemo = {};
  }
  function colLetter_(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

  function rowToObj_(row, hdr) {
    var o = {};
    for (var name in hdr.map) o[name] = cell_(row[hdr.map[name]]);
    return o;
  }

  function objToRow_(obj, hdr, baseRow) {
    var row = baseRow ? baseRow.slice() : new Array(hdr.width).fill('');
    for (var name in obj) {
      if (hdr.map.hasOwnProperty(name)) {
        var v = obj[name];
        row[hdr.map[name]] = (v === null || v === undefined) ? '' : v;
      }
    }
    return row;
  }

  /** Read whole table → array of objects (each has hidden _row). Orders/OrderPanels được cache. */
  function readAll(table, db) {
    var key = CACHED_TABLES[table] ? cacheKey_(table, db) : null;
    if (key) {
      var hit = CacheUtil.get(key);
      if (hit) return hit.map(function (o) { var r = o.__r; delete o.__r; Object.defineProperty(o, '_row', { value: r, enumerable: false }); return o; });
    }
    var sh = sheet(table, db);
    var last = sh.getLastRow();
    if (last < 2) return [];
    var hdr = header_(sh);
    var values = sh.getRange(2, 1, last - 1, hdr.width).getValues();
    var out = [];
    for (var i = 0; i < values.length; i++) {
      var r = values[i];
      if (r.join('') === '') continue;
      var o = rowToObj_(r, hdr);
      Object.defineProperty(o, '_row', { value: i + 2, enumerable: false });
      out.push(o);
    }
    if (key) CacheUtil.put(key, out.map(function (o) { var c = Object.assign({}, o); c.__r = o._row; return c; }), CACHE.TTL_LONG);
    return out;
  }

  /** Read selected columns only (much faster for wide tables). */
  function readColumns(table, year, columns) {
    if (CACHED_TABLES[table]) {
      return readAll(table, year).map(function (o) {
        var x = {};
        columns.forEach(function (c) { x[c] = o[c]; });
        Object.defineProperty(x, '_row', { value: o._row, enumerable: false });
        return x;
      });
    }
    var sh = sheet(table, year);
    var last = sh.getLastRow();
    if (last < 2) return [];
    var hdr = header_(sh);
    var idx = columns.map(function (c) {
      if (!hdr.map.hasOwnProperty(c)) throw new AppError('SERVER_ERROR', 'Thiếu cột ' + c + ' trong ' + table);
      return hdr.map[c];
    });
    var minC = Math.min.apply(null, idx), maxC = Math.max.apply(null, idx);
    var values = sh.getRange(2, minC + 1, last - 1, maxC - minC + 1).getValues();
    return values.map(function (r, i) {
      var o = {};
      columns.forEach(function (c, k) { o[c] = cell_(r[idx[k] - minC]); });
      Object.defineProperty(o, '_row', { value: i + 2, enumerable: false });
      return o;
    });
  }

  /** Row numbers where `column` exactly equals `value` (TextFinder). */
  function findRowNums(table, year, column, value) {
    if (value === '' || value === null || value === undefined) return [];
    var sh = sheet(table, year);
    var hdr = header_(sh);
    if (!hdr.map.hasOwnProperty(column)) throw new AppError('SERVER_ERROR', 'Thiếu cột ' + column + ' trong ' + table);
    var col = colLetter_(hdr.map[column] + 1);
    var rng = sh.getRange(col + '2:' + col);   // cột mở – không cần hỏi dòng cuối (tiết kiệm 1 lệnh gọi)
    return rng.createTextFinder(String(value)).matchEntireCell(true).matchCase(false).findAll()
      .map(function (r) { return r.getRow(); });
  }

  /** Bảng có cache (Orders, OrderPanels) đang nằm sẵn trong CacheService → lọc trong bộ nhớ, 0 lệnh gọi Sheets. */
  function cachedRows_(table, db) {
    if (!CACHED_TABLES[table]) return null;
    var hit = CacheUtil.get(cacheKey_(table, db));
    if (!hit) return null;
    return hit.map(function (o) { var r = o.__r; delete o.__r; Object.defineProperty(o, '_row', { value: r, enumerable: false }); return o; });
  }

  /** Objects where column == value. Reads the minimal contiguous block covering matches. */
  function findBy(table, year, column, value) {
    var mem = cachedRows_(table, year);
    if (mem) {
      var want = String(value).toLowerCase();
      return mem.filter(function (o) { return String(o[column]).toLowerCase() === want; });
    }
    var rows = findRowNums(table, year, column, value);
    if (!rows.length) return [];
    var sh = sheet(table, year);
    var hdr = header_(sh);
    var minR = Math.min.apply(null, rows), maxR = Math.max.apply(null, rows);
    var span = maxR - minR + 1;
    var out = [];
    var target = {};
    rows.forEach(function (r) { target[r] = true; });
    if (span <= rows.length * 4 || span <= 400) {
      var block = sh.getRange(minR, 1, span, hdr.width).getValues();
      block.forEach(function (r, i) {
        if (target[minR + i]) {
          var o = rowToObj_(r, hdr);
          Object.defineProperty(o, '_row', { value: minR + i, enumerable: false });
          out.push(o);
        }
      });
    } else {
      // Scattered → read whole table once and filter (cheaper than N round-trips).
      readAll(table, year).forEach(function (o) { if (target[o._row]) out.push(o); });
    }
    return out;
  }

  function findOne(table, year, column, value) {
    var r = findBy(table, year, column, value);
    return r.length ? r[0] : null;
  }

  /** Append objects as one block. */
  function insert(table, year, objs) {
    if (!objs || !objs.length) return;
    var sh = sheet(table, year, true);
    var hdr = header_(sh);
    var rows = objs.map(function (o) { return objToRow_(o, hdr); });
    var start = sh.getLastRow() + 1, need = start + rows.length - 1;
    // Nhớ số dòng tối đa của lưới (CacheService) → không phải hỏi getMaxRows mỗi lần ghi; sai lệch (ai đó xóa dòng tay) → bắt lỗi, đo lại, ghi lại
    var mk = 'mr_' + sh.getParent().getId() + '|' + sh.getName(), cache = CacheService.getScriptCache();
    var maxR = Number(cache.get(mk) || 0);
    if (!maxR || need > maxR) {
      maxR = sh.getMaxRows();
      if (need > maxR) { sh.insertRowsAfter(maxR, need - maxR + ROW_BUFFER); maxR = need + ROW_BUFFER; }
      cache.put(mk, String(maxR), 21600);
    }
    try {
      sh.getRange(start, 1, rows.length, hdr.width).setValues(rows);
    } catch (e) {
      cache.remove(mk);
      var real = sh.getMaxRows();
      if (need <= real) throw e;
      sh.insertRowsAfter(real, need - real + ROW_BUFFER);
      sh.getRange(start, 1, rows.length, hdr.width).setValues(rows);
    }
    invalidate_(table, year);
    if (table === T.ORDERS || table === T.RESULTS) RowCounter.note(resolveId_(table, year, true), table, start + rows.length - 2);   // số dòng dữ liệu, không tốn thêm lệnh gọi Sheets
  }

  /** Update a single row (merge `patch` onto existing values). */
  function updateRow(table, year, rowNum, patch) {
    var sh = sheet(table, year, true);
    var hdr = header_(sh);
    var cur = sh.getRange(rowNum, 1, 1, hdr.width).getValues()[0];
    sh.getRange(rowNum, 1, 1, hdr.width).setValues([objToRow_(patch, hdr, cur)]);
    invalidate_(table, year);
  }

  /** Batch update many rows: [{row, patch}] – one read + one write over the covering block. */
  function updateRows(table, year, items) {
    if (!items.length) return;
    var sh = sheet(table, year, true);
    var hdr = header_(sh);
    var minR = Math.min.apply(null, items.map(function (i) { return i.row; }));
    var maxR = Math.max.apply(null, items.map(function (i) { return i.row; }));
    var rng = sh.getRange(minR, 1, maxR - minR + 1, hdr.width);
    var block = rng.getValues();
    items.forEach(function (it) { block[it.row - minR] = objToRow_(it.patch, hdr, block[it.row - minR]); });
    rng.setValues(block);
    invalidate_(table, year);
  }

  function deleteRows(table, year, rowNums) {
    var sh = sheet(table, year, true);
    rowNums.slice().sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
    if (rowNums.length) invalidate_(table, year);
  }

  /** Replace whole table content (used by admin catalog save & setup). */
  function replaceAll(table, year, objs) {
    var sh = sheet(table, year, true);
    var hdr = header_(sh);
    var last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, hdr.width).clearContent();
    if (objs.length + 1 > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), objs.length + 1 - sh.getMaxRows() + ROW_BUFFER);
    if (objs.length) sh.getRange(2, 1, objs.length, hdr.width).setValues(objs.map(function (o) { return objToRow_(o, hdr); }));
    invalidate_(table, year);
  }

  /** Số ô đang chiếm của 1 spreadsheet (giới hạn Google: 10 triệu ô / file). */
  function usedCells(id) {
    return openById_(id).getSheets().reduce(function (s, sh) { return s + sh.getMaxRows() * sh.getMaxColumns(); }, 0);
  }

  return {
    sheet: sheet,
    ensureSheet: ensureSheet_,
    openById: openById_,
    readAll: readAll,
    readColumns: readColumns,
    findRowNums: findRowNums,
    findBy: findBy,
    findOne: findOne,
    insert: insert,
    updateRow: updateRow,
    updateRows: updateRows,
    deleteRows: deleteRows,
    replaceAll: replaceAll,
    usedCells: usedCells,
    bumpHeaderVersion: bumpHeaderVersion,
    _resetMemo: function () { ssMemo = {}; sheetMemo = {}; headerMemo = {}; },   // mỗi request GAS là 1 lượt thực thi mới (dùng cho đo hiệu năng)
    trimSheet: trimSheet_,
    optimize: optimize,
    coreIds: coreIds,
    invalidate: invalidate_
  };
})();

/**
 * Year database registry (YearDatabases – CONFIG DB, cached).
 *  - Mỗi năm có ≥ 1 DB. Đúng 1 DB ở Mode RW nhận phiếu mới; DB cũ đầy → FULL (vẫn sửa được phiếu cũ); khóa sổ → RO.
 *  - Phiếu XN-YYMMDD-NNN → năm 20YY → các DB của năm → tìm DB chứa phiếu (cache vị trí).
 *  - Sang năm mới / DB đầy → tự tạo Google Sheet DB_<năm>[_n] cạnh DB cũ (ensureActive).
 */
var YearDb = {
  all: function () {
    var cached = CacheUtil.get(CACHE.YEAR_DBS);
    if (cached) return cached;
    var rows = Db.readAll(T.YEAR_DBS).map(function (r) {
      return { Year: Number(r.Year), SpreadsheetId: String(r.SpreadsheetId).trim(), Mode: String(r.Mode || 'RW').toUpperCase(),
               Note: r.Note, UsedCells: toNum_(r.UsedCells, 0), CheckedAt: r.CheckedAt,
               OrderRows: toNum_(r.OrderRows, 0), ResultRows: toNum_(r.ResultRows, 0) };
    }).filter(function (r) { return r.Year && r.SpreadsheetId; });
    rows.sort(function (a, b) { return a.Year - b.Year; });
    CacheUtil.put(CACHE.YEAR_DBS, rows, CACHE.TTL_LONG);
    return rows;
  },
  byId: function (id) { return YearDb.all().filter(function (r) { return r.SpreadsheetId === id; })[0] || null; },
  forYear: function (year) { var y = Number(year); return YearDb.all().filter(function (r) { return r.Year === y; }); },
  /** DB đang nhận phiếu mới của năm (RW, bản mới nhất). */
  active: function (year) {
    var rw = YearDb.forYear(year).filter(function (r) { return r.Mode === DB_MODE.RW; });
    return rw.length ? rw[rw.length - 1] : null;
  },
  /** Backward-compatible alias. */
  get: function (year) { return YearDb.active(year) || YearDb.forYear(year)[0] || null; },
  /** Spreadsheet IDs có dữ liệu giao với [from, to]. */
  idsInRange: function (from, to) {
    var a = yearOf_(from) || 1900, b = yearOf_(to) || 9999;
    return YearDb.all().filter(function (r) { return r.Year >= a && r.Year <= b; }).map(function (r) { return r.SpreadsheetId; });
  },
  allIds: function () { return YearDb.all().map(function (r) { return r.SpreadsheetId; }); },
  yearsInRange: function (from, to) {
    var a = yearOf_(from) || 1900, b = yearOf_(to) || 9999;
    var seen = {};
    return YearDb.all().map(function (r) { return r.Year; }).filter(function (y) { if (seen[y] || y < a || y > b) return false; seen[y] = true; return true; });
  },
  yearFromOrderId: function (orderId) {
    var m = String(orderId || '').match(/^XN-(\d{2})\d{4}-\d+$/i);
    return m ? 2000 + Number(m[1]) : null;
  },
  /** Spreadsheet ID chứa phiếu (1 DB/năm → trả ngay; nhiều DB → TextFinder + cache vị trí). */
  locateOrder: function (orderId) {
    var y = YearDb.yearFromOrderId(orderId);
    if (!y) throw new AppError('VALIDATION', 'Mã phiếu không đúng định dạng XN-YYMMDD-NNN: ' + orderId);
    var list = YearDb.forYear(y);
    if (!list.length) throw new AppError('NO_YEAR_DB', 'Chưa có DB dữ liệu năm ' + y);
    if (list.length === 1) return list[0].SpreadsheetId;
    var c = CacheService.getScriptCache(), key = 'loc_' + orderId;
    var hit = c.get(key);
    if (hit) return hit;
    for (var i = list.length - 1; i >= 0; i--) {
      if (Db.findRowNums(T.ORDERS, list[i].SpreadsheetId, 'OrderID', orderId).length) {
        c.put(key, list[i].SpreadsheetId, CACHE.TTL_LONG);
        return list[i].SpreadsheetId;
      }
    }
    throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + orderId);
  },
  /**
   * DB RW cho năm `year` (gọi trong withLock_). Chưa có → tự tạo nếu AUTO_CREATE_YEAR_DB = TRUE.
   * DB RW vượt ngưỡng dung lượng → tạo DB nối tiếp, DB cũ chuyển FULL.
   */
  ensureActive: function (year) {
    var act = YearDb.active(year);
    var list = YearDb.forYear(year);
    if (!act && list.some(function (r) { return r.Mode === DB_MODE.RO; })) {
      throw new AppError('READ_ONLY', 'Dữ liệu năm ' + year + ' đã khóa sổ (chỉ đọc). Không thể tạo phiếu mới cho năm này.');
    }
    var auto = String(Settings.get('AUTO_CREATE_YEAR_DB', 'TRUE')).toUpperCase() !== 'FALSE';
    if (act) {
      if (!auto || !YearDb.isFull(act)) return act.SpreadsheetId;
    }
    if (!auto) throw new AppError('NO_YEAR_DB', 'Chưa có DB năm ' + year + '. Admin vào Quản trị → Kết nối dữ liệu năm → Tạo DB mới.');
    return YearDb.create(year, 'system').SpreadsheetId;
  },
  /** Ngưỡng tạo DB nối tiếp (Settings, 0 = không giới hạn theo dòng). */
  limits: function () {
    var n = function (k, d) { var v = Number(String(Settings.get(k, '')).replace(/[^\d]/g, '')); return isFinite(v) && String(Settings.get(k, '')).trim() !== '' ? v : d; };
    return { orders: n('DB_MAX_ORDER_ROWS', CAPACITY.DEFAULT_MAX_ORDER_ROWS), results: n('DB_MAX_RESULT_ROWS', CAPACITY.DEFAULT_MAX_RESULT_ROWS) };
  },
  /** Số dòng dữ liệu thực của Orders / Results trong 1 DB (đọc trực tiếp – nhanh, không tải dữ liệu). */
  rowCounts: function (id) {
    var ss = Db.openById(id);
    var cnt = function (t) { var sh = ss.getSheetByName(t); return sh ? Math.max(0, sh.getLastRow() - 1) : 0; };
    return { orders: cnt(T.ORDERS), results: cnt(T.RESULTS) };
  },
  /** DB đang ghi đã chạm ngưỡng: số ô ≥ 85% HOẶC Orders/Results vượt số dòng tối đa. */
  isFull: function (db) {
    if (db.UsedCells / CAPACITY.MAX_CELLS * 100 >= CAPACITY.ROLLOVER_PERCENT) return true;
    var lim = YearDb.limits();
    if (!lim.orders && !lim.results) return false;
    var over = function (c, ratio) { return (lim.orders > 0 && c.orders >= lim.orders * ratio) || (lim.results > 0 && c.results >= lim.results * ratio); };
    var rc = RowCounter.get(db.SpreadsheetId);
    if (rc) return over(rc, 1);                       // đường nhanh: 0 lệnh gọi Google Sheets
    var reg = { orders: db.OrderRows || 0, results: db.ResultRows || 0 };
    if (!over(reg, 0.9)) return false;                // còn xa ngưỡng theo số đo gần nhất → khỏi đếm
    try { rc = YearDb.rowCounts(db.SpreadsheetId); } catch (e) { return false; }   // gần ngưỡng: đếm thật 1 lần rồi lưu cache
    RowCounter.set(db.SpreadsheetId, rc);
    return over(rc, 1);
  },
  /** Tạo Google Sheet DB mới cho năm, đặt cùng thư mục với DB gần nhất, đăng ký RW. */
  create: function (year, username) {
    year = Number(year);
    var same = YearDb.forYear(year);
    var name = 'DB_' + year + (same.length ? '_' + (same.length + 1) : '');
    var ss = SpreadsheetApp.create(name);
    var file = DriveApp.getFileById(ss.getId());
    var ref = YearDb.all().slice(-1)[0];
    try {
      if (ref) {
        var parents = DriveApp.getFileById(ref.SpreadsheetId).getParents();
        if (parents.hasNext()) file.moveTo(parents.next());
      }
    } catch (e) { console.warn('Không chuyển được thư mục DB mới: ' + e.message); }
    [T.ORDERS, T.ORDER_PANELS, T.RESULTS, T.AUDIT].forEach(function (t) { Db.ensureSheet(ss, t); });
    var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
    if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
    // DB RW cũ cùng năm → FULL
    Db.readAll(T.YEAR_DBS).forEach(function (r) {
      if (Number(r.Year) === year && String(r.Mode).toUpperCase() === DB_MODE.RW) Db.updateRow(T.YEAR_DBS, null, r._row, { Mode: DB_MODE.FULL });
    });
    var row = { Year: year, SpreadsheetId: ss.getId(), Mode: DB_MODE.RW, Note: name, UsedCells: Db.usedCells(ss.getId()), CheckedAt: nowIso_(), OrderRows: 0, ResultRows: 0 };
    RowCounter.set(ss.getId(), { orders: 0, results: 0 });
    Db.insert(T.YEAR_DBS, null, [row]);
    YearDb.invalidate();
    SysLog.write(username || 'system', 'YEAR_DB_CREATE', 'YearDatabase', name, { id: ss.getId(), url: ss.getUrl() });
    return row;
  },
  /** Cập nhật dung lượng các DB (maintenance trigger / Admin). */
  refreshCapacity: function () {
    var rows = Db.readAll(T.YEAR_DBS);
    var items = rows.map(function (r) {
      var used = '', patch = { CheckedAt: nowIso_() };
      try {
        var id = String(r.SpreadsheetId).trim();
        used = Db.usedCells(id);
        patch.Note = Db.openById(id).getName();   // đồng bộ tên khi file bị đổi tên trực tiếp trên Drive
        var rc = YearDb.rowCounts(id);
        patch.OrderRows = rc.orders; patch.ResultRows = rc.results;
        RowCounter.set(id, rc);
      } catch (e) { used = ''; }
      patch.UsedCells = used;
      return { row: r._row, patch: patch };
    });
    Db.updateRows(T.YEAR_DBS, null, items);
    YearDb.invalidate();
    return YearDb.all();
  },
  invalidate: function () { CacheUtil.remove(CACHE.YEAR_DBS); }
};

/**
 * Bộ đếm số dòng Orders/Results của từng DB năm (CacheService, 6 giờ).
 *  - Cập nhật miễn phí mỗi lần Db.insert (đã biết vị trí dòng cuối) → kiểm tra ngưỡng không cần gọi Google Sheets.
 *  - Mất cache → dùng số liệu đo lúc 01:00 / "Đo dung lượng" trong YearDatabases; chỉ đếm thật khi đã gần ngưỡng (≥ 90%).
 */
var RowCounter = {
  TTL: 21600,
  key_: function (id) { return 'rc_' + id; },
  get: function (id) {
    var v = CacheService.getScriptCache().get(RowCounter.key_(id));
    return v ? JSON.parse(v) : null;
  },
  set: function (id, counts) {
    CacheService.getScriptCache().put(RowCounter.key_(id), JSON.stringify({ orders: counts.orders || 0, results: counts.results || 0 }), RowCounter.TTL);
  },
  note: function (id, table, rows) {
    var c = RowCounter.get(id);
    if (!c) {
      var e = YearDb.byId(id);
      c = { orders: e ? e.OrderRows : 0, results: e ? e.ResultRows : 0 };
    }
    c[table === T.ORDERS ? 'orders' : 'results'] = Math.max(0, rows);
    RowCounter.set(id, c);
  }
};

/** Sequences – atomic counters (call inside withLock_). */
var Sequence = {
  /**
   * Bộ đếm số BN / số phiếu – lưu ở ScriptProperties (không phải lệnh gọi Google Sheets, không cần mở file Config).
   * Gọi trong withLock_. Lần đầu (chưa có property) lấy giá trị từ sheet Sequences; mỗi đêm đồng bộ ngược vào sheet.
   */
  PREFIX: 'SEQ_',
  next: function (seqKey) {
    var props = PropertiesService.getScriptProperties(), k = Sequence.PREFIX + seqKey;
    var v = props.getProperty(k);
    if (v === null) {
      var row = Db.findOne(T.SEQUENCES, null, 'SeqKey', seqKey);
      v = row ? Number(row.LastValue || 0) : 0;
    }
    var val = Number(v) + 1;
    props.setProperty(k, String(val));
    return val;
  },
  /** Make sure the counter is at least `min` (used by migration). */
  ensureAtLeast: function (seqKey, min) {
    var props = PropertiesService.getScriptProperties(), k = Sequence.PREFIX + seqKey;
    var row = Db.findOne(T.SEQUENCES, null, 'SeqKey', seqKey);
    var cur = Math.max(Number(props.getProperty(k) || 0), row ? Number(row.LastValue || 0) : 0);
    if (cur < min) cur = min;
    props.setProperty(k, String(cur));
    if (!row) Db.insert(T.SEQUENCES, null, [{ SeqKey: seqKey, LastValue: cur, UpdatedAt: nowIso_() }]);
    else if (Number(row.LastValue) !== cur) Db.updateRow(T.SEQUENCES, null, row._row, { LastValue: cur, UpdatedAt: nowIso_() });
  },
  /**
   * Ghi bộ đếm vào sheet Sequences (bản sao để xem/sao lưu) và dọn bộ đếm theo ngày đã qua (> 3 ngày) khỏi ScriptProperties.
   * Phiếu nhập lùi ngày vẫn đúng số: thiếu property → đọc lại từ sheet. Gọi trong withLock_ (maintenance 01:00).
   */
  syncToSheet: function () {
    var props = PropertiesService.getScriptProperties(), all = props.getProperties();
    var keys = Object.keys(all).filter(function (k) { return k.indexOf(Sequence.PREFIX) === 0; });
    if (!keys.length) return 0;
    var rows = Db.readAll(T.SEQUENCES), byKey = {};
    rows.forEach(function (r) { byKey[String(r.SeqKey)] = r; });
    var updates = [], inserts = [], now = nowIso_();
    keys.forEach(function (k) {
      var seq = k.substring(Sequence.PREFIX.length), val = Number(all[k]);
      var r = byKey[seq];
      if (!r) inserts.push({ SeqKey: seq, LastValue: val, UpdatedAt: now });
      else if (Number(r.LastValue) < val) updates.push({ row: r._row, patch: { LastValue: val, UpdatedAt: now } });
    });
    if (updates.length) Db.updateRows(T.SEQUENCES, null, updates);
    if (inserts.length) Db.insert(T.SEQUENCES, null, inserts);
    var cutoff = addDays_(todayStr_(), -3).replace(/-/g, '').substring(2);   // YYMMDD
    keys.forEach(function (k) {
      var m = k.match(/^SEQ_XN-(\d{6})$/);
      if (m && m[1] < cutoff) props.deleteProperty(k);
    });
    return keys.length;
  }
};
var Ids = {
  /** BN-000001 */
  newPatientId: function () { return 'BN-' + pad_(Sequence.next('BN'), 6); },
  /** XN-YYMMDD-NNN */
  newOrderId: function (orderDate) {
    var d = toDateStr_(orderDate) || todayStr_();
    var ymd = d.substring(2, 4) + d.substring(5, 7) + d.substring(8, 10);
    return 'XN-' + ymd + '-' + pad_(Sequence.next('XN-' + ymd), 3);
  }
};

/* ---- 04_Auth.gs ---- */
/**
 * 04_Auth.gs – Xác thực, phiên đăng nhập, phân quyền (RBAC), Settings.
 *
 *  - Mật khẩu: SHA-256(salt + password) lặp N lần, salt ngẫu nhiên / user.
 *  - Phiên: token ngẫu nhiên 64 hex lưu CacheService (TTL tối đa 6h, gia hạn trượt).
 *  - Quyền: lấy theo Role tại mỗi request → đổi quyền role có hiệu lực ngay.
 *  - Chống dò mật khẩu: khóa 5 phút sau 5 lần sai.
 */

var Settings = {
  _memo: null,
  all: function () {
    if (Settings._memo) return Settings._memo;
    var c = CacheUtil.get(CACHE.SETTINGS);
    if (c) return (Settings._memo = c);
    var map = {};
    Db.readAll(T.SETTINGS).forEach(function (r) { if (r.Key) map[String(r.Key).trim()] = r.Value; });
    CacheUtil.put(CACHE.SETTINGS, map, CACHE.TTL_LONG);
    return (Settings._memo = map);
  },
  get: function (key, dflt) {
    var v = Settings.all()[key];
    return (v === undefined || v === '') ? dflt : v;
  },
  getPublic: function () {
    var all = Settings.all(), out = {};
    PUBLIC_SETTING_KEYS.forEach(function (k) { out[k] = all[k] || ''; });
    out.APP_VERSION = APP.VERSION;
    return out;
  },
  invalidate: function () { Settings._memo = null; CacheUtil.remove(CACHE.SETTINGS); }
};

var Roles = {
  all: function () {
    var c = CacheUtil.get(CACHE.ROLES);
    if (c) return c;
    var rows = Db.readAll(T.ROLES).map(function (r) {
      return {
        RoleCode: String(r.RoleCode).trim(), RoleName: r.RoleName, IsSystem: toBool_(r.IsSystem),
        Permissions: String(r.Permissions || '').split(',').map(function (s) { return s.trim(); }).filter(String)
      };
    });
    CacheUtil.put(CACHE.ROLES, rows, CACHE.TTL_LONG);
    return rows;
  },
  get: function (code) { return Roles.all().filter(function (r) { return r.RoleCode === code; })[0] || null; },
  invalidate: function () { CacheUtil.remove(CACHE.ROLES); }
};

var Auth = {
  hash: function (password, salt) {
    var h = salt + '|' + password;
    for (var i = 0; i < SECURITY.HASH_ITERATIONS; i++) h = sha256Hex_(salt + h);
    return h;
  },

  newSalt: function () { return Utilities.getUuid().replace(/-/g, ''); },

  sessionTtl_: function () {
    var hours = toNum_(Settings.get('SESSION_HOURS', SECURITY.DEFAULT_SESSION_HOURS), SECURITY.DEFAULT_SESSION_HOURS);
    return Math.min(21600, Math.max(900, Math.round(hours * 3600)));
  },

  login: function (p) {
    required_(p, ['username', 'password']);
    var username = String(p.username).trim().toLowerCase();
    var cache = CacheService.getScriptCache();
    var failKey = CACHE.LOGIN_FAIL_PREFIX + username;
    var fails = Number(cache.get(failKey) || 0);
    if (fails >= SECURITY.MAX_LOGIN_FAILS) {
      throw new AppError('LOCKED', 'Tài khoản tạm khóa do đăng nhập sai nhiều lần. Thử lại sau 5 phút.');
    }

    var user = Db.findOne(T.USERS, null, 'Username', username);
    var ok = user && toBool_(user.IsActive) && Auth.hash(String(p.password), String(user.Salt)) === String(user.PasswordHash);
    if (!ok) {
      cache.put(failKey, String(fails + 1), SECURITY.LOCKOUT_SECONDS);
      SysLog.write(username, 'LOGIN_FAILED', 'User', username, {});
      throw new AppError('INVALID_LOGIN', 'Sai tên đăng nhập hoặc mật khẩu.');
    }
    cache.remove(failKey);

    var role = Roles.get(String(user.RoleCode));
    if (!role) throw new AppError('FORBIDDEN', 'Vai trò của tài khoản không tồn tại: ' + user.RoleCode);

    var token = randomToken_();
    var session = { u: username, n: user.FullName, r: role.RoleCode, t: Date.now() };
    var ttl = Auth.sessionTtl_();
    cache.put(CACHE.SESSION_PREFIX + token, JSON.stringify(session), ttl);
    Auth.trackToken_(username, token, ttl);

    Db.updateRow(T.USERS, null, user._row, { LastLoginAt: nowIso_() });
    SysLog.write(username, 'LOGIN', 'User', username, {});

    var ctx = Auth.buildCtx_(session, token);
    return Auth.bootstrap_(ctx, toBool_(user.MustChangePassword));
  },

  /** Payload FE needs right after login / reload: profile, permissions, menu, settings, catalog. */
  bootstrap_: function (ctx, mustChange) {
    return {
      token: ctx.token,
      user: { username: ctx.username, fullName: ctx.fullName, role: ctx.role, roleName: ctx.roleName, mustChangePassword: !!mustChange },
      permissions: ctx.perms,
      menu: MENU.filter(function (m) { return Auth.hasPerm(ctx, m.perm); }),
      settings: Settings.all(),
      years: YearDb.all().map(function (y) {
        return { Year: y.Year, Mode: y.Mode, Note: y.Note, UsedPercent: Math.round(y.UsedCells / CAPACITY.MAX_CELLS * 1000) / 10 };
      }),
      capacityWarnPercent: CAPACITY.WARN_PERCENT,
      catalog: Catalog.get()
    };
  },

  me: function (ctx) {
    var user = Db.findOne(T.USERS, null, 'Username', ctx.username);
    return Auth.bootstrap_(ctx, user && toBool_(user.MustChangePassword));
  },

  logout: function (ctx) {
    CacheService.getScriptCache().remove(CACHE.SESSION_PREFIX + ctx.token);
    SysLog.write(ctx.username, 'LOGOUT', 'User', ctx.username, {});
    return true;
  },

  requireSession: function (token) {
    if (!token) throw new AppError('UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ.');
    var cache = CacheService.getScriptCache();
    var raw = cache.get(CACHE.SESSION_PREFIX + token);
    if (!raw) throw new AppError('UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    var s = JSON.parse(raw);
    // Sliding renewal at most every 10 minutes.
    if (Date.now() - s.t > 600000) {
      s.t = Date.now();
      cache.put(CACHE.SESSION_PREFIX + token, JSON.stringify(s), Auth.sessionTtl_());
    }
    return Auth.buildCtx_(s, token);
  },

  buildCtx_: function (s, token) {
    var role = Roles.get(s.r);
    if (!role) throw new AppError('UNAUTHORIZED', 'Vai trò không còn tồn tại.');
    return { token: token, username: s.u, fullName: s.n, role: role.RoleCode, roleName: role.RoleName, perms: role.Permissions };
  },

  /** spec: 'a' | 'a|b' (any-of). '*' = full access. */
  hasPerm: function (ctx, spec) {
    if (!ctx) return false;
    if (ctx.perms.indexOf('*') > -1) return true;
    return String(spec).split('|').some(function (p) { return ctx.perms.indexOf(p) > -1; });
  },

  assertPerm: function (ctx, spec) {
    if (!Auth.hasPerm(ctx, spec)) throw new AppError('FORBIDDEN', 'Tài khoản không có quyền: ' + spec);
  },

  changePassword: function (p, ctx) {
    required_(p, ['oldPassword', 'newPassword']);
    Auth.validatePassword_(p.newPassword);
    return withLock_(function () {
      var user = Db.findOne(T.USERS, null, 'Username', ctx.username);
      if (!user || Auth.hash(String(p.oldPassword), String(user.Salt)) !== String(user.PasswordHash)) {
        throw new AppError('VALIDATION', 'Mật khẩu hiện tại không đúng.');
      }
      var salt = Auth.newSalt();
      Db.updateRow(T.USERS, null, user._row, {
        Salt: salt, PasswordHash: Auth.hash(String(p.newPassword), salt), MustChangePassword: false, UpdatedAt: nowIso_()
      });
      SysLog.write(ctx.username, 'CHANGE_PASSWORD', 'User', ctx.username, {});
      return true;
    });
  },

  validatePassword_: function (pw) {
    if (!pw || String(pw).length < 6) throw new AppError('VALIDATION', 'Mật khẩu tối thiểu 6 ký tự.');
  },

  /** Keep list of tokens per user so admin can revoke all sessions. */
  trackToken_: function (username, token, ttl) {
    var cache = CacheService.getScriptCache();
    var key = 'usess_' + username;
    var list = JSON.parse(cache.get(key) || '[]');
    list.push(token);
    if (list.length > 20) list = list.slice(-20);
    cache.put(key, JSON.stringify(list), 21600);
  },

  revokeUser: function (username) {
    var cache = CacheService.getScriptCache();
    var key = 'usess_' + username;
    var list = JSON.parse(cache.get(key) || '[]');
    if (list.length) cache.removeAll(list.map(function (t) { return CACHE.SESSION_PREFIX + t; }));
    cache.remove(key);
  }
};

/* ---- 05_Catalog_Audit.gs ---- */
/**
 * 05_Catalog_Audit.gs – Danh mục (nhóm XN, chỉ số, bác sĩ, lookup) + Nhật ký hệ thống.
 */

/**
 * Chỉ số tự tính (theo file gốc Mrs Hồng.xls – sheet Diary book):
 *  - LDL-C (cột AT): Friedewald = Cholesterol − HDL − Triglycerid/2.2 (mmol/l), cần đủ 3 giá trị > 0.
 *  - eGFR  (cột AX/AY): CKD-EPI 2021 từ Creatinin (µmol/l), giới, tuổi.
 *      eGFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^Tuổi × (1.012 nếu Nữ)
 *      Scr = Creatinin/88.4 (mg/dl); κ = 0.7 (Nữ) / 0.9 (Nam); α = −0.241 (Nữ) / −0.302 (Nam).
 *      (File cũ ghi 0.742 ở vế MIN cho Nữ – đã thống nhất dùng κ = 0.7 theo chuẩn.)
 *  Chọn chỉ số tự tính → bắt buộc chọn các chỉ số trung gian. Giá trị do server tính, không nhập tay.
 */
var CALC = {
  LDL_FRIEDEWALD: {
    deps: ['TG', 'CHOL', 'HDL'], decimals: 2, label: 'Cholesterol − HDL − Triglycerid/2.2',
    fn: function (v) {
      if (!(v.TG > 0 && v.CHOL > 0 && v.HDL > 0)) return null;
      var r = v.CHOL - v.HDL - v.TG / 2.2;
      return r > 0 ? r : null;
    }
  },
  EGFR_CKD_EPI_2021: {
    deps: ['CREA'], decimals: 0, needsAge: true, label: 'CKD-EPI 2021 (Creatinin, giới, tuổi)',
    fn: function (v, c) {
      if (!(v.CREA > 0) || !(c.age > 0)) return null;
      var k = c.female ? 0.7 : 0.9, a = c.female ? -0.241 : -0.302;
      var s = v.CREA / 88.4 / k;
      return 142 * Math.pow(Math.min(s, 1), a) * Math.pow(Math.max(s, 1), -1.2) * Math.pow(0.9938, c.age) * (c.female ? 1.012 : 1);
    }
  }
};
var DEFAULT_FORMULA = { LDL: 'LDL_FRIEDEWALD', EGFR: 'EGFR_CKD_EPI_2021' };

var Calc = {
  formulaOf: function (testCode) {
    var t = Catalog.testMap()[testCode];
    var f = t ? t.Formula : DEFAULT_FORMULA[testCode];
    return f && CALC[f] ? CALC[f] : null;
  },
  deps: function (testCode) { var f = Calc.formulaOf(testCode); return f ? f.deps.slice() : []; },
  /** values: { TestCode: number|string } ; order: { Gender, Age } → string ('' nếu chưa đủ dữ liệu). */
  compute: function (testCode, values, order) {
    var f = Calc.formulaOf(testCode);
    if (!f) return '';
    var v = {};
    f.deps.forEach(function (d) { v[d] = toNum_(values[d]); });
    var female = /^n(ữ|u)$/i.test(String(order.Gender || '').trim());
    var r = f.fn(v, { age: toNum_(order.Age), female: female });
    if (r === null || !isFinite(r)) return '';
    var m = Math.pow(10, f.decimals);
    return String(Math.round(r * m) / m);
  }
};

var Catalog = {
  get: function () {
    var c = CacheUtil.get(CACHE.CATALOG);
    if (c) return c;
    var num = function (v) { return toNum_(v); };
    var panels = Db.readAll(T.PANELS).map(function (r) {
      return {
        PanelCode: String(r.PanelCode).trim(), PanelName: r.PanelName, PrintTitle: r.PrintTitle,
        PrintSubtitle: r.PrintSubtitle, PricingMode: String(r.PricingMode || 'TEST').toUpperCase(),
        Price: toNum_(r.Price, 0), SortOrder: toNum_(r.SortOrder, 999), IsActive: toBool_(r.IsActive),
        TemplateDocId: r.TemplateDocId || '',
        PageSize: /^A[45]$/.test(String(r.PageSize || '').toUpperCase().trim()) ? String(r.PageSize).toUpperCase().trim() : ''   // '' = theo cấu hình chung
      };
    }).sort(function (a, b) { return a.SortOrder - b.SortOrder; });
    var tests = Db.readAll(T.TESTS).map(function (r) {
      return {
        TestCode: String(r.TestCode).trim(), TestName: r.TestName, Unit: r.Unit,
        ResultType: String(r.ResultType || 'TEXT').toUpperCase(),
        RefMinM: num(r.RefMinM), RefMaxM: num(r.RefMaxM), RefMinF: num(r.RefMinF), RefMaxF: num(r.RefMaxF),
        RefText: r.RefText, Price: toNum_(r.Price, 0), SortOrder: toNum_(r.SortOrder, 999),
        IsActive: toBool_(r.IsActive), LegacyName: r.LegacyName || '',
        Formula: r.Formula || DEFAULT_FORMULA[String(r.TestCode).trim()] || ''
      };
    });
    var panelTests = Db.readAll(T.PANEL_TESTS).map(function (r) {
      return { PanelCode: String(r.PanelCode).trim(), TestCode: String(r.TestCode).trim(), SortOrder: toNum_(r.SortOrder, 999) };
    }).sort(function (a, b) { return a.SortOrder - b.SortOrder; });
    var doctors = Db.readAll(T.DOCTORS).filter(function (r) { return r.DoctorName; }).map(function (r) {
      return { DoctorName: r.DoctorName, IsActive: toBool_(r.IsActive), SortOrder: toNum_(r.SortOrder, 999) };
    }).sort(function (a, b) { return a.SortOrder - b.SortOrder; });
    var lookups = {};
    Db.readAll(T.LOOKUPS).sort(function (a, b) { return toNum_(a.SortOrder, 0) - toNum_(b.SortOrder, 0); })
      .forEach(function (r) { (lookups[r.ListCode] = lookups[r.ListCode] || []).push(String(r.Value)); });

    var wards = {};
    Db.readAll(T.WARDS).filter(function (r) { return r.WardName && (r.IsActive === '' || toBool_(r.IsActive)); })
      .sort(function (a, b) { return toNum_(a.SortOrder, 999) - toNum_(b.SortOrder, 999); })
      .forEach(function (r) { (wards[r.Province] = wards[r.Province] || []).push(String(r.WardName)); });
    var provinces = Object.keys(wards);
    (lookups.PROVINCE || []).forEach(function (pv) { if (provinces.indexOf(pv) === -1) provinces.push(pv); });
    lookups.PROVINCE = provinces;
    var cat = { panels: panels, tests: tests, panelTests: panelTests, doctors: doctors, lookups: lookups, wards: wards, builtAt: nowIso_() };
    CacheUtil.put(CACHE.CATALOG, cat, CACHE.TTL_LONG);
    return cat;
  },

  invalidate: function () { CacheUtil.remove(CACHE.CATALOG); },

  testMap: function () {
    var m = {};
    Catalog.get().tests.forEach(function (t) { m[t.TestCode] = t; });
    return m;
  },

  panelMap: function () {
    var m = {};
    Catalog.get().panels.forEach(function (p) { m[p.PanelCode] = p; });
    return m;
  },

  testsOfPanel: function (panelCode) {
    var tm = Catalog.testMap();
    return Catalog.get().panelTests.filter(function (x) { return x.PanelCode === panelCode; })
      .map(function (x) { return tm[x.TestCode]; }).filter(Boolean);
  },

  /** Reference range applicable for gender → {min,max,text}. */
  refFor: function (test, gender) {
    var female = /^n(ữ|u)$/i.test(String(gender || '').trim()) || String(gender).toUpperCase() === 'F';
    var min = female ? test.RefMinF : test.RefMinM;
    var max = female ? test.RefMaxF : test.RefMaxM;
    if (female && min === null && max === null) { min = test.RefMinM; max = test.RefMaxM; }
    return { min: min, max: max, text: test.RefText || '' };
  },

  /** Compute abnormal flag for a result value. */
  flag: function (test, value, gender) {
    if (value === '' || value === null || value === undefined) return '';
    var v = String(value).trim();
    switch (test.ResultType) {
      case ENUM.RESULT_TYPE.NUM:
        var n = toNum_(v);
        if (n === null) return '';
        var ref = Catalog.refFor(test, gender);
        if (ref.max !== null && n > ref.max) return ENUM.FLAG.HIGH;
        if (ref.min !== null && n < ref.min) return ENUM.FLAG.LOW;
        return ENUM.FLAG.NORMAL;
      case ENUM.RESULT_TYPE.QUAL:
        if (/^pos/i.test(v) || /dương/i.test(v)) return ENUM.FLAG.POSITIVE;
        if (/^neg/i.test(v) || /âm/i.test(v)) return ENUM.FLAG.NORMAL;
        var q = toNum_(v);  // numeric entered on a qualitative test (e.g. index) → no flag
        return q === null ? ENUM.FLAG.ABNORMAL : '';
      default:
        return '';
    }
  }
};

/** Business audit log – written to the YEAR DB of the entity (AuditLog sheet). */
var Audit = {
  write: function (ctx, year, action, entity, entityId, detail) {
    try {
      Db.insert(T.AUDIT, year, [{
        Timestamp: nowIso_(), Username: ctx ? ctx.username : 'system', Action: action,
        Entity: entity, EntityID: entityId, Detail: JSON.stringify(detail || {}).substring(0, 45000)
      }]);
    } catch (e) {
      console.error('Audit write failed: ' + e.message);
    }
  },

  /** p: {from, to, username, action, q, limit} – merges SystemLog + AuditLog of years in range. */
  list: function (p) {
    var from = toDateStr_(p.from) || addDays_(todayStr_(), -7);
    var to = toDateStr_(p.to) || todayStr_();
    var limit = Math.min(toNum_(p.limit, 500), 2000);
    var q = searchKey_(p.q || '');
    var rows = [];
    var push = function (src) {
      return function (r) {
        var d = String(r.Timestamp).substring(0, 10);
        if (d < from || d > to) return;
        if (p.username && r.Username !== p.username) return;
        if (p.action && r.Action !== p.action) return;
        if (q && searchKey_(r.EntityID + ' ' + r.Detail + ' ' + r.Action).indexOf(q) === -1) return;
        rows.push({ Source: src, Timestamp: r.Timestamp, Username: r.Username, Action: r.Action, Entity: r.Entity, EntityID: r.EntityID, Detail: r.Detail });
      };
    };
    Db.readAll(T.SYS_LOG).forEach(push('SYSTEM'));
    YearDb.all().filter(function (r) { return r.Year >= yearOf_(from) && r.Year <= yearOf_(to); }).forEach(function (y) {
      try { Db.readAll(T.AUDIT, y.SpreadsheetId).forEach(push(y.Note || ('DB_' + y.Year))); } catch (e) { /* DB unreachable → skip */ }
    });
    rows.sort(function (a, b) { return a.Timestamp < b.Timestamp ? 1 : -1; });
    return { total: rows.length, rows: rows.slice(0, limit) };
  },

  listForEntity: function (orderId) {
    var y;
    try { y = YearDb.locateOrder(orderId); } catch (e) { return []; }
    return Db.findBy(T.AUDIT, y, 'EntityID', orderId)
      .sort(function (a, b) { return a.Timestamp < b.Timestamp ? 1 : -1; });
  }
};

/** System log – login/admin/config events, CONFIG DB. */
var SysLog = {
  write: function (username, action, entity, entityId, detail) {
    try {
      Db.insert(T.SYS_LOG, null, [{
        Timestamp: nowIso_(), Username: username || 'system', Action: action, Entity: entity,
        EntityID: entityId, Detail: JSON.stringify(detail || {}).substring(0, 45000)
      }]);
    } catch (e) {
      console.error('SysLog write failed: ' + e.message);
    }
  }
};

/* ---- 06_Patient.gs ---- */
/**
 * 06_Patient.gs – Hồ sơ bệnh nhân (Patient DB).
 *
 *  Khóa tra cứu chính: Số điện thoại (cho phép trùng → trả danh sách để chọn).
 *  Dự phòng: Họ tên (không dấu) + Năm sinh + Phường/Xã + Địa chỉ.
 */

var PatientService = {
  COLS: ['PatientID', 'FullName', 'SearchName', 'Gender', 'BirthYear', 'Phone', 'Address', 'Ward', 'Province', 'IsActive'],
  INDEX_KEY: 'pidx_v1',

  /**
   * Danh bạ bệnh nhân rút gọn cho FE tìm kiếm tức thì (không gọi server mỗi lần gõ).
   * p.since = mốc thời gian lần tải trước → chỉ trả các hồ sơ tạo/sửa sau mốc (đồng bộ tăng dần).
   * Row: [PatientID, FullName, Gender, BirthYear, Phone, Address, Ward, Province, IsActive(1/0)]
   */
  index: function (p) {
    var all = CacheUtil.get(PatientService.INDEX_KEY);
    if (!all) {
      all = Db.readColumns(T.PATIENTS, null, PatientService.COLS.concat(['CreatedAt', 'UpdatedAt'])).map(function (r) {
        return { s: String(r.UpdatedAt || r.CreatedAt || ''), r: [r.PatientID, r.FullName, r.Gender, toNum_(r.BirthYear) || '', normPhone_(r.Phone),
          r.Address, r.Ward, r.Province, (r.IsActive === '' || toBool_(r.IsActive)) ? 1 : 0] };
      }).filter(function (x) { return x.r[0]; });
      CacheUtil.put(PatientService.INDEX_KEY, all, CACHE.TTL_LONG);
    }
    var since = String(p.since || '');
    var stamp = all.reduce(function (m, x) { return x.s > m ? x.s : m; }, '');
    var rows = since ? all.filter(function (x) { return x.s > since; }) : all;
    return { full: !since, stamp: stamp, count: all.length, rows: rows.map(function (x) { return x.r; }) };
  },

  /** Hồ sơ rút gọn từ danh bạ đang cache (0 lệnh gọi Sheets) – null nếu cache chưa có / không thấy. */
  fromIndex: function (patientId) {
    var all = CacheUtil.get(PatientService.INDEX_KEY);
    if (!all) return null;
    for (var i = 0; i < all.length; i++) {
      var r = all[i].r;
      if (r[0] === patientId) return { PatientID: r[0], FullName: r[1], Gender: r[2], BirthYear: r[3], Phone: r[4], Address: r[5], Ward: r[6], Province: r[7] };
    }
    return null;
  },

  /** p: { phone?, q?, birthYear?, ward?, limit? } */
  search: function (p) {
    var limit = Math.min(toNum_(p.limit, 30), 200);
    var phone = normPhone_(p.phone || '');
    var q = String(p.q || '').trim();
    if (!phone && /^[\d\s.+-]{6,}$/.test(q)) { phone = normPhone_(q); q = ''; }
    var key = searchKey_(q);
    var by = toNum_(p.birthYear);
    var ward = searchKey_(p.ward || '');
    if (!phone && key.length < 2 && !by) throw new AppError('VALIDATION', 'Nhập SĐT (≥ 6 số) hoặc họ tên (≥ 2 ký tự).');

    var rows = Db.readColumns(T.PATIENTS, null, PatientService.COLS);
    var tokens = key ? key.split(' ') : [];
    var out = rows.filter(function (r) {
      if (r.IsActive !== '' && !toBool_(r.IsActive)) return false;
      if (phone && normPhone_(r.Phone).indexOf(phone) === -1 && String(r.Phone).indexOf(phone.replace(/^0/, '')) === -1) return false;
      if (tokens.length) {
        var sn = String(r.SearchName || searchKey_(r.FullName));
        for (var i = 0; i < tokens.length; i++) if (sn.indexOf(tokens[i]) === -1) return false;
      }
      if (by && Number(r.BirthYear) !== by) return false;
      if (ward && searchKey_(r.Ward + ' ' + r.Address).indexOf(ward) === -1) return false;
      return true;
    });
    // Exact phone / exact name first.
    out.sort(function (a, b) {
      var sa = (phone && a.Phone === phone ? 0 : 1) + (key && a.SearchName === key ? 0 : 1);
      var sb = (phone && b.Phone === phone ? 0 : 1) + (key && b.SearchName === key ? 0 : 1);
      return sa - sb || String(a.FullName).localeCompare(String(b.FullName), 'vi');
    });
    return { total: out.length, rows: out.slice(0, limit).map(PatientService.publicView_) };
  },

  get: function (patientId) {
    var r = Db.findOne(T.PATIENTS, null, 'PatientID', patientId);
    if (!r) throw new AppError('NOT_FOUND', 'Không tìm thấy bệnh nhân ' + patientId);
    var view = PatientService.publicView_(r);
    view.Note = r.Note;
    view.CreatedAt = r.CreatedAt;
    view.CreatedBy = r.CreatedBy;
    view.UpdatedAt = r.UpdatedAt;
    view.UpdatedBy = r.UpdatedBy;
    view.orders = OrderService.listByPatient(patientId);
    return view;
  },

  publicView_: function (r) {
    return {
      PatientID: r.PatientID, FullName: r.FullName, Gender: r.Gender, BirthYear: toNum_(r.BirthYear),
      Phone: r.Phone, Address: r.Address, Ward: r.Ward, Province: r.Province
    };
  },

  /**
   * Create / update.  p: { PatientID?, FullName, Gender, BirthYear?|Age?, Phone, Address, Ward, Province, Note, force? }
   * Returns { patient } or { duplicate: true, matches: [...] } when a probable duplicate exists and !force.
   */
  save: function (p, ctx) {
    var data = PatientService.normalize_(p);
    if (p.PatientID) {
      Auth.assertPerm(ctx, PERM.PATIENT_EDIT + '|' + PERM.ORDER_CREATE);
      return withLock_(function () {
        var cur = Db.findOne(T.PATIENTS, null, 'PatientID', p.PatientID);
        if (!cur) throw new AppError('NOT_FOUND', 'Không tìm thấy bệnh nhân ' + p.PatientID);
        data.UpdatedAt = nowIso_();
        data.UpdatedBy = ctx.username;
        Db.updateRow(T.PATIENTS, null, cur._row, data);
        CacheUtil.remove(PatientService.INDEX_KEY);
        SysLog.write(ctx.username, 'PATIENT_UPDATE', 'Patient', p.PatientID, PatientService.diff_(cur, data));
        return { patient: PatientService.publicView_(Object.assign({}, cur, data)) };
      });
    }

    if (!p.force) {
      var dup = PatientService.findDuplicates_(data);
      if (dup.length) return { duplicate: true, matches: dup.map(PatientService.publicView_) };
    }
    return withLock_(function () {
      data.PatientID = Ids.newPatientId();
      data.IsActive = true;
      data.CreatedAt = nowIso_();
      data.CreatedBy = ctx.username;
      Db.insert(T.PATIENTS, null, [data]);
      CacheUtil.remove(PatientService.INDEX_KEY);
      SysLog.write(ctx.username, 'PATIENT_CREATE', 'Patient', data.PatientID, { FullName: data.FullName, Phone: data.Phone });
      return { patient: PatientService.publicView_(data) };
    });
  },

  normalize_: function (p) {
    required_(p, ['FullName', 'Gender']);
    var by = toNum_(p.BirthYear);
    if (!by && toNum_(p.Age) !== null) by = new Date().getFullYear() - toNum_(p.Age);
    var thisYear = new Date().getFullYear();
    if (by && (by < 1900 || by > thisYear)) throw new AppError('VALIDATION', 'Năm sinh không hợp lệ.');
    var phone = normPhone_(p.Phone);
    if (phone && !/^0\d{8,10}$/.test(phone)) throw new AppError('VALIDATION', 'Số điện thoại không hợp lệ: ' + p.Phone);
    var name = normName_(p.FullName);
    return {
      FullName: name, SearchName: searchKey_(name), Gender: String(p.Gender).trim() === 'Nữ' ? 'Nữ' : 'Nam',
      BirthYear: by || '', Phone: phone, Address: String(p.Address || '').trim(),
      Ward: String(p.Ward || '').trim(), Province: String(p.Province || '').trim(), Note: String(p.Note || '').trim()
    };
  },

  findDuplicates_: function (data) {
    var rows = Db.readColumns(T.PATIENTS, null, PatientService.COLS);
    return rows.filter(function (r) {
      if (r.SearchName !== data.SearchName) return false;
      if (data.Phone && r.Phone === data.Phone) return true;
      if (data.BirthYear && Number(r.BirthYear) === Number(data.BirthYear)) return true;
      return !data.Phone && !data.BirthYear;
    }).slice(0, 10);
  },

  diff_: function (before, after) {
    var d = {};
    Object.keys(after).forEach(function (k) {
      if (k === 'UpdatedAt' || k === 'UpdatedBy' || k === 'SearchName') return;
      if (String(before[k] === undefined ? '' : before[k]) !== String(after[k])) d[k] = { from: before[k], to: after[k] };
    });
    return d;
  }
};

/* ---- 07_Order.gs ---- */
/**
 * 07_Order.gs – Phiếu yêu cầu xét nghiệm (Lab Order) & Kết quả (Results).
 *
 *  Orders        : 1 dòng / phiếu (snapshot thông tin BN tại thời điểm khám)
 *  OrderPanels   : 1 dòng / nhóm XN trong phiếu (multi-panel), đơn giá, trạng thái kết quả
 *  Results       : 1 dòng / chỉ số (long format) → truy vấn lịch sử theo BN + chỉ số nhanh
 *  Concurrency   : ScriptLock cho mọi thao tác ghi + Optimistic locking qua cột Version
 */

var OrderService = {

  /* ----------------------------------------------------------------- CREATE */
  /**
   * p: {
   *   patientId | patient{...},  orderDate?, doctorName,
   *   panels: [{ panelCode, tests?: [testCode], amount? }],
   *   discount?, paymentStatus?, followUpDays?, note?,
   *   results?: [{ panelCode, testCode, value }]
   * }
   */
  create: function (p, ctx) {
    if (!p.panels || !p.panels.length) throw new AppError('VALIDATION', 'Phiếu phải có ít nhất 1 nhóm xét nghiệm.');
    var orderDate = toDateStr_(p.orderDate) || todayStr_();
    var year = yearOf_(orderDate);

    // 1) Patient (create first, own lock)
    var patient;
    if (p.patientId) {
      patient = PatientService.fromIndex(p.patientId) || Db.findOne(T.PATIENTS, null, 'PatientID', p.patientId);   // ưu tiên danh bạ cache
      if (!patient) throw new AppError('NOT_FOUND', 'Không tìm thấy bệnh nhân ' + p.patientId);
    } else if (p.patient) {
      var saved = PatientService.save(Object.assign({}, p.patient, { force: true }), ctx);
      patient = saved.patient;
    } else {
      throw new AppError('VALIDATION', 'Chưa chọn bệnh nhân.');
    }

    var lines = OrderService.buildLines_(p.panels, ctx);
    // Cảnh báo tạo trùng: cùng BN, cùng ngày, trùng nhóm XN, chưa hủy → FE hỏi lại, gửi force=true để vẫn tạo
    if (!p.force) {
      var dup = OrderService.findDuplicate_(patient.PatientID, orderDate, lines.map(function (l) { return l.PanelCode; }));
      if (dup) throw new AppError('DUPLICATE', 'Bệnh nhân ' + patient.FullName + ' đã có phiếu ' + dup.order.OrderID + ' ngày ' + orderDate.split('-').reverse().join('/') +
        ' cùng nhóm ' + dup.overlap.join(', ') + ' (tạo lúc ' + String(dup.order.CreatedAt).substring(11, 16) + ' bởi ' + dup.order.CreatedBy + ').');
    }
    var money = OrderService.money_(lines, p.discount, ctx);
    var followDays = toNum_(p.followUpDays, 0);
    var assignees = WorkService.normAssignees(p.assignedTo);

    return withLock_(function () {
      var db = YearDb.ensureActive(year);          // DB đang ghi của năm (tự tạo khi sang năm mới / DB đầy)
      var orderId = Ids.newOrderId(orderDate);
      var now = nowIso_();
      var order = {
        OrderID: orderId, OrderDate: orderDate, PatientID: patient.PatientID,
        PatientName: patient.FullName, Gender: patient.Gender,
        Age: patient.BirthYear ? (year - Number(patient.BirthYear)) : (toNum_(p.age) || ''),
        Phone: patient.Phone, Address: [patient.Address, patient.Ward, patient.Province].filter(String).join(', '),
        DoctorName: String(p.doctorName || Settings.get('DEFAULT_DOCTOR', '')).trim(),
        PanelCodes: lines.map(function (l) { return l.PanelCode; }).join(','),
        GrossAmount: money.gross, Discount: money.discount, NetAmount: money.net,
        PaymentStatus: p.paymentStatus === ENUM.PAYMENT.PAID ? ENUM.PAYMENT.PAID : ENUM.PAYMENT.UNPAID,
        Status: ENUM.ORDER_STATUS.REGISTERED,
        FollowUpDays: followDays || '', FollowUpDate: followDays ? addDays_(orderDate, followDays) : '',
        FollowUpStatus: followDays ? ENUM.FOLLOWUP.PENDING : '',
        Note: String(p.note || '').trim(), LegacyCode: '',
        CreatedAt: now, CreatedBy: ctx.username, UpdatedAt: now, UpdatedBy: ctx.username, Version: 1,
        AssignedTo: assignees.join(','), FirstResultAt: '', CompletedAt: ''
      };

      var panelRows = lines.map(function (l) {
        return { OrderID: orderId, PanelCode: l.PanelCode, TestCodes: l.TestCodes.join(','), Amount: l.Amount,
                 ResultStatus: ENUM.PANEL_STATUS.PENDING, PrintCount: 0, LastPrintedAt: '' };
      });

      var resultRows = [];
      if (p.results && p.results.length && Auth.hasPerm(ctx, PERM.RESULT_ENTER)) {
        resultRows = OrderService.buildResultRows_(order, OrderService.expandShared_(OrderService.applyCalc_(order, panelRows, [], p.results), panelRows), ctx);
        var resulted = {};
        resultRows.forEach(function (r) { resulted[r.PanelCode] = true; });
        panelRows.forEach(function (pr) { if (resulted[pr.PanelCode]) pr.ResultStatus = ENUM.PANEL_STATUS.RESULTED; });
        order.Status = OrderService.statusFromPanels_(panelRows);
        if (resultRows.length) order.FirstResultAt = now;
        if (order.Status === ENUM.ORDER_STATUS.COMPLETED) order.CompletedAt = now;
      }

      Db.insert(T.ORDERS, db, [order]);
      Db.insert(T.ORDER_PANELS, db, panelRows);
      if (resultRows.length) Db.insert(T.RESULTS, db, resultRows);

      Audit.write(ctx, db, 'ORDER_CREATE', 'Order', orderId, {
        patient: patient.PatientID, panels: order.PanelCodes, net: money.net, results: resultRows.length, assignedTo: order.AssignedTo
      });
      return OrderService.buildView_(order, panelRows, resultRows, ctx);   // trả từ bộ nhớ, không đọc lại Sheet
    });
  },

  /* ----------------------------------------------------------------- UPDATE */
  /**
   * p: { orderId, version, doctorName?, orderDate? (same year only), panels?, discount?, paymentStatus?,
   *      followUpDays?, note? }
   */
  update: function (p, ctx) {
    required_(p, ['orderId']);
    var db = YearDb.locateOrder(p.orderId);
    var year = YearDb.yearFromOrderId(p.orderId);
    return withLock_(function () {
      var cur = Db.findOne(T.ORDERS, db, 'OrderID', p.orderId);
      if (!cur) throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + p.orderId);
      if (cur.Status === ENUM.ORDER_STATUS.CANCELLED) throw new AppError('VALIDATION', 'Phiếu đã hủy, không thể sửa.');
      if (p.version !== undefined && Number(p.version) !== Number(cur.Version)) {
        throw new AppError('CONFLICT', 'Phiếu vừa được người khác cập nhật. Vui lòng tải lại trước khi lưu.');
      }

      var patch = {};
      if (p.doctorName !== undefined) patch.DoctorName = String(p.doctorName).trim();
      if (p.note !== undefined) patch.Note = String(p.note).trim();
      if (p.assignedTo !== undefined) patch.AssignedTo = WorkService.normAssignees(p.assignedTo).join(',');
      if (p.paymentStatus !== undefined) patch.PaymentStatus = p.paymentStatus === ENUM.PAYMENT.PAID ? ENUM.PAYMENT.PAID : ENUM.PAYMENT.UNPAID;
      if (p.orderDate !== undefined) {
        var nd = toDateStr_(p.orderDate);
        if (!nd || yearOf_(nd) !== year) throw new AppError('VALIDATION', 'Chỉ được đổi ngày khám trong cùng năm của phiếu.');
        patch.OrderDate = nd;
      }
      var baseDate = patch.OrderDate || cur.OrderDate;
      if (p.followUpDays !== undefined) {
        var fd = toNum_(p.followUpDays, 0);
        patch.FollowUpDays = fd || '';
        patch.FollowUpDate = fd ? addDays_(baseDate, fd) : '';
        patch.FollowUpStatus = fd ? (cur.FollowUpStatus || ENUM.FOLLOWUP.PENDING) : '';
      } else if (patch.OrderDate && cur.FollowUpDays) {
        patch.FollowUpDate = addDays_(baseDate, cur.FollowUpDays);
      }

      var existingPanels = Db.findBy(T.ORDER_PANELS, db, 'OrderID', p.orderId);
      var panelsChanged = false;
      if (p.panels) {
        var lines = OrderService.buildLines_(p.panels, ctx, existingPanels);
        var keep = {};
        lines.forEach(function (l) { keep[l.PanelCode] = l; });
        // Removing a panel that already has results requires result.enter permission.
        var removed = existingPanels.filter(function (e) { return !keep[e.PanelCode]; });
        removed.forEach(function (e) {
          if (e.ResultStatus === ENUM.PANEL_STATUS.RESULTED) Auth.assertPerm(ctx, PERM.RESULT_ENTER);
        });
        var updates = [], inserts = [];
        lines.forEach(function (l) {
          var ex = existingPanels.filter(function (e) { return e.PanelCode === l.PanelCode; })[0];
          if (ex) updates.push({ row: ex._row, patch: { TestCodes: l.TestCodes.join(','), Amount: l.Amount } });
          else inserts.push({ OrderID: p.orderId, PanelCode: l.PanelCode, TestCodes: l.TestCodes.join(','), Amount: l.Amount,
                              ResultStatus: ENUM.PANEL_STATUS.PENDING, PrintCount: 0, LastPrintedAt: '' });
        });
        Db.updateRows(T.ORDER_PANELS, db, updates);
        if (inserts.length) Db.insert(T.ORDER_PANELS, db, inserts);
        if (removed.length) {
          // Remove results of removed panels as well
          var resRows = Db.findBy(T.RESULTS, db, 'OrderID', p.orderId)
            .filter(function (r) { return removed.some(function (e) { return e.PanelCode === r.PanelCode; }); })
            .map(function (r) { return r._row; });
          Db.deleteRows(T.RESULTS, db, resRows);
          Db.deleteRows(T.ORDER_PANELS, db, removed.map(function (e) { return e._row; }));
        }
        patch.PanelCodes = lines.map(function (l) { return l.PanelCode; }).join(',');
        var money = OrderService.money_(lines, p.discount !== undefined ? p.discount : cur.Discount, ctx, p.discount === undefined);
        patch.GrossAmount = money.gross; patch.Discount = money.discount; patch.NetAmount = money.net;
        panelsChanged = true;
      } else if (p.discount !== undefined) {
        Auth.assertPerm(ctx, PERM.PRICE_OVERRIDE);
        var d = Math.max(0, toNum_(p.discount, 0));
        patch.Discount = d;
        patch.NetAmount = Math.max(0, Number(cur.GrossAmount || 0) - d);
      }

      if (panelsChanged) {
        var nowPanels = Db.findBy(T.ORDER_PANELS, db, 'OrderID', p.orderId);
        patch.Status = OrderService.statusFromPanels_(nowPanels);
      }
      patch.UpdatedAt = nowIso_();
      patch.UpdatedBy = ctx.username;
      patch.Version = Number(cur.Version || 1) + 1;

      // Re-locate the row (deletions above may not affect Orders, but be safe)
      var row = Db.findRowNums(T.ORDERS, db, 'OrderID', p.orderId)[0];
      Db.updateRow(T.ORDERS, db, row, patch);
      Audit.write(ctx, db, 'ORDER_UPDATE', 'Order', p.orderId, PatientService.diff_(cur, patch));
      return OrderService.get(p.orderId, ctx);
    });
  },

  /* ----------------------------------------------------------------- RESULTS */
  /**
   * p: { orderId, panelCode, results: [{ testCode, value }] }
   * Chỉ số dùng chung nhiều nhóm (vd ALT ở SH & GD): lưu ở nhóm này → tự đồng bộ sang các nhóm khác của phiếu.
   */
  saveResults: function (p, ctx) {
    required_(p, ['orderId', 'panelCode']);
    var db = YearDb.locateOrder(p.orderId);
    return withLock_(function () {
      var order = Db.findOne(T.ORDERS, db, 'OrderID', p.orderId);
      if (!order) throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + p.orderId);
      if (order.Status === ENUM.ORDER_STATUS.CANCELLED) throw new AppError('VALIDATION', 'Phiếu đã hủy.');
      var panels = Db.findBy(T.ORDER_PANELS, db, 'OrderID', p.orderId);
      if (!panels.some(function (x) { return x.PanelCode === p.panelCode; })) throw new AppError('VALIDATION', 'Phiếu không có nhóm ' + p.panelCode);

      var allRes = Db.findBy(T.RESULTS, db, 'OrderID', p.orderId);
      var exMap = {};                                       // panel|test → row
      allRes.forEach(function (r) { exMap[r.PanelCode + '|' + r.TestCode] = r; });

      // Mở rộng: kết quả nhập ở nhóm này + các nhóm khác của phiếu có cùng chỉ số
      var raw = (p.results || []).map(function (r) { return { panelCode: p.panelCode, testCode: r.testCode, value: r.value }; });
      var incoming = OrderService.expandShared_(OrderService.applyCalc_(order, panels, allRes, raw), panels, true);
      var built = OrderService.buildResultRows_(order, incoming, ctx, true);

      var updates = [], inserts = [], deletes = [], changes = [];
      built.forEach(function (nr) {
        var ex = exMap[nr.PanelCode + '|' + nr.TestCode];
        if (nr.Value === '') {
          if (ex) { deletes.push(ex._row); changes.push({ p: nr.PanelCode, t: nr.TestCode, from: ex.Value, to: '' }); delete exMap[nr.PanelCode + '|' + nr.TestCode]; }
          return;
        }
        if (ex) {
          if (String(ex.Value) !== String(nr.Value)) {
            updates.push({ row: ex._row, patch: nr });
            changes.push({ p: nr.PanelCode, t: nr.TestCode, from: ex.Value, to: nr.Value });
            exMap[nr.PanelCode + '|' + nr.TestCode] = Object.assign({}, ex, nr);
          }
        } else {
          inserts.push(nr);
          changes.push({ p: nr.PanelCode, t: nr.TestCode, from: '', to: nr.Value });
          exMap[nr.PanelCode + '|' + nr.TestCode] = nr;
        }
      });

      if (!changes.length) return OrderService.get(p.orderId, ctx);

      Db.updateRows(T.RESULTS, db, updates);
      if (inserts.length) Db.insert(T.RESULTS, db, inserts);
      if (deletes.length) Db.deleteRows(T.RESULTS, db, deletes);

      // Trạng thái từng nhóm theo kết quả còn lại
      var finalResults = Object.keys(exMap).map(function (k) { return exMap[k]; });
      var hasRes = {};
      finalResults.forEach(function (r) { hasRes[r.PanelCode] = true; });
      var panelUpdates = [];
      panels.forEach(function (x) {
        var st = hasRes[x.PanelCode] ? ENUM.PANEL_STATUS.RESULTED : ENUM.PANEL_STATUS.PENDING;
        if (x.ResultStatus !== st) { x.ResultStatus = st; panelUpdates.push({ row: x._row, patch: { ResultStatus: st } }); }
      });
      Db.updateRows(T.ORDER_PANELS, db, panelUpdates);

      var now2 = nowIso_();
      var orderPatch = { Status: OrderService.statusFromPanels_(panels), UpdatedAt: now2, UpdatedBy: ctx.username,
                         Version: Number(order.Version || 1) + 1 };
      if (finalResults.length && !order.FirstResultAt) orderPatch.FirstResultAt = now2;
      if (orderPatch.Status === ENUM.ORDER_STATUS.COMPLETED) { if (!order.CompletedAt) orderPatch.CompletedAt = now2; }
      else if (order.CompletedAt) orderPatch.CompletedAt = '';
      Db.updateRow(T.ORDERS, db, order._row, orderPatch);
      Audit.write(ctx, db, 'RESULT_SAVE', 'Order', p.orderId, { panel: p.panelCode, changes: changes });
      return OrderService.buildView_(Object.assign({}, order, orderPatch), panels, finalResults, ctx);
    });
  },

  /** Phiếu chưa hủy của BN trong cùng ngày có trùng nhóm XN (dùng cache Orders nếu có). */
  findDuplicate_: function (patientId, orderDate, codes) {
    var list = YearDb.forYear(yearOf_(orderDate)).slice().reverse();
    for (var i = 0; i < list.length; i++) {
      var rows;
      try { rows = Db.findBy(T.ORDERS, list[i].SpreadsheetId, 'PatientID', patientId); } catch (e) { continue; }
      for (var j = rows.length - 1; j >= 0; j--) {
        var o = rows[j];
        if (toDateStr_(o.OrderDate) !== orderDate || o.Status === ENUM.ORDER_STATUS.CANCELLED) continue;
        var have = String(o.PanelCodes || '').split(',');
        var overlap = codes.filter(function (c) { return have.indexOf(c) > -1; });
        if (overlap.length) return { order: o, overlap: overlap };
      }
    }
    return null;
  },

  /**
   * Người không có quyền "Hủy phiếu" vẫn được tự hủy phiếu DƯ của chính mình: tạo trong hôm nay, chưa có kết quả, chưa in.
   * → trả '' nếu được hủy, ngược lại là lý do.
   */
  selfCancelBlock_: function (cur, panels, ctx) {
    if (cur.CreatedBy !== ctx.username) return 'Phiếu do ' + (cur.CreatedBy || 'người khác') + ' tạo.';
    if (String(cur.CreatedAt).substring(0, 10) !== todayStr_()) return 'Chỉ tự hủy được phiếu tạo trong hôm nay.';
    if (cur.FirstResultAt) return 'Phiếu đã có kết quả.';
    if (panels.some(function (x) { return toNum_(x.PrintCount, 0) > 0; })) return 'Phiếu đã in.';
    return '';
  },

  /* ----------------------------------------------------------------- CANCEL */
  cancel: function (p, ctx) {
    required_(p, ['orderId', 'reason']);
    var db = YearDb.locateOrder(p.orderId);
    return withLock_(function () {
      var cur = Db.findOne(T.ORDERS, db, 'OrderID', p.orderId);
      if (!cur) throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + p.orderId);
      if (cur.Status === ENUM.ORDER_STATUS.CANCELLED) throw new AppError('VALIDATION', 'Phiếu đã hủy trước đó.');
      if (!Auth.hasPerm(ctx, PERM.ORDER_CANCEL)) {
        var why = OrderService.selfCancelBlock_(cur, Db.findBy(T.ORDER_PANELS, db, 'OrderID', p.orderId), ctx);
        if (why) throw new AppError('FORBIDDEN', why + ' Bạn chỉ được tự hủy phiếu dư do chính mình tạo trong ngày, chưa có kết quả và chưa in – liên hệ Admin/Bác sĩ để hủy.');
      }
      Db.updateRow(T.ORDERS, db, cur._row, {
        Status: ENUM.ORDER_STATUS.CANCELLED, FollowUpStatus: cur.FollowUpStatus ? ENUM.FOLLOWUP.SKIPPED : '',
        Note: (cur.Note ? cur.Note + ' | ' : '') + 'HỦY: ' + p.reason,
        UpdatedAt: nowIso_(), UpdatedBy: ctx.username, Version: Number(cur.Version || 1) + 1
      });
      Audit.write(ctx, db, 'ORDER_CANCEL', 'Order', p.orderId, { reason: p.reason, previousStatus: cur.Status });
      return OrderService.get(p.orderId, ctx);
    });
  },

  /* ----------------------------------------------------------------- READ */
  get: function (orderId, ctx) {
    var db = YearDb.locateOrder(orderId);
    var order = Db.findOne(T.ORDERS, db, 'OrderID', orderId);
    if (!order) throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + orderId);
    return OrderService.buildView_(order, Db.findBy(T.ORDER_PANELS, db, 'OrderID', orderId), Db.findBy(T.RESULTS, db, 'OrderID', orderId), ctx);
  },

  /** Order + panels + results (raw rows) → payload cho FE. */
  buildView_: function (order, panelRows, resultRows, ctx) {
    var panels = panelRows.map(function (x) {
      return { PanelCode: x.PanelCode, TestCodes: x.TestCodes ? String(x.TestCodes).split(',') : [], Amount: toNum_(x.Amount, 0),
               ResultStatus: x.ResultStatus, PrintCount: toNum_(x.PrintCount, 0), LastPrintedAt: x.LastPrintedAt };
    });
    var results = resultRows.map(function (r) {
      return { PanelCode: r.PanelCode, TestCode: r.TestCode, Value: r.Value, Unit: r.Unit, RefText: r.RefText,
               Flag: r.Flag, EnteredAt: r.EnteredAt, EnteredBy: r.EnteredBy };
    });
    var out = { order: OrderService.view_(order, ctx), panels: panels, results: results };
    if (!OrderService.canSeeMoney_(ctx)) out.panels.forEach(function (x) { x.Amount = null; });
    return out;
  },

  /**
   * Nhân bản kết quả sang các nhóm khác của phiếu có cùng chỉ số (vd ALT ∈ SH & GD).
   * Giá trị nhập trực tiếp cho nhóm luôn ưu tiên hơn giá trị nhân bản.
   */
  expandShared_: function (results, panelRows, keepEmpty) {
    var testsOf = {};
    panelRows.forEach(function (pr) {
      var codes = pr.TestCodes ? String(pr.TestCodes).split(',').filter(String) : Catalog.testsOfPanel(pr.PanelCode).map(function (t) { return t.TestCode; });
      testsOf[pr.PanelCode] = codes;
    });
    var direct = {}, out = [];
    results.forEach(function (r) {
      var v = r.value === null || r.value === undefined ? '' : String(r.value).trim();
      if (!v && !keepEmpty) return;
      direct[r.panelCode + '|' + r.testCode] = true;
      out.push({ panelCode: r.panelCode, testCode: r.testCode, value: v });
    });
    var extra = {};
    out.slice().forEach(function (r) {
      Object.keys(testsOf).forEach(function (pc) {
        var k = pc + '|' + r.testCode;
        if (pc === r.panelCode || direct[k] || extra[k] || testsOf[pc].indexOf(r.testCode) === -1) return;
        extra[k] = true;
        out.push({ panelCode: pc, testCode: r.testCode, value: r.value });
      });
    });
    return out;
  },

  /** p: { q?, from?, to?, status?, panelCode?, doctor?, payment?, limit? } */
  search: function (p, ctx) {
    var to = toDateStr_(p.to) || todayStr_();
    var from = toDateStr_(p.from) || addDays_(to, -30);
    var limit = Math.min(toNum_(p.limit, 300), 2000);
    var q = String(p.q || '').trim();
    var key = searchKey_(q);
    var phone = /^[\d\s.+-]{4,}$/.test(q) ? normPhone_(q) : '';
    var legacy = /^[A-Z]{2}\s?\d+$/i.test(q) ? q.replace(/\s/g, '').toUpperCase() : '';
    var rows = [];

    // Direct hit on OrderID / PatientID / legacy code → ignore date filter
    if (/^XN-\d{6}-\d+$/i.test(q)) {
      try { return { total: 1, rows: [OrderService.get(q.toUpperCase(), ctx).order] }; } catch (e) { return { total: 0, rows: [] }; }
    }
    YearDb.idsInRange(from, to).forEach(function (y) {
      var all;
      try { all = Db.readAll(T.ORDERS, y); } catch (e) { return; }
      all.forEach(function (o) {
        var d = toDateStr_(o.OrderDate);
        if (d < from || d > to) return;
        if (p.status && o.Status !== p.status) return;
        if (p.payment && o.PaymentStatus !== p.payment) return;
        if (p.panelCode && String(o.PanelCodes).split(',').indexOf(p.panelCode) === -1) return;
        if (p.doctor && o.DoctorName !== p.doctor) return;
        if (q) {
          var hit;
          if (legacy) hit = String(o.LegacyCode || '').toUpperCase().split(/\s+/).indexOf(legacy) > -1;   // mã cũ: khớp chính xác
          else {
            var hay = searchKey_([o.OrderID, o.PatientID, o.PatientName, o.LegacyCode, o.Address].join(' '));
            hit = hay.indexOf(key) > -1 || (phone && String(o.Phone).indexOf(phone) > -1);
          }
          if (!hit) return;
        }
        rows.push(OrderService.view_(o, ctx));
      });
    });
    rows.sort(function (a, b) { return a.OrderDate === b.OrderDate ? (a.OrderID < b.OrderID ? 1 : -1) : (a.OrderDate < b.OrderDate ? 1 : -1); });
    return { total: rows.length, rows: rows.slice(0, limit), from: from, to: to };
  },

  listByPatient: function (patientId) {
    var out = [];
    YearDb.allIds().forEach(function (y) {
      try {
        Db.findBy(T.ORDERS, y, 'PatientID', patientId).forEach(function (o) {
          out.push({ OrderID: o.OrderID, OrderDate: toDateStr_(o.OrderDate), PanelCodes: o.PanelCodes, Status: o.Status,
                     DoctorName: o.DoctorName, FollowUpDate: o.FollowUpDate });
        });
      } catch (e) { /* skip unreachable year */ }
    });
    return out.sort(function (a, b) { return a.OrderDate < b.OrderDate ? 1 : -1; });
  },

  /* ----------------------------------------------------------------- HELPERS */
  yearOrThrow_: function (orderId) {
    var y = YearDb.yearFromOrderId(orderId);
    if (!y) throw new AppError('VALIDATION', 'Mã phiếu không đúng định dạng XN-YYMMDD-NNN: ' + orderId);
    return y;
  },

  canSeeMoney_: function (ctx) {
    return Auth.hasPerm(ctx, PERM.ORDER_CREATE + '|' + PERM.ORDER_EDIT + '|' + PERM.REPORT_REVENUE);
  },

  view_: function (o, ctx) {
    var v = {
      OrderID: o.OrderID, OrderDate: toDateStr_(o.OrderDate), PatientID: o.PatientID, PatientName: o.PatientName,
      Gender: o.Gender, Age: toNum_(o.Age), Phone: o.Phone, Address: o.Address, DoctorName: o.DoctorName,
      PanelCodes: o.PanelCodes, GrossAmount: toNum_(o.GrossAmount, 0), Discount: toNum_(o.Discount, 0),
      NetAmount: toNum_(o.NetAmount, 0), PaymentStatus: o.PaymentStatus, Status: o.Status,
      FollowUpDays: toNum_(o.FollowUpDays), FollowUpDate: toDateStr_(o.FollowUpDate), FollowUpStatus: o.FollowUpStatus,
      Note: o.Note, LegacyCode: o.LegacyCode, CreatedAt: o.CreatedAt, CreatedBy: o.CreatedBy,
      UpdatedAt: o.UpdatedAt, UpdatedBy: o.UpdatedBy, Version: toNum_(o.Version, 1),
      AssignedTo: o.AssignedTo ? String(o.AssignedTo).split(',').filter(String) : [],
      FirstResultAt: o.FirstResultAt || '', CompletedAt: o.CompletedAt || ''
    };
    if (ctx && !OrderService.canSeeMoney_(ctx)) { v.GrossAmount = v.Discount = v.NetAmount = null; }
    return v;
  },

  /** Validate panels & compute line amounts. */
  /**
   * Kiểm tra nhóm + tính tiền từng dòng.
   *  - Chọn chỉ số tự tính (LDL, eGFR) → tự thêm chỉ số trung gian (TG, CHOL, HDL / CREA).
   *  - Chỉ số trùng giữa các nhóm chỉ tính tiền 1 lần: nhóm giá trọn gói (PANEL) đã bao gồm → nhóm tính theo chỉ số (TEST) không tính lại;
   *    giữa các nhóm TEST: nhóm chọn trước tính, nhóm sau bỏ qua.
   */
  buildLines_: function (panels, ctx, existing) {
    var pm = Catalog.panelMap(), tm = Catalog.testMap();
    var seen = {};
    var lines = panels.map(function (l) {
      var code = String(l.panelCode || l.PanelCode || '').trim().toUpperCase();
      var panel = pm[code];
      if (!panel) throw new AppError('VALIDATION', 'Nhóm XN không tồn tại: ' + code);
      if (seen[code]) throw new AppError('VALIDATION', 'Nhóm XN bị trùng: ' + code);
      seen[code] = true;
      var allCodes = Catalog.testsOfPanel(code).map(function (t) { return t.TestCode; });
      var sel = (l.tests && l.tests.length) ? l.tests.filter(function (t) { return allCodes.indexOf(t) > -1; }) : allCodes.slice();
      return { PanelCode: code, panel: panel, allCodes: allCodes, TestCodes: sel, req: l };
    });
    // Chỉ số trung gian của chỉ số tự tính
    lines.forEach(function (ln) {
      ln.TestCodes.slice().forEach(function (tc) {
        Calc.deps(tc).forEach(function (d) {
          if (lines.some(function (x) { return x.TestCodes.indexOf(d) > -1; })) return;
          if (ln.allCodes.indexOf(d) > -1) { ln.TestCodes.push(d); return; }
          var other = lines.filter(function (x) { return x.allCodes.indexOf(d) > -1; })[0];
          if (other) { other.TestCodes.push(d); return; }
          throw new AppError('VALIDATION', (tm[tc] || {}).TestName + ' cần chỉ số ' + ((tm[d] || {}).TestName || d) + ' nhưng phiếu không có nhóm chứa chỉ số này.');
        });
      });
    });
    lines.forEach(function (ln) { ln.TestCodes = ln.allCodes.filter(function (c) { return ln.TestCodes.indexOf(c) > -1; }); });
    // Tính tiền – chỉ số trùng chỉ tính 1 lần
    var covered = {}, charged = {};
    lines.forEach(function (ln) { if (ln.panel.PricingMode === ENUM.PRICING.PANEL) ln.TestCodes.forEach(function (c) { covered[c] = ln.PanelCode; }); });
    return lines.map(function (ln) {
      var code = ln.PanelCode, panel = ln.panel, l = ln.req, amount;
      if (panel.PricingMode === ENUM.PRICING.PANEL) {
        amount = panel.Price;
      } else {
        var unpriced = ln.TestCodes.every(function (c) { return !(tm[c] && Number(tm[c].Price)); });
        amount = 0;
        ln.TestCodes.forEach(function (c) {
          if (covered[c] || charged[c]) return;
          charged[c] = code;
          amount += tm[c] ? Number(tm[c].Price || 0) : 0;
        });
        if (unpriced) amount = panel.Price;     // nhóm chưa có giá từng chỉ số → dùng giá nhóm
      }
      if (l.amount !== undefined && l.amount !== null && l.amount !== '' && Number(l.amount) !== Number(amount)) {
        Auth.assertPerm(ctx, PERM.PRICE_OVERRIDE);
        amount = Math.max(0, toNum_(l.amount, 0));
      } else if (existing && (l.amount === undefined || l.amount === null || l.amount === '')) {
        var ex = existing.filter(function (e) { return e.PanelCode === code; })[0];
        if (ex) amount = toNum_(ex.Amount, amount);   // keep agreed price when not re-specified
      }
      return { PanelCode: code, TestCodes: ln.TestCodes, Amount: amount };
    });
  },

  /**
   * Thêm kết quả chỉ số tự tính vào danh sách nhập (server là nguồn duy nhất – bỏ giá trị tự tính do client gửi).
   * existingRows: Results hiện có của phiếu; incoming: [{panelCode, testCode, value}]; panelRows: OrderPanels.
   */
  applyCalc_: function (order, panelRows, existingRows, incoming) {
    var vals = {};
    existingRows.forEach(function (r) { if (r.Value !== '') vals[r.TestCode] = r.Value; });
    var input = incoming.filter(function (r) { return !Calc.formulaOf(r.testCode); });
    input.forEach(function (r) { vals[r.testCode] = r.value === null || r.value === undefined ? '' : String(r.value).trim(); });
    var out = input.slice();
    panelRows.forEach(function (pr) {
      var codes = pr.TestCodes ? String(pr.TestCodes).split(',').filter(String) : Catalog.testsOfPanel(pr.PanelCode).map(function (t) { return t.TestCode; });
      codes.forEach(function (tc) {
        if (!Calc.formulaOf(tc)) return;
        var exist = existingRows.filter(function (r) { return r.PanelCode === pr.PanelCode && r.TestCode === tc; })[0];
        var v = Calc.compute(tc, vals, order);
        if (v !== '' || exist) out.push({ panelCode: pr.PanelCode, testCode: tc, value: v });
      });
    });
    return out;
  },

  money_: function (lines, discount, ctx, skipPermCheck) {
    var gross = lines.reduce(function (s, l) { return s + Number(l.Amount || 0); }, 0);
    var d = Math.max(0, toNum_(discount, 0));
    if (d > 0 && !skipPermCheck) Auth.assertPerm(ctx, PERM.PRICE_OVERRIDE + '|' + PERM.ORDER_CREATE);
    if (d > gross) throw new AppError('VALIDATION', 'Chiết khấu lớn hơn tổng tiền.');
    return { gross: gross, discount: d, net: gross - d };
  },

  /** results: [{panelCode, testCode, value}] → Results rows (Value '' kept when keepEmpty). */
  buildResultRows_: function (order, results, ctx, keepEmpty) {
    var tm = Catalog.testMap();
    var now = nowIso_();
    var rows = [];
    results.forEach(function (r) {
      var t = tm[r.testCode];
      if (!t) throw new AppError('VALIDATION', 'Chỉ số không tồn tại: ' + r.testCode);
      var val = r.value === null || r.value === undefined ? '' : String(r.value).trim();
      if (!val && !keepEmpty) return;
      var num = t.ResultType === ENUM.RESULT_TYPE.NUM ? toNum_(val) : null;
      if (t.ResultType === ENUM.RESULT_TYPE.NUM && val && num === null && !/^[<>≤≥]/.test(val)) {
        throw new AppError('VALIDATION', t.TestName + ': giá trị phải là số (nhận được "' + val + '").');
      }
      rows.push({
        OrderID: order.OrderID, PatientID: order.PatientID, OrderDate: toDateStr_(order.OrderDate),
        PanelCode: r.panelCode, TestCode: t.TestCode, Value: val, NumValue: num === null ? '' : num,
        Unit: t.Unit || '', RefText: Catalog.refFor(t, order.Gender).text, Flag: Catalog.flag(t, val, order.Gender),
        EnteredAt: now, EnteredBy: ctx.username
      });
    });
    return rows;
  },

  statusFromPanels_: function (panelRows) {
    if (!panelRows.length) return ENUM.ORDER_STATUS.REGISTERED;
    var done = panelRows.filter(function (p) { return p.ResultStatus === ENUM.PANEL_STATUS.RESULTED; }).length;
    if (done === 0) return ENUM.ORDER_STATUS.REGISTERED;
    return done === panelRows.length ? ENUM.ORDER_STATUS.COMPLETED : ENUM.ORDER_STATUS.IN_PROGRESS;
  }
};

/* ---- 08_History_FollowUp_Report.gs ---- */
/**
 * 08_History_FollowUp_Report.gs – Lịch sử chỉ số, Cảnh báo tái khám, Thống kê & Xuất dữ liệu.
 */

/* =========================================================== HISTORY (trend) */
var HistoryService = {
  /** p: { patientId, testCodes?: [], panelCode? } → time series per test across all year DBs. */
  byPatient: function (p) {
    required_(p, ['patientId']);
    var filter = {};
    var codes = p.testCodes && p.testCodes.length ? p.testCodes : (p.panelCode ? Catalog.testsOfPanel(p.panelCode).map(function (t) { return t.TestCode; }) : null);
    if (codes) codes.forEach(function (c) { filter[c] = true; });

    var points = [];
    YearDb.allIds().forEach(function (y) {
      var rows;
      try { rows = Db.findBy(T.RESULTS, y, 'PatientID', p.patientId); } catch (e) { return; }
      rows.forEach(function (r) {
        if (codes && !filter[r.TestCode]) return;
        points.push({ TestCode: r.TestCode, OrderID: r.OrderID, OrderDate: toDateStr_(r.OrderDate), PanelCode: r.PanelCode,
                      Value: r.Value, NumValue: toNum_(r.NumValue), Flag: r.Flag, Unit: r.Unit, RefText: r.RefText });
      });
    });
    points.sort(function (a, b) { return a.OrderDate === b.OrderDate ? (a.OrderID < b.OrderID ? -1 : 1) : (a.OrderDate < b.OrderDate ? -1 : 1); });

    var tm = Catalog.testMap();
    var series = {};
    points.forEach(function (pt) { (series[pt.TestCode] = series[pt.TestCode] || []).push(pt); });
    var tests = Object.keys(series).map(function (c) {
      var t = tm[c] || { TestName: c, Unit: '', ResultType: 'TEXT', SortOrder: 999 };
      var s = series[c];
      var last = s[s.length - 1], prev = s.length > 1 ? s[s.length - 2] : null;
      var trend = '';
      if (prev && last.NumValue !== null && prev.NumValue !== null) trend = last.NumValue > prev.NumValue ? 'UP' : (last.NumValue < prev.NumValue ? 'DOWN' : 'FLAT');
      return { TestCode: c, TestName: t.TestName, Unit: t.Unit, ResultType: t.ResultType, SortOrder: t.SortOrder,
               count: s.length, last: last, trend: trend, points: s };
    }).sort(function (a, b) { return a.SortOrder - b.SortOrder; });

    var visits = {};
    points.forEach(function (pt) { visits[pt.OrderID] = pt.OrderDate; });
    return {
      patientId: p.patientId,
      visits: Object.keys(visits).map(function (k) { return { OrderID: k, OrderDate: visits[k] }; })
        .sort(function (a, b) { return a.OrderDate < b.OrderDate ? -1 : 1; }),
      tests: tests
    };
  }
};

/* =========================================================== FOLLOW-UP */
var FollowUpService = {
  /** p: { from?, to?, status? ('PENDING' default | 'ALL' | 'DONE' | 'SKIPPED') } */
  list: function (p) {
    var win = toNum_(Settings.get('FOLLOWUP_WINDOW_DAYS', 7), 7);
    var today = todayStr_();
    var from = toDateStr_(p.from) || addDays_(today, -30);
    var to = toDateStr_(p.to) || addDays_(today, win);
    var status = p.status || ENUM.FOLLOWUP.PENDING;
    var cols = ['OrderID', 'OrderDate', 'PatientID', 'PatientName', 'Gender', 'Age', 'Phone', 'DoctorName', 'PanelCodes',
                'Status', 'FollowUpDays', 'FollowUpDate', 'FollowUpStatus', 'Note'];
    // scan from one year before `from` so we can detect revisits
    var years = YearDb.idsInRange(addDays_(from, -366), addDays_(to, 366));
    var all = [];
    years.forEach(function (y) { try { all = all.concat(Db.readColumns(T.ORDERS, y, cols)); } catch (e) { /* skip */ } });

    var visitsByPatient = {};
    all.forEach(function (o) {
      if (o.Status === ENUM.ORDER_STATUS.CANCELLED) return;
      (visitsByPatient[o.PatientID] = visitsByPatient[o.PatientID] || []).push(toDateStr_(o.OrderDate));
    });

    var rows = all.filter(function (o) {
      var fd = toDateStr_(o.FollowUpDate);
      if (!fd || fd < from || fd > to) return false;
      if (o.Status === ENUM.ORDER_STATUS.CANCELLED) return false;
      return status === 'ALL' || (o.FollowUpStatus || ENUM.FOLLOWUP.PENDING) === status;
    }).map(function (o) {
      var fd = toDateStr_(o.FollowUpDate), od = toDateStr_(o.OrderDate);
      var days = Math.round((parseDate_(fd) - parseDate_(today)) / 86400000);
      var revisit = (visitsByPatient[o.PatientID] || []).filter(function (d) { return d > od; }).sort()[0] || '';
      return {
        OrderID: o.OrderID, OrderDate: od, PatientID: o.PatientID, PatientName: o.PatientName, Gender: o.Gender,
        Age: toNum_(o.Age), Phone: o.Phone, DoctorName: o.DoctorName, PanelCodes: o.PanelCodes,
        FollowUpDate: fd, FollowUpStatus: o.FollowUpStatus || ENUM.FOLLOWUP.PENDING, Note: o.Note,
        DaysLeft: days, RevisitDate: revisit,
        // Đã quay lại khám sau phiếu gốc nhưng chưa đánh dấu → không tính vào cảnh báo
        Bucket: (revisit && (o.FollowUpStatus || ENUM.FOLLOWUP.PENDING) === ENUM.FOLLOWUP.PENDING) ? 'RETURNED' : (days < 0 ? 'OVERDUE' : (days === 0 ? 'TODAY' : 'UPCOMING'))
      };
    }).sort(function (a, b) { return a.FollowUpDate < b.FollowUpDate ? -1 : 1; });

    var summary = { OVERDUE: 0, TODAY: 0, UPCOMING: 0, RETURNED: 0 };
    rows.forEach(function (r) { summary[r.Bucket]++; });
    return { from: from, to: to, summary: summary, rows: rows };
  },

  /** p: { orderId, status: 'DONE'|'SKIPPED'|'PENDING', note? } */
  update: function (p, ctx) {
    required_(p, ['orderId', 'status']);
    if ([ENUM.FOLLOWUP.DONE, ENUM.FOLLOWUP.SKIPPED, ENUM.FOLLOWUP.PENDING].indexOf(p.status) === -1) {
      throw new AppError('VALIDATION', 'Trạng thái tái khám không hợp lệ.');
    }
    var year = YearDb.locateOrder(p.orderId);
    return withLock_(function () {
      var o = Db.findOne(T.ORDERS, year, 'OrderID', p.orderId);
      if (!o) throw new AppError('NOT_FOUND', 'Không tìm thấy phiếu ' + p.orderId);
      var patch = { FollowUpStatus: p.status, UpdatedAt: nowIso_(), UpdatedBy: ctx.username, Version: Number(o.Version || 1) + 1 };
      if (p.note) patch.Note = (o.Note ? o.Note + ' | ' : '') + 'Tái khám: ' + p.note;
      Db.updateRow(T.ORDERS, year, o._row, patch);
      Audit.write(ctx, year, 'FOLLOWUP_UPDATE', 'Order', p.orderId, { from: o.FollowUpStatus, to: p.status, note: p.note || '' });
      return true;
    });
  }
};

/* =========================================================== REPORTS */
var ReportService = {
  scan_: function (from, to) {
    var orders = [], lines = [];
    YearDb.idsInRange(from, to).forEach(function (y) {
      var os;
      try { os = Db.readAll(T.ORDERS, y); } catch (e) { return; }
      var ids = {};
      os.forEach(function (o) {
        var d = toDateStr_(o.OrderDate);
        if (d >= from && d <= to) { orders.push(o); ids[o.OrderID] = o; }
      });
      Db.readAll(T.ORDER_PANELS, y).forEach(function (l) { if (ids[l.OrderID]) lines.push(l); });
    });
    return { orders: orders, lines: lines };
  },

  /** p: { from, to } → summary + breakdowns (đã loại phiếu hủy). */
  revenue: function (p) {
    var to = toDateStr_(p.to) || todayStr_();
    var from = toDateStr_(p.from) || (to.substring(0, 8) + '01');
    var data = ReportService.scan_(from, to);
    var pm = Catalog.panelMap();
    var active = {};
    var sum = { orders: 0, cancelled: 0, patients: 0, gross: 0, discount: 0, net: 0, paid: 0, unpaid: 0, panels: 0 };
    var byDay = {}, byDoctor = {}, byPanel = {}, byStatus = {}, patients = {};

    data.orders.forEach(function (o) {
      byStatus[o.Status] = (byStatus[o.Status] || 0) + 1;
      if (o.Status === ENUM.ORDER_STATUS.CANCELLED) { sum.cancelled++; return; }
      active[o.OrderID] = true;
      var net = toNum_(o.NetAmount, 0), d = toDateStr_(o.OrderDate);
      sum.orders++; sum.gross += toNum_(o.GrossAmount, 0); sum.discount += toNum_(o.Discount, 0); sum.net += net;
      if (o.PaymentStatus === ENUM.PAYMENT.PAID) sum.paid += net; else sum.unpaid += net;
      patients[o.PatientID] = true;
      var day = byDay[d] = byDay[d] || { date: d, orders: 0, net: 0 };
      day.orders++; day.net += net;
      var dn = o.DoctorName || '(Không ghi)';
      var doc = byDoctor[dn] = byDoctor[dn] || { doctor: dn, orders: 0, net: 0 };
      doc.orders++; doc.net += net;
    });
    data.lines.forEach(function (l) {
      if (!active[l.OrderID]) return;
      sum.panels++;
      var pc = byPanel[l.PanelCode] = byPanel[l.PanelCode] || { panelCode: l.PanelCode, panelName: (pm[l.PanelCode] || {}).PanelName || l.PanelCode, count: 0, amount: 0 };
      pc.count++; pc.amount += toNum_(l.Amount, 0);
    });
    sum.patients = Object.keys(patients).length;
    var vals = function (m) { return Object.keys(m).map(function (k) { return m[k]; }); };
    return {
      from: from, to: to, summary: sum, byStatus: byStatus,
      byDay: vals(byDay).sort(function (a, b) { return a.date < b.date ? -1 : 1; }),
      byPanel: vals(byPanel).sort(function (a, b) { return b.amount - a.amount || b.count - a.count; }),
      byDoctor: vals(byDoctor).sort(function (a, b) { return b.net - a.net || b.orders - a.orders; })
    };
  },

  /** p: { from, to, includeResults? } → raw datasets for Excel export (FE builds .xlsx). */
  exportData: function (p, ctx) {
    var to = toDateStr_(p.to) || todayStr_();
    var from = toDateStr_(p.from) || (to.substring(0, 8) + '01');
    var span = (parseDate_(to) - parseDate_(from)) / 86400000;
    if (span > 731) throw new AppError('VALIDATION', 'Khoảng thời gian xuất tối đa 2 năm.');
    var data = ReportService.scan_(from, to);
    var pm = Catalog.panelMap(), tm = Catalog.testMap();
    var money = Auth.hasPerm(ctx, PERM.REPORT_REVENUE);

    var orders = data.orders.map(function (o) {
      var v = OrderService.view_(o, null);
      if (!money) { v.GrossAmount = v.Discount = v.NetAmount = null; }
      return v;
    }).sort(function (a, b) { return a.OrderID < b.OrderID ? -1 : 1; });
    var orderMap = {};
    orders.forEach(function (o) { orderMap[o.OrderID] = o; });
    var lines = data.lines.map(function (l) {
      var o = orderMap[l.OrderID];
      return { OrderID: l.OrderID, OrderDate: o.OrderDate, PatientName: o.PatientName, Status: o.Status,
               PanelCode: l.PanelCode, PanelName: (pm[l.PanelCode] || {}).PanelName || l.PanelCode,
               Amount: money ? toNum_(l.Amount, 0) : null, ResultStatus: l.ResultStatus };
    });

    var results = [];
    if (p.includeResults) {
      YearDb.idsInRange(from, to).forEach(function (y) {
        try {
          Db.readAll(T.RESULTS, y).forEach(function (r) {
            if (!orderMap[r.OrderID]) return;
            results.push({ OrderID: r.OrderID, OrderDate: toDateStr_(r.OrderDate), PatientID: r.PatientID,
                           PanelCode: r.PanelCode, TestCode: r.TestCode, TestName: (tm[r.TestCode] || {}).TestName || r.TestCode,
                           Value: r.Value, Unit: r.Unit, RefText: r.RefText, Flag: r.Flag });
          });
        } catch (e) { /* skip */ }
      });
    }
    SysLog.write(ctx.username, 'EXPORT', 'Report', from + '..' + to, { orders: orders.length, results: results.length });
    return { from: from, to: to, orders: orders, lines: lines, results: results, includesMoney: money };
  }
};

/* ---- 09_Print.gs ---- */
/**
 * 09_Print.gs – Xuất phiếu kết quả xét nghiệm ra PDF / DOCX.
 *
 *  2 chế độ cho mỗi nhóm XN:
 *   (A) Mẫu chuẩn tự sinh (mặc định) – layout theo mẫu Word hiện hữu: header phòng XN, tiêu đề nhóm,
 *       thông tin BN, bảng kết quả (đánh dấu ↑ ↓ / in đậm khi bất thường), chân phiếu ký tên.
 *   (B) Mẫu riêng: Panels.TemplateDocId = ID Google Docs (chuyển từ file .doc cũ, thay «MergeField»
 *       bằng placeholder):
 *         {{PATIENT_NAME}} {{AGE}} {{GENDER}} {{ADDRESS}} {{PHONE}} {{DOCTOR}} {{ORDER_ID}} {{PATIENT_ID}}
 *         {{ORDER_DATE}} {{FOLLOWUP_DATE}} {{DAY}} {{MONTH}} {{YEAR}} {{PRINT_TIME}} {{LAB_HEAD}}
 *         {{T:<TestCode>}} = kết quả   {{R:<TestCode>}} = khoảng tham chiếu   {{F:<TestCode>}} = cờ
 *  Nhiều nhóm trong 1 phiếu → 1 file, mỗi nhóm 1 trang.
 */

var PrintService = {
  PAGE: { A4: [595.28, 841.89], A5: [419.53, 595.28] },
  font: 'Be Vietnam Pro',   // đặt lại theo Settings.PRINT_FONT mỗi lần render
  COLOR: { primary: '#0F4C5C', text: '#1F2933', muted: '#5F6B7A', high: '#B42318', border: '#9AA5B1' },

  /** p: { orderId, panelCodes?: [], format: 'pdf'|'docx' } → { fileName, mimeType, base64 } */
  render: function (p, ctx) {
    required_(p, ['orderId']);
    var format = String(p.format || 'pdf').toLowerCase();
    if (['pdf', 'docx'].indexOf(format) === -1) throw new AppError('VALIDATION', 'Định dạng chỉ hỗ trợ pdf | docx');

    var data = OrderService.get(p.orderId, ctx);
    if (data.order.Status === ENUM.ORDER_STATUS.CANCELLED) throw new AppError('VALIDATION', 'Phiếu đã hủy, không in kết quả.');
    var codes = (p.panelCodes && p.panelCodes.length) ? p.panelCodes : data.panels.map(function (x) { return x.PanelCode; });
    var panels = data.panels.filter(function (x) { return codes.indexOf(x.PanelCode) > -1; });
    if (!panels.length) throw new AppError('VALIDATION', 'Không có nhóm XN để in.');

    var settings = Settings.all();
    PrintService.font = PrintService.fontOf_(settings);
    var pm = Catalog.panelMap();
    var fileName = data.order.OrderID + '_' + searchKey_(data.order.PatientName).replace(/\s+/g, '_') + '_' + codes.join('-');

    var doc = DocumentApp.create(fileName);
    var docId = doc.getId();
    try {
      var body = doc.getBody();
      // Khổ giấy: theo từng nhóm (Panels.PageSize), trống = cấu hình chung. 1 file Google Docs chỉ có 1 khổ →
      // nếu in chung nhiều nhóm khác khổ thì dùng A4 (khổ lớn hơn) cho cả file.
      var defSize = String(settings.PRINT_PAGE_SIZE || 'A5').toUpperCase() === 'A4' ? 'A4' : 'A5';
      var sizeKey = panels.some(function (op) { return ((pm[op.PanelCode] || {}).PageSize || defSize) === 'A4'; }) ? 'A4' : 'A5';
      var size = PrintService.PAGE[sizeKey];
      body.setPageWidth(size[0]).setPageHeight(size[1])
          .setMarginTop(24).setMarginBottom(20).setMarginLeft(28).setMarginRight(24);
      var logo = PrintService.imageBlob_(settings.CLINIC_LOGO_FILE_ID) || PrintService.logoBlob_(settings.CLINIC_LOGO_URL);
      var watermark = String(settings.WATERMARK_ENABLED || 'TRUE').toUpperCase() !== 'FALSE' ? PrintService.imageBlob_(settings.CLINIC_WATERMARK_FILE_ID) : null;

      panels.forEach(function (op, idx) {
        if (idx > 0) body.appendPageBreak();
        var panel = pm[op.PanelCode] || { PanelCode: op.PanelCode, PanelName: op.PanelCode, PrintTitle: 'PHIẾU KẾT QUẢ XÉT NGHIỆM' };
        var startIdx = body.getNumChildren();
        var anchor = panel.TemplateDocId ? (PrintService.appendTemplate_(body, panel.TemplateDocId), PrintService.firstParagraphFrom_(body, startIdx))
                                         : PrintService.appendStandard_(body, data, op, panel, settings, logo, size);
        if (watermark && anchor) PrintService.addWatermark_(anchor, watermark, size);
      });
      PrintService.replacePlaceholders_(body, data, settings);
      // Remove the default empty first paragraph created by DocumentApp.create
      var first = body.getChild(0);
      if (first.getType() === DocumentApp.ElementType.PARAGRAPH && first.asParagraph().getText() === '' && body.getNumChildren() > 1) {
        try { first.removeFromParent(); } catch (e) { /* ignore */ }
      }
      doc.saveAndClose();

      var blob;
      if (format === 'pdf') {
        blob = DriveApp.getFileById(docId).getAs(MimeType.PDF).setName(fileName + '.pdf');
        if (toBool_(settings.ARCHIVE_PDF) && settings.REPORT_FOLDER_ID) PrintService.archive_(blob, settings.REPORT_FOLDER_ID, data.order.OrderDate);
      } else {
        var url = 'https://docs.google.com/document/d/' + docId + '/export?format=docx';
        var res = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
        if (res.getResponseCode() !== 200) throw new AppError('PRINT_ERROR', 'Xuất DOCX lỗi HTTP ' + res.getResponseCode());
        blob = res.getBlob().setName(fileName + '.docx');
      }

      PrintService.markPrinted_(data.order.OrderID, codes, ctx);
      return {
        fileName: blob.getName(),
        mimeType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        base64: Utilities.base64Encode(blob.getBytes())
      };
    } finally {
      try { DriveApp.getFileById(docId).setTrashed(true); } catch (e) { /* ignore */ }
    }
  },

  /* ---------------------------------------------------------------- STANDARD LAYOUT */
  appendStandard_: function (body, data, op, panel, settings, logo, size) {
    var C = PrintService.COLOR;
    var o = data.order;
    var contentW = size[0] - 52;
    var A4 = size[0] > 500;
    // Mật độ: gói nhiều chỉ số → thu nhỏ chữ/đệm để chữ ký + tên Trưởng phòng luôn nằm cùng trang 1
    var nRows = PrintService.countRows_(data, op, settings);
    var fitRows = A4 ? 22 : 9;
    var d = nRows <= fitRows ? 1 : Math.max(0.74, 1 - (nRows - fitRows) * (A4 ? 0.015 : 0.035));
    var fs = function (n) { return Math.max(6, Math.round((A4 ? n + 1 : n) * d * 2) / 2); };   // cỡ chữ theo khổ giấy × mật độ
    var pd = function (n) { return Math.max(1, Math.round(n * d * 2) / 2); };

    // ---- Header: logo | tên phòng XN, giấy phép · địa chỉ, điện thoại
    var head = body.appendTable([['', '']]);
    head.setBorderWidth(0);
    var hl = head.getCell(0, 0), hr = head.getCell(0, 1);
    hl.setWidth(62).setPaddingTop(0).setPaddingLeft(0).setPaddingBottom(4);
    hr.setWidth(contentW - 62).setPaddingTop(2).setPaddingBottom(4);
    if (logo) {
      try {
        var img = hl.getChild(0).asParagraph().appendInlineImage(logo);
        var ratio = img.getHeight() / img.getWidth();
        var h = 44, w = Math.round(h / ratio);
        if (w > 58) { w = 58; h = Math.round(58 * ratio); }
        img.setWidth(w).setHeight(h);
      } catch (e) { /* bad image → skip */ }
    }
    PrintService.para_(hr.getChild(0).asParagraph(), settings.CLINIC_NAME || 'PHÒNG XÉT NGHIỆM', fs(13), true, C.primary);
    PrintService.para_(hr.appendParagraph(''), [settings.CLINIC_LICENSE, settings.CLINIC_ADDRESS].filter(String).join(' · '), fs(7.5), false, C.muted);
    PrintService.para_(hr.appendParagraph(''), settings.CLINIC_PHONE ? 'Điện thoại: ' + settings.CLINIC_PHONE : '', fs(7.5), false, C.muted);
    // đường kẻ dưới header
    var rule = body.appendTable([['']]);
    rule.setBorderWidth(0);
    rule.getCell(0, 0).setBackgroundColor(C.primary).setPaddingTop(0).setPaddingBottom(0).setWidth(contentW);
    PrintService.styleText_(rule.getCell(0, 0).getChild(0).asParagraph(), 1, false, C.primary).setLineSpacing(0.1);

    // ---- Tiêu đề
    var t1 = PrintService.para_(body.appendParagraph(''), panel.PrintTitle || 'PHIẾU KẾT QUẢ XÉT NGHIỆM', fs(14), true, C.primary);
    t1.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingBefore(pd(8));
    if (panel.PrintSubtitle) {
      PrintService.para_(body.appendParagraph(''), panel.PrintSubtitle, fs(11.5), true, C.primary)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    }
    PrintService.para_(body.appendParagraph(''), ' ', 3, false, C.muted);

    // ---- Thông tin bệnh nhân (khung nền nhạt)
    var info = body.appendTable([
      ['Họ và tên: ' + o.PatientName, 'Tuổi: ' + (o.Age === null ? '' : o.Age) + '      Giới tính: ' + (o.Gender || '')],
      ['Mã BN: ' + o.PatientID, 'Ngày khám: ' + PrintService.vnDate_(o.OrderDate)],
      ['Địa chỉ: ' + (o.Address || ''), 'BS chỉ định: ' + (o.DoctorName || '')]
    ]);
    info.setBorderColor('#D5E2E5').setBorderWidth(0.5);
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 2; c++) {
        var cell = info.getCell(r, c);
        cell.setBackgroundColor('#F4F8F9').setPaddingTop(pd(2.5)).setPaddingBottom(pd(2.5)).setPaddingLeft(6).setPaddingRight(6);
        var pg = PrintService.styleText_(cell.getChild(0).asParagraph(), fs(9.5), false, C.text);
        // in đậm phần giá trị sau dấu ':'
        var txt = pg.editAsText(), str = txt.getText(), k = str.indexOf(':');
        if (k > -1 && k + 1 < str.length && !(r === 2)) txt.setBold(k + 1, str.length - 1, true);
        if (r === 0 && c === 0 && k > -1 && k + 1 < str.length) txt.setFontSize(k + 1, str.length - 1, fs(10.5));
      }
    }
    info.getCell(0, 0).setWidth(contentW * 0.6);
    info.getCell(0, 1).setWidth(contentW * 0.4);
    PrintService.para_(body.appendParagraph(''), ' ', 4, false, C.muted);

    // ---- Bảng kết quả
    var testsAll = Catalog.testsOfPanel(op.PanelCode);
    var selected = op.TestCodes && op.TestCodes.length ? op.TestCodes : testsAll.map(function (t) { return t.TestCode; });
    var resMap = {};
    data.results.filter(function (x) { return x.PanelCode === op.PanelCode; }).forEach(function (x) { resMap[x.TestCode] = x; });
    var onlyResulted = settings.PRINT_ONLY_RESULTED === '' || settings.PRINT_ONLY_RESULTED === undefined ? true : toBool_(settings.PRINT_ONLY_RESULTED);
    var rows = testsAll.filter(function (t) {
      return selected.indexOf(t.TestCode) > -1 && (!onlyResulted || (resMap[t.TestCode] && resMap[t.TestCode].Value !== ''));
    });

    var anyAbn = false;
    var grid = [['STT', 'XÉT NGHIỆM', 'KẾT QUẢ', 'ĐƠN VỊ', 'KHOẢNG THAM CHIẾU']];
    rows.forEach(function (t, i) {
      var rs = resMap[t.TestCode] || {};
      var mark = rs.Flag === 'H' ? ' ↑' : (rs.Flag === 'L' ? ' ↓' : '');
      grid.push([String(i + 1), t.TestName, (rs.Value || '') + mark, t.Unit || '', rs.RefText || Catalog.refFor(t, o.Gender).text || '']);
    });
    if (!rows.length) grid.push(['', '(Chưa có kết quả)', '', '', '']);
    var tbl = body.appendTable(grid);
    tbl.setBorderColor('#C3CED4').setBorderWidth(0.5);
    var widths = [0.07, 0.37, 0.17, 0.13, 0.26];
    for (var i = 0; i < grid.length; i++) {
      var row = tbl.getRow(i);
      var isHead = i === 0;
      var flag = (isHead || !rows.length) ? '' : ((resMap[rows[i - 1].TestCode] || {}).Flag || '');
      var abnormal = flag && flag !== 'N';
      if (abnormal) anyAbn = true;
      for (var k2 = 0; k2 < 5; k2++) {
        var ce = row.getCell(k2);
        if (i === 0) ce.setWidth(contentW * widths[k2]);
        ce.setPaddingTop(pd(isHead ? 4 : 3)).setPaddingBottom(pd(isHead ? 4 : 3)).setPaddingLeft(4).setPaddingRight(4);
        if (isHead) ce.setBackgroundColor(C.primary);
        else if (i % 2 === 0) ce.setBackgroundColor('#F7FAFB');
        var pg2 = ce.getChild(0).asParagraph();
        var color = isHead ? '#FFFFFF' : (k2 === 2 && abnormal ? C.high : ((k2 === 0 || k2 === 3) ? C.muted : C.text));
        PrintService.styleText_(pg2, isHead ? fs(8) : (k2 === 4 ? fs(8.5) : fs(9.5)), isHead || k2 === 1 || k2 === 2, color);
        if (k2 === 0 || k2 === 2 || k2 === 3) pg2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }
    }
    if (anyAbn) {
      var lg = PrintService.para_(body.appendParagraph(''), 'In đậm đỏ: ngoài khoảng tham chiếu (↑ cao hơn · ↓ thấp hơn)', fs(7.5), false, C.muted);
      lg.setSpacingBefore(3);
      lg.editAsText().setForegroundColor(0, 9, C.high).setBold(0, 9, true);
    }

    // ---- Chân phiếu: hẹn tái khám | địa danh, ngày – Trưởng phòng XN – ký tên
    var od = parseDate_(o.OrderDate);
    var city = settings.CLINIC_CITY || 'Pleiku';
    var foot = body.appendTable([
      [o.FollowUpDate ? 'Hẹn tái khám: ' + PrintService.vnDate_(o.FollowUpDate) : '', city + ', ngày ' + od.getDate() + ' tháng ' + (od.getMonth() + 1) + ' năm ' + od.getFullYear()],
      ['', 'TRƯỞNG PHÒNG XÉT NGHIỆM'],
      ['', ''],
      ['', settings.LAB_HEAD || '']
    ]);
    foot.setBorderWidth(0);
    for (var fr = 0; fr < foot.getNumRows(); fr++) {
      foot.getCell(fr, 0).setWidth(contentW * 0.4).setPaddingLeft(0).setPaddingTop(fr === 0 ? pd(10) : 0).setPaddingBottom(0);
      foot.getCell(fr, 1).setWidth(contentW * 0.6).setPaddingTop(fr === 0 ? pd(10) : 0).setPaddingBottom(0);
      var lp = PrintService.styleText_(foot.getCell(fr, 0).getChild(0).asParagraph(), fs(9.5), false, C.text);
      if (fr === 0 && o.FollowUpDate) lp.editAsText().setBold(14, lp.getText().length - 1, true);
      var rp = foot.getCell(fr, 1).getChild(0).asParagraph();
      PrintService.styleText_(rp, fr === 0 ? fs(9) : fs(10), fr === 1 || fr === 3, fr === 0 ? C.muted : C.text);
      rp.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    }
    foot.getCell(2, 1).getChild(0).asParagraph().setSpacingBefore(Math.max(20, (A4 ? 36 : 26) * d));

    var note = (settings.REPORT_FOOTER || '') + '   ·   In lúc ' + Utilities.formatDate(new Date(), APP.TZ, 'HH:mm dd/MM/yyyy');
    var np = PrintService.para_(body.appendParagraph(''), note, fs(6.5), false, C.muted).setSpacingBefore(pd(8));
    np.editAsText().setItalic(true);
    return t1;   // đoạn tiêu đề – neo watermark
  },

  /** Số dòng chỉ số sẽ in của 1 panel (cùng quy tắc lọc với bảng kết quả). */
  countRows_: function (data, op, settings) {
    var testsAll = Catalog.testsOfPanel(op.PanelCode);
    var selected = op.TestCodes && op.TestCodes.length ? op.TestCodes : testsAll.map(function (t) { return t.TestCode; });
    var resMap = {};
    data.results.filter(function (x) { return x.PanelCode === op.PanelCode; }).forEach(function (x) { resMap[x.TestCode] = x; });
    var onlyResulted = settings.PRINT_ONLY_RESULTED === '' || settings.PRINT_ONLY_RESULTED === undefined ? true : toBool_(settings.PRINT_ONLY_RESULTED);
    var n = 0, longRef = 0;
    testsAll.forEach(function (t) {
      if (selected.indexOf(t.TestCode) < 0) return;
      var r = resMap[t.TestCode];
      if (onlyResulted && !(r && r.Value !== '')) return;
      n++;
      if (String((r && r.RefText) || Catalog.refFor(t, data.order.Gender).text || '').length > 16) longRef++;   // khoảng tham chiếu dài → xuống 2 dòng
    });
    return n + Math.ceil(longRef / 2);
  },

  /* ---------------------------------------------------------------- CUSTOM TEMPLATE */
  appendTemplate_: function (body, templateId) {
    var src;
    try { src = DocumentApp.openById(templateId).getBody(); } catch (e) {
      throw new AppError('PRINT_ERROR', 'Không mở được mẫu in ' + templateId + ': ' + e.message);
    }
    var ET = DocumentApp.ElementType;
    for (var i = 0; i < src.getNumChildren(); i++) {
      var el = src.getChild(i);
      switch (el.getType()) {
        case ET.PARAGRAPH: body.appendParagraph(el.asParagraph().copy()); break;
        case ET.TABLE: body.appendTable(el.asTable().copy()); break;
        case ET.LIST_ITEM: body.appendListItem(el.asListItem().copy()); break;
        default: /* page breaks / unsupported element types are skipped */ break;
      }
    }
  },

  replacePlaceholders_: function (body, data, settings) {
    var o = data.order;
    var od = parseDate_(o.OrderDate);
    var esc = function (k) { return '\\{\\{' + k + '\\}\\}'; };
    var map = {
      PATIENT_NAME: o.PatientName, AGE: o.Age === null ? '' : o.Age, GENDER: o.Gender, ADDRESS: o.Address, PHONE: o.Phone,
      DOCTOR: o.DoctorName, ORDER_ID: o.OrderID, PATIENT_ID: o.PatientID, ORDER_DATE: PrintService.vnDate_(o.OrderDate),
      FOLLOWUP_DATE: o.FollowUpDate ? PrintService.vnDate_(o.FollowUpDate) : '', DAY: od.getDate(), MONTH: od.getMonth() + 1,
      YEAR: od.getFullYear(), PRINT_TIME: Utilities.formatDate(new Date(), APP.TZ, 'HH:mm:ss'), LAB_HEAD: settings.LAB_HEAD || ''
    };
    Object.keys(map).forEach(function (k) { body.replaceText(esc(k), String(map[k] === undefined || map[k] === null ? '' : map[k])); });
    data.results.forEach(function (r) {
      body.replaceText(esc('T:' + r.TestCode), String(r.Value || ''));
      body.replaceText(esc('R:' + r.TestCode), String(r.RefText || ''));
      body.replaceText(esc('F:' + r.TestCode), r.Flag && r.Flag !== 'N' ? r.Flag : '');
    });
    body.replaceText('\\{\\{[TRF]:[A-Z0-9_]+\\}\\}', '');   // clear unfilled tokens
  },

  /* ---------------------------------------------------------------- HELPERS */
  /** Font phiếu in (Settings.PRINT_FONT) – chỉ nhận font có sẵn trong Google Docs; mặc định Be Vietnam Pro (thiết kế cho tiếng Việt). */
  FONTS: ['Be Vietnam Pro', 'Arial', 'Roboto', 'Noto Sans', 'Times New Roman'],
  fontOf_: function (settings) {
    var f = String(settings.PRINT_FONT || '').trim().toLowerCase();
    return PrintService.FONTS.filter(function (x) { return x.toLowerCase() === f; })[0] || 'Be Vietnam Pro';
  },

  para_: function (p, text, size, bold, color) {
    p.setText(String(text || ''));
    return PrintService.styleText_(p, size, bold, color);
  },

  styleText_: function (p, size, bold, color) {
    p.setSpacingBefore(0).setSpacingAfter(0).setLineSpacing(1.05);
    var t = p.editAsText();
    if (t.getText().length) {
      t.setFontFamily(PrintService.font).setFontSize(size).setBold(!!bold).setForegroundColor(color || '#000000');
    }
    return p;
  },

  vnDate_: function (s) {
    var d = toDateStr_(s);
    return d ? d.substring(8, 10) + '/' + d.substring(5, 7) + '/' + d.substring(0, 4) : '';
  },

  imageBlob_: function (fileId) {
    if (!fileId) return null;
    try { return DriveApp.getFileById(fileId).getBlob(); } catch (e) { return null; }
  },

  /**
   * Watermark: logo đã làm mờ (PNG trong suốt) đặt giữa trang, nổi trên chữ nhưng đủ nhạt để chữ vẫn đọc rõ
   * (DocumentApp không hỗ trợ ảnh nằm dưới chữ). Gắn vào đoạn tiêu đề của mỗi nhóm → mỗi trang 1 watermark.
   */
  firstParagraphFrom_: function (body, idx) {
    for (var i = idx; i < body.getNumChildren(); i++) {
      if (body.getChild(i).getType() === DocumentApp.ElementType.PARAGRAPH) return body.getChild(i).asParagraph();
    }
    return null;
  },

  addWatermark_: function (anchor, blob, size) {
    try {
      var img = anchor.addPositionedImage(blob);
      var w = (size[0] - 52) * 0.62, ratio = img.getHeight() / img.getWidth();
      img.setWidth(Math.round(w)).setHeight(Math.round(w * ratio))
         .setLeftOffset(Math.round((size[0] - 52 - w) / 2)).setTopOffset(Math.round(size[1] * 0.12))
         .setLayout(DocumentApp.PositionedLayout.ABOVE_TEXT);
    } catch (e) { console.warn('Watermark: ' + e.message); }
  },

  logoBlob_: function (url) {
    if (!url) return null;
    try {
      var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) return null;
      var blob = res.getBlob();
      return /^image\//.test(blob.getContentType()) ? blob : null;
    } catch (e) { return null; }
  },

  archive_: function (blob, folderId, orderDate) {
    try {
      var root = DriveApp.getFolderById(folderId);
      var d = toDateStr_(orderDate);
      var sub = function (parent, name) {
        var it = parent.getFoldersByName(name);
        return it.hasNext() ? it.next() : parent.createFolder(name);
      };
      sub(sub(root, d.substring(0, 4)), d.substring(5, 7)).createFile(blob.copyBlob());
    } catch (e) { console.warn('Archive PDF failed: ' + e.message); }
  },

  markPrinted_: function (orderId, codes, ctx) {
    var year = YearDb.locateOrder(orderId);
    withLock_(function () {
      var rows = Db.findBy(T.ORDER_PANELS, year, 'OrderID', orderId).filter(function (x) { return codes.indexOf(x.PanelCode) > -1; });
      Db.updateRows(T.ORDER_PANELS, year, rows.map(function (x) {
        return { row: x._row, patch: { PrintCount: toNum_(x.PrintCount, 0) + 1, LastPrintedAt: nowIso_() } };
      }));
    });
    Audit.write(ctx, year, 'PRINT', 'Order', orderId, { panels: codes });
  }
};

/* ---- 10_Admin.gs ---- */
/**
 * 10_Admin.gs – Quản trị: tài khoản, vai trò & quyền, cấu hình, danh mục, kết nối DB theo năm.
 */

var PERM_LABELS = [
  { key: PERM.ORDER_CREATE, label: 'Tạo phiếu yêu cầu XN', group: 'Phiếu XN' },
  { key: PERM.ORDER_VIEW, label: 'Tra cứu phiếu XN', group: 'Phiếu XN' },
  { key: PERM.ORDER_EDIT, label: 'Sửa phiếu / thanh toán', group: 'Phiếu XN' },
  { key: PERM.ORDER_CANCEL, label: 'Hủy phiếu', group: 'Phiếu XN' },
  { key: PERM.PRICE_OVERRIDE, label: 'Sửa đơn giá / chiết khấu', group: 'Phiếu XN' },
  { key: PERM.RESULT_ENTER, label: 'Nhập / sửa kết quả', group: 'Kết quả' },
  { key: PERM.HISTORY_VIEW, label: 'Xem lịch sử chỉ số', group: 'Kết quả' },
  { key: PERM.PRINT, label: 'In / xuất phiếu kết quả', group: 'Kết quả' },
  { key: PERM.PATIENT_EDIT, label: 'Sửa hồ sơ bệnh nhân', group: 'Bệnh nhân' },
  { key: PERM.FOLLOWUP_VIEW, label: 'Cảnh báo tái khám', group: 'Bệnh nhân' },
  { key: PERM.REPORT_REVENUE, label: 'Thống kê doanh thu', group: 'Báo cáo' },
  { key: PERM.REPORT_EXPORT, label: 'Xuất Excel báo cáo tổng (toàn bộ phiếu)', group: 'Báo cáo' },
  { key: PERM.WORK_EXPORT, label: 'Xuất danh sách phiếu mình phụ trách', group: 'Báo cáo' },
  { key: PERM.AUDIT_VIEW, label: 'Xem nhật ký hệ thống', group: 'Quản trị' },
  { key: PERM.ADMIN_USERS, label: 'Quản lý tài khoản & vai trò', group: 'Quản trị' },
  { key: PERM.ADMIN_CONFIG, label: 'Cấu hình hệ thống & danh mục', group: 'Quản trị' }
];

var AdminService = {
  /* ------------------------------------------------------------- USERS */
  listUsers: function () {
    return Db.readAll(T.USERS).map(function (u) {
      return { Username: u.Username, FullName: u.FullName, RoleCode: u.RoleCode, IsActive: toBool_(u.IsActive),
               MustChangePassword: toBool_(u.MustChangePassword), LastLoginAt: u.LastLoginAt, CreatedAt: u.CreatedAt };
    });
  },

  /** p: { Username, FullName, RoleCode, IsActive, Password? } */
  saveUser: function (p, ctx) {
    required_(p, ['Username', 'FullName', 'RoleCode']);
    var username = String(p.Username).trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new AppError('VALIDATION', 'Tên đăng nhập 3–32 ký tự: a-z 0-9 . _ -');
    if (!Roles.get(p.RoleCode)) throw new AppError('VALIDATION', 'Vai trò không tồn tại: ' + p.RoleCode);
    return withLock_(function () {
      var cur = Db.findOne(T.USERS, null, 'Username', username);
      var active = p.IsActive === undefined ? true : toBool_(p.IsActive);
      if (cur) {
        var losingAdmin = AdminService.isAdminRole_(cur.RoleCode) && toBool_(cur.IsActive) && (!active || !AdminService.isAdminRole_(p.RoleCode));
        if (losingAdmin && AdminService.countActiveAdmins_() <= 1) throw new AppError('VALIDATION', 'Phải còn ít nhất 1 tài khoản quản trị hoạt động.');
        var patch = { FullName: String(p.FullName).trim(), RoleCode: p.RoleCode, IsActive: active, UpdatedAt: nowIso_() };
        if (p.Password) {
          Auth.validatePassword_(p.Password);
          patch.Salt = Auth.newSalt();
          patch.PasswordHash = Auth.hash(String(p.Password), patch.Salt);
          patch.MustChangePassword = true;
        }
        Db.updateRow(T.USERS, null, cur._row, patch);
        CacheUtil.remove(WorkService.USERS_KEY);
        if (!active || cur.RoleCode !== p.RoleCode || p.Password) Auth.revokeUser(username);
        SysLog.write(ctx.username, 'USER_UPDATE', 'User', username, { role: p.RoleCode, active: active, passwordReset: !!p.Password });
      } else {
        Auth.validatePassword_(p.Password);
        var salt = Auth.newSalt();
        Db.insert(T.USERS, null, [{
          Username: username, FullName: String(p.FullName).trim(), RoleCode: p.RoleCode, Salt: salt,
          PasswordHash: Auth.hash(String(p.Password), salt), IsActive: active, MustChangePassword: true,
          CreatedAt: nowIso_(), UpdatedAt: nowIso_()
        }]);
        SysLog.write(ctx.username, 'USER_CREATE', 'User', username, { role: p.RoleCode });
        CacheUtil.remove(WorkService.USERS_KEY);
      }
      return AdminService.listUsers();
    });
  },

  resetPassword: function (p, ctx) {
    required_(p, ['Username', 'NewPassword']);
    Auth.validatePassword_(p.NewPassword);
    return withLock_(function () {
      var cur = Db.findOne(T.USERS, null, 'Username', String(p.Username).toLowerCase());
      if (!cur) throw new AppError('NOT_FOUND', 'Không tìm thấy tài khoản');
      var salt = Auth.newSalt();
      Db.updateRow(T.USERS, null, cur._row, { Salt: salt, PasswordHash: Auth.hash(String(p.NewPassword), salt), MustChangePassword: true, UpdatedAt: nowIso_() });
      Auth.revokeUser(cur.Username);
      SysLog.write(ctx.username, 'USER_RESET_PASSWORD', 'User', cur.Username, {});
      return true;
    });
  },

  isAdminRole_: function (code) {
    var r = Roles.get(code);
    return !!r && (r.Permissions.indexOf('*') > -1 || r.Permissions.indexOf(PERM.ADMIN_USERS) > -1);
  },

  countActiveAdmins_: function () {
    return Db.readAll(T.USERS).filter(function (u) { return toBool_(u.IsActive) && AdminService.isAdminRole_(u.RoleCode); }).length;
  },

  /* ------------------------------------------------------------- ROLES */
  listRoles: function () {
    return { roles: Roles.all(), permissions: PERM_LABELS };
  },

  /** p: { RoleCode, RoleName, Permissions: [] } */
  saveRole: function (p, ctx) {
    required_(p, ['RoleCode', 'RoleName']);
    var code = String(p.RoleCode).trim().toUpperCase();
    if (!/^[A-Z0-9_]{2,20}$/.test(code)) throw new AppError('VALIDATION', 'Mã vai trò 2–20 ký tự A-Z 0-9 _');
    var valid = PERM_LABELS.map(function (x) { return x.key; }).concat(['*']);
    var perms = (p.Permissions || []).filter(function (x) { return valid.indexOf(x) > -1; });
    return withLock_(function () {
      var cur = Db.findOne(T.ROLES, null, 'RoleCode', code);
      if (cur && toBool_(cur.IsSystem) && code === 'ADMIN' && perms.indexOf('*') === -1) {
        throw new AppError('VALIDATION', 'Không thể bỏ toàn quyền của vai trò ADMIN hệ thống.');
      }
      var row = { RoleCode: code, RoleName: String(p.RoleName).trim(), Permissions: perms.join(',') };
      if (cur) Db.updateRow(T.ROLES, null, cur._row, row);
      else { row.IsSystem = false; Db.insert(T.ROLES, null, [row]); }
      Roles.invalidate();
      CacheUtil.remove(WorkService.USERS_KEY);
      SysLog.write(ctx.username, cur ? 'ROLE_UPDATE' : 'ROLE_CREATE', 'Role', code, { permissions: perms });
      return AdminService.listRoles();
    });
  },

  /* ------------------------------------------------------------- SETTINGS */
  getSettings: function () {
    return Db.readAll(T.SETTINGS).map(function (r) { return { Key: r.Key, Value: r.Value, Description: r.Description }; });
  },

  /** p: { items: [{Key, Value}] } */
  saveSettings: function (p, ctx) {
    return withLock_(function () { return AdminService.saveSettingsNoLock_(p, ctx); });
  },

  saveSettingsNoLock_: function (p, ctx) {
    var items = p.items || [];
    return (function () {
      var rows = Db.readAll(T.SETTINGS);
      var byKey = {};
      rows.forEach(function (r) { byKey[r.Key] = r; });
      var updates = [], inserts = [], changed = {};
      items.forEach(function (it) {
        var k = String(it.Key || '').trim();
        if (!k) return;
        var v = it.Value === null || it.Value === undefined ? '' : String(it.Value);
        if (byKey[k]) {
          if (String(byKey[k].Value) !== v) { updates.push({ row: byKey[k]._row, patch: { Value: v } }); changed[k] = { from: byKey[k].Value, to: v }; }
        } else { inserts.push({ Key: k, Value: v, Description: it.Description || '' }); changed[k] = { from: '', to: v }; }
      });
      Db.updateRows(T.SETTINGS, null, updates);
      if (inserts.length) Db.insert(T.SETTINGS, null, inserts);
      Settings.invalidate();
      Object.keys(changed).forEach(function (k) { if (/_DATA$/.test(k)) changed[k] = { from: '(ảnh)', to: '(ảnh)' }; });
      SysLog.write(ctx.username, 'SETTINGS_UPDATE', 'Settings', '', changed);
      return AdminService.getSettings();
    })();
  },

  /* ------------------------------------------------------------- LOGO & WATERMARK */
  /**
   * p: { logo: dataURL (PNG chất lượng cao, in phiếu), thumb: dataURL (≤ 45k ký tự, hiển thị web),
   *      watermark: dataURL (PNG đã làm mờ theo độ trong suốt), opacity: 0.03–0.3, enabled: bool }
   * Ảnh lớn lưu file Google Drive (thư mục LIS_Assets cạnh Sheet CONFIG); bản thu nhỏ lưu Settings để web hiển thị.
   */
  uploadLogo: function (p, ctx) {
    required_(p, ['logo', 'thumb']);
    if (String(p.thumb).length > 45000) throw new AppError('VALIDATION', 'Ảnh thu nhỏ quá lớn, hãy dùng logo đơn giản hơn.');
    var toBlob = function (dataUrl, name) {
      var m = String(dataUrl).match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);
      if (!m) throw new AppError('VALIDATION', 'Ảnh không hợp lệ (chỉ PNG/JPG).');
      return Utilities.newBlob(Utilities.base64Decode(m[3]), m[1], name);
    };
    return withLock_(function () {
      var folder = AdminService.assetFolder_();
      var old = Settings.all();
      [old.CLINIC_LOGO_FILE_ID, old.CLINIC_WATERMARK_FILE_ID].forEach(function (id) {
        if (id) try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* đã xóa */ }
      });
      var logoId = folder.createFile(toBlob(p.logo, 'clinic_logo.png')).getId();
      var wmId = p.watermark ? folder.createFile(toBlob(p.watermark, 'clinic_watermark.png')).getId() : '';
      var op = Math.min(0.3, Math.max(0.03, toNum_(p.opacity, 0.08)));
      AdminService.saveSettingsNoLock_({ items: [
        { Key: 'CLINIC_LOGO_DATA', Value: p.thumb, Description: 'Logo thu nhỏ (tự sinh khi tải logo – không sửa tay)' },
        { Key: 'CLINIC_LOGO_FILE_ID', Value: logoId, Description: 'ID file logo trên Drive (in phiếu PDF/Word)' },
        { Key: 'CLINIC_WATERMARK_FILE_ID', Value: wmId, Description: 'ID file watermark trên Drive' },
        { Key: 'WATERMARK_ENABLED', Value: p.enabled === false ? 'FALSE' : 'TRUE', Description: 'TRUE = in logo mờ (watermark) giữa phiếu kết quả' },
        { Key: 'WATERMARK_OPACITY', Value: String(op), Description: 'Độ đậm watermark (0.03 – 0.3)' }
      ] }, ctx);
      SysLog.write(ctx.username, 'LOGO_UPLOAD', 'Settings', 'logo', { logoId: logoId, watermarkId: wmId, opacity: op });
      return Settings.all();
    });
  },

  removeLogo: function (p, ctx) {
    return withLock_(function () {
      var old = Settings.all();
      [old.CLINIC_LOGO_FILE_ID, old.CLINIC_WATERMARK_FILE_ID].forEach(function (id) {
        if (id) try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* đã xóa */ }
      });
      AdminService.saveSettingsNoLock_({ items: [{ Key: 'CLINIC_LOGO_DATA', Value: '' }, { Key: 'CLINIC_LOGO_FILE_ID', Value: '' }, { Key: 'CLINIC_WATERMARK_FILE_ID', Value: '' }] }, ctx);
      SysLog.write(ctx.username, 'LOGO_REMOVE', 'Settings', 'logo', {});
      return Settings.all();
    });
  },

  assetFolder_: function () {
    var name = 'LIS_Assets';
    var cfg = DriveApp.getFileById(PropertiesService.getScriptProperties().getProperty(PROP.CONFIG_DB_ID));
    var parents = cfg.getParents();
    var parent = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
    var it = parent.getFoldersByName(name);
    return it.hasNext() ? it.next() : parent.createFolder(name);
  },

  /* ------------------------------------------------------------- YEAR DATABASES */
  listYearDbs: function () {
    return Db.readAll(T.YEAR_DBS).map(function (r) {
      var used = toNum_(r.UsedCells, 0);
      return { Year: Number(r.Year), SpreadsheetId: r.SpreadsheetId, Mode: r.Mode || 'RW', Note: r.Note, UsedCells: used,
               UsedPercent: Math.round(used / CAPACITY.MAX_CELLS * 1000) / 10, CheckedAt: r.CheckedAt,
               OrderRows: toNum_(r.OrderRows, 0), ResultRows: toNum_(r.ResultRows, 0) };
    }).sort(function (a, b) { return a.Year - b.Year; });
  },

  /** Ngưỡng số dòng tạo DB nối tiếp. p: { orders, results } (0 = không giới hạn). */
  saveYearLimits: function (p, ctx) {
    var o = Math.floor(Number(p.orders)), r = Math.floor(Number(p.results));
    if (!(o >= 0) || !(r >= 0)) throw new AppError('VALIDATION', 'Ngưỡng phải là số ≥ 0');
    if ((o > 0 && o < 1000) || (r > 0 && r < 5000)) throw new AppError('VALIDATION', 'Ngưỡng quá nhỏ (tối thiểu 1.000 phiếu / 5.000 dòng kết quả) – sẽ sinh quá nhiều file DB.');
    AdminService.saveSettings({ items: [{ Key: 'DB_MAX_ORDER_ROWS', Value: String(o) }, { Key: 'DB_MAX_RESULT_ROWS', Value: String(r) }] }, ctx);
    return YearDb.limits();
  },

  /** Tạo Google Sheet DB mới (năm mới hoặc DB nối tiếp khi đầy). p: { Year } */
  createYearDb: function (p, ctx) {
    required_(p, ['Year']);
    var year = Number(p.Year);
    if (year < 2000 || year > 2100) throw new AppError('VALIDATION', 'Năm không hợp lệ');
    return withLock_(function () {
      var row = YearDb.create(year, ctx.username);
      return { created: row, list: AdminService.listYearDbs() };
    });
  },

  /** Cắt gọn cột/dòng trống của mọi bảng: Config, Customers và tất cả DB năm → đo lại dung lượng. */
  optimizeStorage: function (p, ctx) {
    return withLock_(function () {
      var ids = Db.coreIds().concat(YearDb.allIds()), seen = {}, results = [];
      ids.forEach(function (id) {
        if (!id || seen[id]) return;
        seen[id] = true;
        try { results.push(Db.optimize(id)); } catch (e) { results.push({ id: id, error: e.message }); }
      });
      YearDb.refreshCapacity();
      var freed = results.reduce(function (s, r) { return s + (r.freed || 0); }, 0);
      SysLog.write(ctx.username, 'STORAGE_OPTIMIZE', 'YearDatabase', '', { files: results.length, freed: freed });
      return { results: results, freed: freed, list: AdminService.listYearDbs() };
    });
  },

  refreshCapacity: function () {
    withLock_(function () { YearDb.refreshCapacity(); });
    return AdminService.listYearDbs();
  },

  /** p: { Province, wards: ['Phường A', 'Xã B', ...] } – thay toàn bộ danh mục phường/xã của tỉnh. */
  saveWards: function (p, ctx) {
    required_(p, ['Province']);
    var pv = String(p.Province).trim();
    var seen = {};
    var list = (p.wards || []).map(function (w) { return String(w).replace(/\s+/g, ' ').trim(); })
      .filter(function (w) { if (!w || seen[w.toUpperCase()]) return false; seen[w.toUpperCase()] = true; return true; });
    return withLock_(function () {
      var keep = Db.readAll(T.WARDS).filter(function (r) { return r.Province !== pv; })
        .map(function (r) { return { Province: r.Province, WardName: r.WardName, SortOrder: r.SortOrder, IsActive: r.IsActive }; });
      list.forEach(function (w, i) { keep.push({ Province: pv, WardName: w, SortOrder: i + 1, IsActive: true }); });
      Db.replaceAll(T.WARDS, null, keep);
      Catalog.invalidate();
      SysLog.write(ctx.username, 'WARDS_SAVE', 'Wards', pv, { count: list.length });
      return Catalog.get();
    });
  },

  /** p: { SpreadsheetId } → kiểm tra quyền truy cập + bảng đang có. */
  testYearDb: function (p) {
    required_(p, ['SpreadsheetId']);
    var id = AdminService.extractId_(p.SpreadsheetId);
    try {
      var ss = SpreadsheetApp.openById(id);
      var names = ss.getSheets().map(function (s) { return s.getName(); });
      var need = [T.ORDERS, T.ORDER_PANELS, T.RESULTS, T.AUDIT];
      return { ok: true, id: id, name: ss.getName(), url: ss.getUrl(), sheets: names,
               missing: need.filter(function (n) { return names.indexOf(n) === -1; }) };
    } catch (e) {
      return { ok: false, id: id, error: 'Không truy cập được: ' + e.message + '. Hãy chia sẻ quyền Editor cho tài khoản chạy Web App.' };
    }
  },

  /** p: { Year, SpreadsheetId, Mode ('RW'|'RO'), Note } – tạo bảng thiếu nếu Mode = RW. */
  saveYearDb: function (p, ctx) {
    required_(p, ['Year', 'SpreadsheetId']);
    var year = Number(p.Year);
    if (year < 2000 || year > 2100) throw new AppError('VALIDATION', 'Năm không hợp lệ');
    var id = AdminService.extractId_(p.SpreadsheetId);
    var mode = DB_MODE[String(p.Mode || 'RW').toUpperCase()] || DB_MODE.RW;
    var test = AdminService.testYearDb({ SpreadsheetId: id });
    if (!test.ok) throw new AppError('DB_UNAVAILABLE', test.error);
    // Tên = tên file Google Sheet thật: nhập tên mới → đổi tên file trên Drive; để trống → giữ tên file hiện tại
    var name = String(p.Note || '').trim() || test.name;
    if (name.length > 100) throw new AppError('VALIDATION', 'Tên file tối đa 100 ký tự');
    if (name !== test.name) {
      try { SpreadsheetApp.openById(id).rename(name); }
      catch (e) { throw new AppError('DB_UNAVAILABLE', 'Không đổi được tên file Google Sheet: ' + e.message + '. Cần quyền Editor trên file.'); }
    }
    return withLock_(function () {
      var cur = Db.findOne(T.YEAR_DBS, null, 'SpreadsheetId', id);
      if (mode === DB_MODE.RW) {   // mỗi năm chỉ 1 DB nhận phiếu mới
        Db.readAll(T.YEAR_DBS).forEach(function (r) {
          if (Number(r.Year) === year && String(r.SpreadsheetId) !== id && String(r.Mode).toUpperCase() === DB_MODE.RW) Db.updateRow(T.YEAR_DBS, null, r._row, { Mode: DB_MODE.FULL });
        });
      }
      var row = { Year: year, SpreadsheetId: id, Mode: mode, Note: name };
      if (cur) Db.updateRow(T.YEAR_DBS, null, cur._row, row); else Db.insert(T.YEAR_DBS, null, [row]);
      YearDb.invalidate();
      if (mode !== DB_MODE.RO) {
        var ss = SpreadsheetApp.openById(id);
        [T.ORDERS, T.ORDER_PANELS, T.RESULTS, T.AUDIT].forEach(function (t) { Db.ensureSheet(ss, t); });
      }
      SysLog.write(ctx.username, 'YEAR_DB_SAVE', 'YearDatabase', String(year), row);
      return AdminService.listYearDbs();
    });
  },

  extractId_: function (s) {
    var m = String(s).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    return m ? m[1] : String(s).trim();
  },

  /* ------------------------------------------------------------- CATALOG */
  /** p: Test object (TestCode required). */
  saveTest: function (p, ctx) {
    required_(p, ['TestCode', 'TestName', 'ResultType']);
    var code = String(p.TestCode).trim().toUpperCase();
    if (!/^[A-Z0-9_]{1,24}$/.test(code)) throw new AppError('VALIDATION', 'Mã chỉ số chỉ gồm A-Z 0-9 _');
    if (!ENUM.RESULT_TYPE[String(p.ResultType).toUpperCase()]) throw new AppError('VALIDATION', 'Kiểu kết quả: NUM | QUAL | BLOOD | TEXT');
    return withLock_(function () {
      var cur = Db.findOne(T.TESTS, null, 'TestCode', code);
      var n = function (v) { var x = toNum_(v); return x === null ? '' : x; };
      var row = {
        TestCode: code, TestName: String(p.TestName).trim(), Unit: p.Unit || '', ResultType: String(p.ResultType).toUpperCase(),
        RefMinM: n(p.RefMinM), RefMaxM: n(p.RefMaxM), RefMinF: n(p.RefMinF), RefMaxF: n(p.RefMaxF), RefText: p.RefText || '',
        Price: toNum_(p.Price, 0), SortOrder: toNum_(p.SortOrder, 999), IsActive: p.IsActive === undefined ? true : toBool_(p.IsActive),
        LegacyName: p.LegacyName || (cur ? cur.LegacyName : '')
      };
      if (cur) Db.updateRow(T.TESTS, null, cur._row, row); else Db.insert(T.TESTS, null, [row]);
      Catalog.invalidate();
      SysLog.write(ctx.username, cur ? 'TEST_UPDATE' : 'TEST_CREATE', 'Test', code, cur ? PatientService.diff_(cur, row) : row);
      return Catalog.get();
    });
  },

  /** p: { panel: {...}, tests: [TestCode...] } */
  savePanel: function (p, ctx) {
    var panel = p.panel || {};
    required_(panel, ['PanelCode', 'PanelName']);
    var code = String(panel.PanelCode).trim().toUpperCase();
    if (!/^[A-Z0-9]{2,6}$/.test(code)) throw new AppError('VALIDATION', 'Mã nhóm 2–6 ký tự A-Z 0-9');
    var tm = Catalog.testMap();
    var tests = (p.tests || []).filter(function (c) { return tm[c]; });
    return withLock_(function () {
      var cur = Db.findOne(T.PANELS, null, 'PanelCode', code);
      var row = {
        PanelCode: code, PanelName: String(panel.PanelName).trim(), PrintTitle: panel.PrintTitle || 'PHIẾU KẾT QUẢ XÉT NGHIỆM',
        PrintSubtitle: panel.PrintSubtitle || '', PricingMode: String(panel.PricingMode || 'TEST').toUpperCase() === 'PANEL' ? 'PANEL' : 'TEST',
        Price: toNum_(panel.Price, 0), SortOrder: toNum_(panel.SortOrder, 999),
        IsActive: panel.IsActive === undefined ? true : toBool_(panel.IsActive), TemplateDocId: panel.TemplateDocId || '',
        PageSize: /^A[45]$/.test(String(panel.PageSize || '').toUpperCase()) ? String(panel.PageSize).toUpperCase() : ''
      };
      if (cur) Db.updateRow(T.PANELS, null, cur._row, row); else Db.insert(T.PANELS, null, [row]);
      if (p.tests) {
        var all = Db.readAll(T.PANEL_TESTS).filter(function (x) { return x.PanelCode !== code; });
        tests.forEach(function (c, i) { all.push({ PanelCode: code, TestCode: c, SortOrder: i + 1 }); });
        Db.replaceAll(T.PANEL_TESTS, null, all.map(function (x) { return { PanelCode: x.PanelCode, TestCode: x.TestCode, SortOrder: x.SortOrder }; }));
      }
      Catalog.invalidate();
      SysLog.write(ctx.username, cur ? 'PANEL_UPDATE' : 'PANEL_CREATE', 'Panel', code, { panel: row, tests: tests });
      return Catalog.get();
    });
  },

  /** p: { DoctorName, IsActive, SortOrder, OriginalName? } */
  saveDoctor: function (p, ctx) {
    required_(p, ['DoctorName']);
    var name = normName_(p.DoctorName);
    return withLock_(function () {
      var cur = Db.findOne(T.DOCTORS, null, 'DoctorName', p.OriginalName ? normName_(p.OriginalName) : name);
      var row = { DoctorName: name, IsActive: p.IsActive === undefined ? true : toBool_(p.IsActive), SortOrder: toNum_(p.SortOrder, 999) };
      if (cur) Db.updateRow(T.DOCTORS, null, cur._row, row); else Db.insert(T.DOCTORS, null, [row]);
      Catalog.invalidate();
      SysLog.write(ctx.username, 'DOCTOR_SAVE', 'Doctor', name, row);
      return Catalog.get();
    });
  },

  clearCache: function () {
    [CACHE.CATALOG, CACHE.SETTINGS, CACHE.ROLES, CACHE.YEAR_DBS].forEach(function (k) { CacheUtil.remove(k); });
    Settings._memo = null;
    Db.bumpHeaderVersion();          // bỏ cache tiêu đề cột (khi đã sửa cột trực tiếp trên Google Sheet)
    CacheUtil.remove(PatientService.INDEX_KEY);
    return true;
  }
};

/* ---- 11_Work.gs ---- */
/**
 * 11_Work.gs – Phân công phiếu cho nhân viên, màn "Việc của tôi", xuất danh sách công việc, báo cáo năng suất.
 *
 *  - Orders.AssignedTo = danh sách username phụ trách (phân cách dấu phẩy).
 *  - Phân công KHÔNG thay đổi quyền tra cứu / báo cáo: tra cứu vẫn theo vai trò; báo cáo tổng luôn gồm toàn bộ phiếu.
 *  - Nhân viên (quyền work.export) xuất danh sách phiếu mình phụ trách – KHÔNG có cột tiền.
 *  - Admin (admin.users | '*') xem / xuất "Việc của tôi" của mọi nhân viên hoặc tất cả.
 *  - Mỗi lần xuất ghi SystemLog (WORK_EXPORT).
 */
var WorkService = {
  USERS_KEY: 'user_opts_v1',

  /**
   * Danh sách nhân viên được phép phụ trách phiếu: tài khoản đang hoạt động,
   * KHÔNG gồm vai trò Quản trị hệ thống (toàn quyền '*').
   */
  userOptions: function () {
    var c = CacheUtil.get(WorkService.USERS_KEY);
    if (c) return c;
    var roles = {}, sysAdmin = {};
    Roles.all().forEach(function (r) { roles[r.RoleCode] = r.RoleName; if (r.Permissions.indexOf('*') > -1) sysAdmin[r.RoleCode] = true; });
    var list = Db.readAll(T.USERS).filter(function (u) { return toBool_(u.IsActive) && !sysAdmin[u.RoleCode]; }).map(function (u) {
      return { Username: String(u.Username), FullName: u.FullName, RoleCode: u.RoleCode, RoleName: roles[u.RoleCode] || u.RoleCode };
    }).sort(function (a, b) { return String(a.FullName).localeCompare(String(b.FullName), 'vi'); });
    CacheUtil.put(WorkService.USERS_KEY, list, CACHE.TTL_LONG);
    return list;
  },

  /** Chuẩn hóa + kiểm tra danh sách username phụ trách. */
  normAssignees: function (list) {
    if (list === undefined || list === null || list === '') return [];
    var arr = Array.isArray(list) ? list : String(list).split(',');
    var valid = {};
    WorkService.userOptions().forEach(function (u) { valid[u.Username] = true; });
    var out = [];
    arr.map(function (x) { return String(x).trim().toLowerCase(); }).filter(String).forEach(function (u) {
      if (!valid[u]) throw new AppError('VALIDATION', 'Không thể giao phiếu cho tài khoản "' + u + '" (không tồn tại, đã khóa hoặc là Quản trị hệ thống).');
      if (out.indexOf(u) === -1) out.push(u);
    });
    return out;
  },

  isAdmin_: function (ctx) { return Auth.hasPerm(ctx, PERM.ADMIN_USERS); },

  /** Người cần xem: nhân viên → chính mình; Admin → p.username ('' = tất cả phiếu có phân công, '*' = mọi phiếu). */
  target_: function (p, ctx) {
    if (!WorkService.isAdmin_(ctx)) return ctx.username;
    return p.username === undefined ? ctx.username : String(p.username);
  },

  collect_: function (p, ctx) {
    var to = toDateStr_(p.to) || todayStr_();
    var from = toDateStr_(p.from) || addDays_(to, -90);
    var who = WorkService.target_(p, ctx);
    var status = p.status || 'PENDING';
    var rows = [];
    YearDb.idsInRange(from, to).forEach(function (db) {
      var all;
      try { all = Db.readAll(T.ORDERS, db); } catch (e) { return; }
      all.forEach(function (o) {
        var d = toDateStr_(o.OrderDate);
        if (d < from || d > to || o.Status === ENUM.ORDER_STATUS.CANCELLED) return;
        var asg = o.AssignedTo ? String(o.AssignedTo).split(',') : [];
        if (who !== '*' && (who === '' ? !asg.length : asg.indexOf(who) === -1)) return;
        var done = o.Status === ENUM.ORDER_STATUS.COMPLETED;
        if (status === 'PENDING' && done) return;
        if (status === 'DONE' && !done) return;
        rows.push(o);
      });
    });
    rows.sort(function (a, b) { return a.OrderID < b.OrderID ? 1 : -1; });
    return { from: from, to: to, who: who, rows: rows };
  },

  /** p: { status: PENDING|DONE|ALL, from?, to?, username? (Admin) } */
  list: function (p, ctx) {
    var c = WorkService.collect_(p, ctx);
    var counts = { PENDING: 0, DONE: 0 };
    var all = WorkService.collect_(Object.assign({}, p, { status: 'ALL' }), ctx).rows;
    all.forEach(function (o) { counts[o.Status === ENUM.ORDER_STATUS.COMPLETED ? 'DONE' : 'PENDING']++; });
    return {
      from: c.from, to: c.to, who: c.who, counts: counts, isAdmin: WorkService.isAdmin_(ctx),
      rows: c.rows.slice(0, 500).map(function (o) { return WorkService.workView_(o); })
    };
  },

  /** Bản ghi công việc – không chứa thông tin tiền. */
  workView_: function (o) {
    var tat = WorkService.tatHours_(o);
    return {
      OrderID: o.OrderID, OrderDate: toDateStr_(o.OrderDate), PatientID: o.PatientID, PatientName: o.PatientName,
      Gender: o.Gender, Age: toNum_(o.Age), Phone: o.Phone, DoctorName: o.DoctorName, PanelCodes: o.PanelCodes,
      Status: o.Status, AssignedTo: o.AssignedTo ? String(o.AssignedTo).split(',') : [],
      CreatedAt: o.CreatedAt, FirstResultAt: o.FirstResultAt || '', CompletedAt: o.CompletedAt || '', TatHours: tat
    };
  },

  tatHours_: function (o) {
    if (!o.CompletedAt || !o.CreatedAt) return null;
    var a = WorkService.ts_(o.CreatedAt), b = WorkService.ts_(o.CompletedAt);
    return (a && b && b >= a) ? Math.round((b - a) / 360000) / 10 : null;
  },

  ts_: function (s) {
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):?(\d{2})?/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)).getTime() : null;
  },

  /** p: { status, from, to, username? (Admin), includeResults? } → dữ liệu xuất Excel (không có cột tiền). */
  exportData: function (p, ctx) {
    var c = WorkService.collect_(p, ctx);
    var users = {};
    WorkService.userOptions().forEach(function (u) { users[u.Username] = u.FullName; });
    var rows = c.rows.map(function (o) {
      var v = WorkService.workView_(o);
      v.AssignedNames = v.AssignedTo.map(function (u) { return users[u] || u; }).join(', ');
      return v;
    });
    var results = [];
    if (p.includeResults && rows.length) {
      var ids = {};
      rows.forEach(function (r) { ids[r.OrderID] = true; });
      var tm = Catalog.testMap();
      YearDb.idsInRange(c.from, c.to).forEach(function (db) {
        try {
          Db.readAll(T.RESULTS, db).forEach(function (r) {
            if (!ids[r.OrderID]) return;
            results.push({ OrderID: r.OrderID, OrderDate: toDateStr_(r.OrderDate), PatientID: r.PatientID, PanelCode: r.PanelCode,
                           TestCode: r.TestCode, TestName: (tm[r.TestCode] || {}).TestName || r.TestCode, Value: r.Value, Unit: r.Unit,
                           RefText: r.RefText, Flag: r.Flag });
          });
        } catch (e) { /* skip */ }
      });
    }
    SysLog.write(ctx.username, 'WORK_EXPORT', 'Work', c.who || '(all)', { from: c.from, to: c.to, status: p.status || 'PENDING', orders: rows.length });
    return { from: c.from, to: c.to, who: c.who, whoName: users[c.who] || (c.who === '*' ? 'Tất cả phiếu' : (c.who === '' ? 'Tất cả nhân viên' : c.who)),
             rows: rows, results: results };
  },

  /**
   * Thống kê nhanh công việc (không có tiền) – cùng phạm vi với "Việc của tôi".
   * p: { from, to, username? (Admin) }
   */
  summary: function (p, ctx) {
    var c = WorkService.collect_(Object.assign({}, p, { status: 'ALL' }), ctx);
    var nowTs = Date.now();
    var s = { total: 0, completed: 0, pending: 0, pendingOver24h: 0, today: 0, todayCompleted: 0 };
    var tats = [], byDay = {}, byPanel = {};
    var today = todayStr_();
    c.rows.forEach(function (o) {
      var d = toDateStr_(o.OrderDate);
      var done = o.Status === ENUM.ORDER_STATUS.COMPLETED;
      s.total++;
      if (done) s.completed++; else {
        s.pending++;
        var ct = WorkService.ts_(o.CreatedAt);
        if (ct && nowTs - ct > 86400000) s.pendingOver24h++;
      }
      if (d === today) { s.today++; if (done) s.todayCompleted++; }
      var t = WorkService.tatHours_(o);
      if (t !== null) tats.push(t);
      var day = byDay[d] = byDay[d] || { date: d, total: 0, completed: 0 };
      day.total++; if (done) day.completed++;
      String(o.PanelCodes || '').split(',').filter(String).forEach(function (pc) { byPanel[pc] = (byPanel[pc] || 0) + 1; });
    });
    tats.sort(function (a, b) { return a - b; });
    s.avgTatHours = tats.length ? Math.round(tats.reduce(function (a, b) { return a + b; }, 0) / tats.length * 10) / 10 : null;
    s.medianTatHours = tats.length ? tats[Math.floor(tats.length / 2)] : null;
    s.completionRate = s.total ? Math.round(s.completed / s.total * 1000) / 10 : 0;
    var pm = Catalog.panelMap();
    return {
      from: c.from, to: c.to, who: c.who, summary: s,
      byDay: Object.keys(byDay).sort().map(function (k) { return byDay[k]; }),
      byPanel: Object.keys(byPanel).map(function (k) { return { panelCode: k, panelName: (pm[k] || {}).PanelName || k, count: byPanel[k] }; })
        .sort(function (a, b) { return b.count - a.count; })
    };
  },

  /** Báo cáo năng suất theo nhân viên. p: { from, to } */
  productivity: function (p) {
    var to = toDateStr_(p.to) || todayStr_();
    var from = toDateStr_(p.from) || (to.substring(0, 8) + '01');
    var users = {};
    WorkService.userOptions().forEach(function (u) { users[u.Username] = u.FullName; });
    var stat = {};
    var unassigned = 0;
    YearDb.idsInRange(from, to).forEach(function (db) {
      var all;
      try { all = Db.readAll(T.ORDERS, db); } catch (e) { return; }
      all.forEach(function (o) {
        var d = toDateStr_(o.OrderDate);
        if (d < from || d > to || o.Status === ENUM.ORDER_STATUS.CANCELLED) return;
        var asg = o.AssignedTo ? String(o.AssignedTo).split(',').filter(String) : [];
        if (!asg.length) { unassigned++; return; }
        var tat = WorkService.tatHours_(o);
        asg.forEach(function (u) {
          var s = stat[u] = stat[u] || { username: u, fullName: users[u] || u, assigned: 0, completed: 0, pending: 0, tats: [] };
          s.assigned++;
          if (o.Status === ENUM.ORDER_STATUS.COMPLETED) s.completed++; else s.pending++;
          if (tat !== null) s.tats.push(tat);
        });
      });
    });
    var rows = Object.keys(stat).map(function (k) {
      var s = stat[k], t = s.tats.slice().sort(function (a, b) { return a - b; });
      return { username: s.username, fullName: s.fullName, assigned: s.assigned, completed: s.completed, pending: s.pending,
               avgTatHours: t.length ? Math.round(t.reduce(function (a, b) { return a + b; }, 0) / t.length * 10) / 10 : null,
               medianTatHours: t.length ? t[Math.floor(t.length / 2)] : null };
    }).sort(function (a, b) { return b.assigned - a.assigned; });
    return { from: from, to: to, rows: rows, unassigned: unassigned };
  }
};

/* ---- 90_Setup.gs ---- */
/**
 * 90_Setup.gs – Khởi tạo hệ thống (chạy thủ công trong Apps Script Editor).
 *
 *  1) setup()               : tạo bảng + dữ liệu mặc định + tài khoản admin (idempotent, chạy lại an toàn)
 *  2) migrationFinalize()   : sau khi import dữ liệu cũ → đồng bộ bộ đếm mã BN / XN
 *  3) healthCheck()         : kiểm tra kết nối 4 Google Sheet + số dòng mỗi bảng
 */

function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(PROP.CONFIG_DB_ID)) props.setProperty(PROP.CONFIG_DB_ID, DEFAULT_IDS.CONFIG_DB_ID);
  if (!props.getProperty(PROP.PATIENT_DB_ID)) props.setProperty(PROP.PATIENT_DB_ID, DEFAULT_IDS.PATIENT_DB_ID);

  var cfg = SpreadsheetApp.openById(props.getProperty(PROP.CONFIG_DB_ID));
  [T.SETTINGS, T.ROLES, T.USERS, T.PANELS, T.TESTS, T.PANEL_TESTS, T.DOCTORS, T.LOOKUPS, T.YEAR_DBS, T.WARDS, T.SEQUENCES, T.SYS_LOG]
    .forEach(function (t) { Db.ensureSheet(cfg, t); });
  Db.ensureSheet(SpreadsheetApp.openById(props.getProperty(PROP.PATIENT_DB_ID)), T.PATIENTS);

  seedIfEmpty_(T.SETTINGS, [
    { Key: 'CLINIC_NAME', Value: 'PHÒNG XN Y KHOA', Description: 'Tên phòng xét nghiệm (header phiếu, màn hình đăng nhập)' },
    { Key: 'CLINIC_LICENSE', Value: 'GP: 000324 CCĐKHNY', Description: 'Số giấy phép hoạt động' },
    { Key: 'CLINIC_ADDRESS', Value: '15 Lê Lợi, Pleiku, Gia Lai', Description: 'Địa chỉ' },
    { Key: 'CLINIC_PHONE', Value: '0935 249 351', Description: 'Số điện thoại' },
    { Key: 'CLINIC_CITY', Value: 'Pleiku', Description: 'Địa danh ghi ở dòng ngày ký' },
    { Key: 'CLINIC_LOGO_URL', Value: '', Description: 'URL ảnh logo (PNG/JPG công khai)' },
    { Key: 'LAB_HEAD', Value: 'CN. TÔN NỮ KIM HỒNG', Description: 'Người ký phiếu kết quả' },
    { Key: 'REPORT_FOOTER', Value: 'Những kết quả này được lưu trong hệ thống của phòng xét nghiệm. Nếu cần sao chép xin vui lòng gửi người đến hoặc gọi ĐT: 0935 249 351.', Description: 'Dòng chú thích cuối phiếu' },
    { Key: 'DEFAULT_DOCTOR', Value: 'KT SỨC KHỎE', Description: 'Bác sĩ chỉ định mặc định' },
    { Key: 'PRINT_PAGE_SIZE', Value: 'A5', Description: 'Khổ giấy phiếu kết quả: A5 | A4' },
    { Key: 'PRINT_ONLY_RESULTED', Value: 'TRUE', Description: 'TRUE = chỉ in chỉ số đã có kết quả' },
    { Key: 'ARCHIVE_PDF', Value: 'FALSE', Description: 'TRUE = lưu bản PDF vào thư mục Drive REPORT_FOLDER_ID' },
    { Key: 'REPORT_FOLDER_ID', Value: '', Description: 'ID thư mục Google Drive lưu PDF (năm/tháng)' },
    { Key: 'FOLLOWUP_WINDOW_DAYS', Value: '7', Description: 'Cảnh báo tái khám trước bao nhiêu ngày' },
    { Key: 'FOLLOWUP_PRESETS', Value: '7,14,30,90,180', Description: 'Gợi ý số ngày tái khám' },
    { Key: 'SESSION_HOURS', Value: '6', Description: 'Thời hạn phiên đăng nhập (giờ, tối đa 6)' }
  ]);
  addSettingIfMissing_('DB_MAX_ORDER_ROWS', String(CAPACITY.DEFAULT_MAX_ORDER_ROWS), 'Số phiếu tối đa / DB năm trước khi tự tạo DB nối tiếp (0 = không giới hạn)');
  addSettingIfMissing_('DB_MAX_RESULT_ROWS', String(CAPACITY.DEFAULT_MAX_RESULT_ROWS), 'Số dòng kết quả tối đa / DB năm trước khi tự tạo DB nối tiếp (0 = không giới hạn)');
  addSettingIfMissing_('DEFAULT_WARD', 'Phường Pleiku', 'Phường/Xã mặc định khi thêm bệnh nhân mới (thuộc tỉnh đầu tiên trong danh sách Tỉnh)');
  addSettingIfMissing_('PRINT_FONT', 'Be Vietnam Pro', 'Font chữ phiếu kết quả: Be Vietnam Pro | Arial | Roboto | Noto Sans | Times New Roman');
  addSettingIfMissing_('LOGIN_BG_URL', '', 'Ảnh nền màn hình đăng nhập (URL ảnh công khai). Trống = ảnh mặc định');
  addSettingIfMissing_('LOGIN_BG_DIM', '0.35', 'Độ tối lớp phủ ảnh nền đăng nhập: 0 (không phủ) – 0.8');
  addSettingIfMissing_('AUTO_CREATE_YEAR_DB', 'TRUE', 'TRUE = tự tạo Google Sheet DB_<năm> khi sang năm mới / DB đầy');

  seedIfEmpty_(T.ROLES, [
    { RoleCode: 'ADMIN', RoleName: 'Quản trị hệ thống', Permissions: '*', IsSystem: true },
    { RoleCode: 'DOCTOR', RoleName: 'Bác sĩ / Trưởng phòng XN', IsSystem: true, Permissions: [
        PERM.ORDER_CREATE, PERM.ORDER_VIEW, PERM.ORDER_EDIT, PERM.ORDER_CANCEL, PERM.PRICE_OVERRIDE, PERM.RESULT_ENTER,
        PERM.HISTORY_VIEW, PERM.PRINT, PERM.PATIENT_EDIT, PERM.FOLLOWUP_VIEW, PERM.REPORT_REVENUE, PERM.REPORT_EXPORT].join(',') },
    { RoleCode: 'TECH', RoleName: 'Kỹ thuật viên xét nghiệm', IsSystem: true, Permissions: [
        PERM.ORDER_VIEW, PERM.RESULT_ENTER, PERM.HISTORY_VIEW, PERM.PRINT, PERM.FOLLOWUP_VIEW, PERM.WORK_EXPORT].join(',') },
    { RoleCode: 'RECEPTION', RoleName: 'Tiếp nhận / Thu ngân', IsSystem: true, Permissions: [
        PERM.ORDER_CREATE, PERM.ORDER_VIEW, PERM.ORDER_EDIT, PERM.PRINT, PERM.PATIENT_EDIT, PERM.FOLLOWUP_VIEW, PERM.WORK_EXPORT].join(',') }
  ]);

  seedIfEmpty_(T.LOOKUPS, []
    .concat(['Negative', 'Positive'].map(function (v, i) { return { ListCode: 'QUAL', Value: v, SortOrder: i + 1 }; }))
    .concat(['A Rh+', 'B Rh+', 'AB Rh+', 'O Rh+', 'A Rh-', 'B Rh-', 'AB Rh-', 'O Rh-'].map(function (v, i) { return { ListCode: 'BLOOD', Value: v, SortOrder: i + 1 }; }))
    .concat(['Nam', 'Nữ'].map(function (v, i) { return { ListCode: 'GENDER', Value: v, SortOrder: i + 1 }; }))
    .concat(['Gia Lai', 'Quảng Ngãi', 'Đắk Lắk', 'Khánh Hòa', 'Lâm Đồng'].map(function (v, i) { return { ListCode: 'PROVINCE', Value: v, SortOrder: i + 1 }; })));

  seedIfEmpty_(T.DOCTORS, ['KT SỨC KHỎE', 'BS NGHĨA', 'BS SƠN', 'BS TOÁN', 'BS ANH', 'BS TÙNG', 'BS THỊNH', 'BS CHÂU', 'BS THANH']
    .map(function (n, i) { return { DoctorName: n, IsActive: true, SortOrder: i + 1 }; }));

  seedIfEmpty_(T.YEAR_DBS, DEFAULT_IDS.YEAR_DBS);
  seedIfEmpty_(T.WARDS, SEED_WARDS_GIA_LAI.split('|').map(function (w, i) { return { Province: 'Gia Lai', WardName: w, SortOrder: i + 1, IsActive: true }; }));
  seedIfEmpty_(T.PANELS, SEED_CATALOG.panels);
  seedIfEmpty_(T.TESTS, SEED_CATALOG.tests);
  seedIfEmpty_(T.PANEL_TESTS, SEED_CATALOG.panelTests);
  // v1.4.2: khổ giấy in theo từng nhóm (theo mẫu Word cũ) – chỉ điền ô đang trống, không ghi đè cấu hình admin
  var seedSize = {};
  SEED_CATALOG.panels.forEach(function (x) { seedSize[x.PanelCode] = x.PageSize || ''; });
  Db.readAll(T.PANELS).forEach(function (r) {
    if (!String(r.PageSize || '').trim() && seedSize[r.PanelCode]) Db.updateRow(T.PANELS, null, r._row, { PageSize: seedSize[r.PanelCode] });
  });
  CacheUtil.remove(CACHE.CATALOG);

  // Admin account (đổi mật khẩu ngay lần đăng nhập đầu)
  if (!Db.findOne(T.USERS, null, 'Username', 'admin')) {
    var salt = Auth.newSalt();
    Db.insert(T.USERS, null, [{
      Username: 'admin', FullName: 'Quản trị hệ thống', RoleCode: 'ADMIN', Salt: salt,
      PasswordHash: Auth.hash('Admin@123', salt), IsActive: true, MustChangePassword: true,
      CreatedAt: nowIso_(), UpdatedAt: nowIso_()
    }]);
  }

  // Year DB schemas
  AdminService.clearCache();
  YearDb.all().forEach(function (y) {
    if (y.Mode === 'RO') return;
    var ss = SpreadsheetApp.openById(y.SpreadsheetId);
    [T.ORDERS, T.ORDER_PANELS, T.RESULTS, T.AUDIT].forEach(function (t) { Db.ensureSheet(ss, t); });
  });

  installTriggers();
  try { YearDb.refreshCapacity(); } catch (e) { console.warn('Capacity: ' + e.message); }
  SysLog.write('system', 'SETUP', 'System', APP.VERSION, {});
  console.log('✅ Setup hoàn tất. Đăng nhập: admin / Admin@123 (bắt buộc đổi mật khẩu).');
  return healthCheck();
}

/** 135 phường/xã tỉnh Gia Lai (mới, từ 01/07/2025). Admin chỉnh trong Quản trị → Phường/Xã. */
var SEED_WARDS_GIA_LAI = 'Phường Quy Nhơn|Phường Quy Nhơn Đông|Phường Quy Nhơn Tây|Phường Quy Nhơn Nam|Phường Quy Nhơn Bắc|Phường Bình Định|Phường An Nhơn|Phường An Nhơn Đông|Phường An Nhơn Nam|Phường An Nhơn Bắc|Phường Bồng Sơn|Phường Hoài Nhơn|Phường Tam Quan|Phường Hoài Nhơn Đông|Phường Hoài Nhơn Tây|Phường Hoài Nhơn Nam|Phường Hoài Nhơn Bắc|Phường Pleiku|Phường Hội Phú|Phường Thống Nhất|Phường Diên Hồng|Phường An Phú|Phường An Khê|Phường An Bình|Phường Ayun Pa|Xã An Nhơn Tây|Xã Phù Cát|Xã Xuân An|Xã Ngô Mây|Xã Cát Tiến|Xã Đề Gi|Xã Hòa Hội|Xã Hội Sơn|Xã Phù Mỹ|Xã An Lương|Xã Bình Dương|Xã Phù Mỹ Đông|Xã Phù Mỹ Tây|Xã Phù Mỹ Nam|Xã Phù Mỹ Bắc|Xã Tuy Phước|Xã Tuy Phước Đông|Xã Tuy Phước Tây|Xã Tuy Phước Bắc|Xã Tây Sơn|Xã Bình Khê|Xã Bình Phú|Xã Bình Hiệp|Xã Bình An|Xã Hoài Ân|Xã Ân Tường|Xã Kim Sơn|Xã Vạn Đức|Xã Ân Hảo|Xã Vân Canh|Xã Canh Vinh|Xã Canh Liên|Xã Vĩnh Thạnh|Xã Vĩnh Thịnh|Xã Vĩnh Quang|Xã Vĩnh Sơn|Xã An Hòa|Xã An Lão|Xã An Vinh|Xã An Toàn|Xã Biển Hồ|Xã Gào|Xã Ia Ly|Xã Chư Păh|Xã Ia Khươl|Xã Ia Phí|Xã Chư Prông|Xã Bàu Cạn|Xã Ia Boòng|Xã Ia Lâu|Xã Ia Pia|Xã Ia Tôr|Xã Chư Sê|Xã Bờ Ngoong|Xã Ia Ko|Xã Al Bá|Xã Chư Pưh|Xã Ia Le|Xã Ia Hrú|Xã Cửu An|Xã Đak Pơ|Xã Ya Hội|Xã Kbang|Xã Kông Bơ La|Xã Tơ Tung|Xã Sơn Lang|Xã Đak Rong|Xã Kông Chro|Xã Ya Ma|Xã Chư Krey|Xã SRó|Xã Đăk Song|Xã Chơ Long|Xã Ia Rbol|Xã Ia Sao|Xã Phú Thiện|Xã Chư A Thai|Xã Ia Hiao|Xã Pờ Tó|Xã Ia Pa|Xã Ia Tul|Xã Phú Túc|Xã Ia Dreh|Xã Ia Rsai|Xã Uar|Xã Đak Đoa|Xã Kon Gang|Xã Ia Băng|Xã KDang|Xã Đak Sơmei|Xã Mang Yang|Xã Lơ Pang|Xã Kon Chiêng|Xã Hra|Xã Ayun|Xã Ia Grai|Xã Ia Krái|Xã Ia Hrung|Xã Đức Cơ|Xã Ia Dơk|Xã Ia Krêl|Xã Ia O|Xã Nhơn Châu|Xã Ia Púch|Xã Ia Mơ|Xã Ia Pnôn|Xã Ia Nan|Xã Ia Dom|Xã Ia Chia|Xã Krong';

function addSettingIfMissing_(key, value, desc) {
  if (!Db.findOne(T.SETTINGS, null, 'Key', key)) { Db.insert(T.SETTINGS, null, [{ Key: key, Value: value, Description: desc }]); Settings.invalidate(); }
}

/**
 * Trigger nền:
 *  - warmup()      mỗi 10 phút: giữ cache danh mục / cấu hình / danh bạ BN luôn sẵn → request của user nhanh hơn.
 *  - maintenance() 01:00 hằng ngày: đo dung lượng DB, tự tạo DB nối tiếp khi ≥ 85%, tạo sẵn DB năm sau từ 15/12.
 */
function installTriggers() {
  var have = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  if (have.indexOf('warmup') === -1) ScriptApp.newTrigger('warmup').timeBased().everyMinutes(10).create();
  if (have.indexOf('maintenance') === -1) ScriptApp.newTrigger('maintenance').timeBased().everyDays(1).atHour(1).create();
}

function warmup() {
  try {
    Settings.all(); Roles.all(); Catalog.get(); YearDb.all();
    PatientService.index({});
    var y = new Date().getFullYear();
    var act = YearDb.active(y);
    if (act) { Db.readAll(T.ORDERS, act.SpreadsheetId); Db.readAll(T.ORDER_PANELS, act.SpreadsheetId); }   // tra cứu/mở phiếu lọc trong bộ nhớ
  } catch (e) { console.warn('warmup: ' + e.message); }
}

function maintenance() {
  withLock_(function () {
    try { Sequence.syncToSheet(); } catch (e) { console.warn('sequence sync: ' + e.message); }
    // Cắt gọn cột/dòng trống trước khi đo (giữ dung lượng thực, tránh tạo DB nối tiếp sớm)
    Db.coreIds().concat(YearDb.allIds()).forEach(function (id) { try { Db.optimize(id); } catch (e) { console.warn('optimize ' + id + ': ' + e.message); } });
    var list = YearDb.refreshCapacity();
    var auto = String(Settings.get('AUTO_CREATE_YEAR_DB', 'TRUE')).toUpperCase() !== 'FALSE';
    if (!auto) return;
    var now = new Date(), y = now.getFullYear();
    // DB đang ghi vượt ngưỡng → tạo DB nối tiếp
    list.filter(function (r) { return r.Mode === DB_MODE.RW && YearDb.isFull(r); })
      .forEach(function (r) { YearDb.create(r.Year, 'system'); });
    // Từ 15/12: tạo sẵn DB năm sau
    if (now.getMonth() === 11 && now.getDate() >= 15 && !YearDb.forYear(y + 1).length) YearDb.create(y + 1, 'system');
  });
}

function seedIfEmpty_(table, rows) {
  if (Db.readAll(table).length === 0 && rows.length) Db.insert(table, null, rows);
  if (table === T.SETTINGS) Settings.invalidate();
}

/** Đồng bộ bộ đếm sau khi import dữ liệu cũ (BN-xxxxxx & XN-YYMMDD-NNN). */
function migrationFinalize() {
  withLock_(function () {
    var maxBn = 0;
    Db.readColumns(T.PATIENTS, null, ['PatientID']).forEach(function (r) {
      var m = String(r.PatientID).match(/^BN-(\d+)$/);
      if (m) maxBn = Math.max(maxBn, Number(m[1]));
    });
    Sequence.ensureAtLeast('BN', maxBn);
    var perDay = {};
    YearDb.all().forEach(function (y) {
      try {
        Db.readColumns(T.ORDERS, y.SpreadsheetId, ['OrderID']).forEach(function (r) {
          var m = String(r.OrderID).match(/^XN-(\d{6})-(\d+)$/);
          if (m) perDay[m[1]] = Math.max(perDay[m[1]] || 0, Number(m[2]));
        });
      } catch (e) { console.warn('Skip ' + y.Year + ': ' + e.message); }
    });
    Object.keys(perDay).forEach(function (k) { Sequence.ensureAtLeast('XN-' + k, perDay[k]); });
    console.log('BN max = ' + maxBn + '; ngày có phiếu = ' + Object.keys(perDay).length);
  });
  AdminService.clearCache();
}

function healthCheck() {
  var report = [];
  var check = function (label, fn) {
    try { report.push('✔ ' + label + ': ' + fn()); } catch (e) { report.push('✖ ' + label + ': ' + e.message); }
  };
  check('CONFIG DB', function () { return Db.readAll(T.USERS).length + ' users, ' + Db.readAll(T.TESTS).length + ' tests'; });
  check('PATIENT DB', function () { return Db.readColumns(T.PATIENTS, null, ['PatientID']).length + ' bệnh nhân'; });
  YearDb.all().forEach(function (y) {
    check((y.Note || 'DB_' + y.Year) + ' (' + y.Mode + ')', function () { return Db.readColumns(T.ORDERS, y.SpreadsheetId, ['OrderID']).length + ' phiếu'; });
  });
  console.log(report.join('\n'));
  return report;
}

/* ---- 91_SeedCatalog.gs ---- */
/**
 * 91_SeedCatalog.gs – Danh mục chuẩn hóa từ file 'Mrs Hồng.xls' + 13 mẫu Word (sinh bởi tools/catalog.py).
 * Chỉ dùng khi setup() lần đầu (bảng trống). Sau đó quản lý trong màn hình Quản trị.
 */
var SEED_CATALOG = {
"panels": [
{
"PanelCode": "SH",
"PanelName": "Sinh hóa máu",
"PrintTitle": "PHIẾU XÉT NGHIỆM SINH HÓA MÁU",
"PrintSubtitle": "LABORATORY REPORT",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 1,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A4"
},
{
"PanelCode": "GD",
"PanelName": "Gan mật - Dạ dày",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM ELISA",
"PrintSubtitle": "GAN - HỆ TIÊU HÓA",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 2,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "DK",
"PanelName": "Huyết thanh đa kháng KST",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM ELISA",
"PrintSubtitle": "HUYẾT THANH ĐA KHÁNG KÝ SINH TRÙNG",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 3,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "TG",
"PanelName": "Chức năng tuyến giáp",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "CHỨC NĂNG TUYẾN GIÁP",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 4,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "NT",
"PanelName": "Nước tiểu toàn phần",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "NƯỚC TIỂU TOÀN PHẦN",
"PricingMode": "PANEL",
"Price": 0,
"SortOrder": 5,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "DR",
"PanelName": "KST đường ruột",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "K.S.T ĐƯỜNG RUỘT",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 6,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "VS",
"PanelName": "Vi sinh - ELISA",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM ELISA",
"PrintSubtitle": "",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 7,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "TD",
"PanelName": "Tinh dịch đồ",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "TINH DỊCH ĐỒ",
"PricingMode": "PANEL",
"Price": 0,
"SortOrder": 8,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A4"
},
{
"PanelCode": "ND",
"PanelName": "Vi sinh niệu đạo - âm đạo",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM VI SINH",
"PrintSubtitle": "NIỆU ĐẠO - ÂM ĐẠO",
"PricingMode": "TEST",
"Price": 0,
"SortOrder": 9,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "ID",
"PanelName": "Ion đồ",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "ION ĐỒ",
"PricingMode": "PANEL",
"Price": 0,
"SortOrder": 10,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "DA",
"PanelName": "Đàm & dịch họng",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "ĐÀM & DỊCH HỌNG",
"PricingMode": "PANEL",
"Price": 0,
"SortOrder": 11,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
},
{
"PanelCode": "GN",
"PanelName": "Chất gây nghiện",
"PrintTitle": "PHIẾU KẾT QUẢ XÉT NGHIỆM",
"PrintSubtitle": "CHẤT GÂY NGHIỆN TRONG NƯỚC TIỂU",
"PricingMode": "PANEL",
"Price": 140000,
"SortOrder": 12,
"IsActive": true,
"TemplateDocId": "",
"PageSize": "A5"
}
],
"tests": [
{
"TestCode": "HBSAG",
"TestName": "HBsAg",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 1,
"IsActive": true,
"LegacyName": "HbsAg"
},
{
"TestCode": "HBEAG",
"TestName": "HBeAg",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 2,
"IsActive": true,
"LegacyName": "HbeAg"
},
{
"TestCode": "HBSAB",
"TestName": "HBsAb",
"Unit": "UI/ml",
"ResultType": "NUM",
"RefMinM": 10,
"RefMaxM": "",
"RefMinF": 10,
"RefMaxF": "",
"RefText": "> 10 UI/ml",
"Price": 0,
"SortOrder": 3,
"IsActive": true,
"LegacyName": "HBsAb"
},
{
"TestCode": "HCV_AB",
"TestName": "Anti HCV",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 4,
"IsActive": true,
"LegacyName": "Anti HCV"
},
{
"TestCode": "HAV_IGM",
"TestName": "HAV IgM",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 5,
"IsActive": true,
"LegacyName": "HAV  IgM"
},
{
"TestCode": "AFP",
"TestName": "AFP",
"Unit": "ng/ml",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 8.5,
"RefMinF": "",
"RefMaxF": 8.5,
"RefText": "< 8.5 ng/ml",
"Price": 0,
"SortOrder": 6,
"IsActive": true,
"LegacyName": "AFP"
},
{
"TestCode": "HP_AB",
"TestName": "H. Pylori",
"Unit": "U/ml",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 8,
"RefMinF": "",
"RefMaxF": 8,
"RefText": "< 8 U/ml",
"Price": 0,
"SortOrder": 7,
"IsActive": true,
"LegacyName": "H. Pylori   ( < 8 U / ml )"
},
{
"TestCode": "CEA",
"TestName": "CEA",
"Unit": "ng/ml",
"ResultType": "NUM",
"RefMinM": 0,
"RefMaxM": 5,
"RefMinF": 0,
"RefMaxF": 5,
"RefText": "0 - 5 ng/ml",
"Price": 0,
"SortOrder": 8,
"IsActive": true,
"LegacyName": "CEA"
},
{
"TestCode": "PSA",
"TestName": "PSA",
"Unit": "ng/ml",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 4,
"RefMinF": "",
"RefMaxF": 4,
"RefText": "< 4.0 ng/ml",
"Price": 0,
"SortOrder": 9,
"IsActive": true,
"LegacyName": "PSA"
},
{
"TestCode": "GROS",
"TestName": "Gros",
"Unit": "ml Hayem",
"ResultType": "NUM",
"RefMinM": 1.75,
"RefMaxM": "",
"RefMinF": 1.75,
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 10,
"IsActive": true,
"LegacyName": "Gros"
},
{
"TestCode": "LUGOL",
"TestName": "Lugol",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 11,
"IsActive": true,
"LegacyName": "Lugol"
},
{
"TestCode": "MACLAGAN",
"TestName": "Maclagan",
"Unit": "ML",
"ResultType": "NUM",
"RefMinM": 0,
"RefMaxM": 5,
"RefMinF": 0,
"RefMaxF": 5,
"RefText": "",
"Price": 0,
"SortOrder": 12,
"IsActive": true,
"LegacyName": "Maclagan"
},
{
"TestCode": "HIV",
"TestName": "HIV",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 13,
"IsActive": true,
"LegacyName": "HIV"
},
{
"TestCode": "SYPHILIS",
"TestName": "Syphilis 3.0",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 14,
"IsActive": true,
"LegacyName": "SYPHILIS 3.0"
},
{
"TestCode": "TB_AB",
"TestName": "Tuberculine (IgG, IgM)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 15,
"IsActive": true,
"LegacyName": "Tuberculine  ( IgG , Ig M )"
},
{
"TestCode": "ABO_RH",
"TestName": "Nhóm máu (ABO/Rh)",
"Unit": "",
"ResultType": "BLOOD",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "A, B, AB, O",
"Price": 0,
"SortOrder": 16,
"IsActive": true,
"LegacyName": "Nhóm Máu"
},
{
"TestCode": "RUBELLA",
"TestName": "Rubella (IgM/IgG)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 17,
"IsActive": true,
"LegacyName": "Rhubella (IgM/IgG)"
},
{
"TestCode": "DENGUE_AB",
"TestName": "Dengue (IgM/IgG)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 18,
"IsActive": true,
"LegacyName": "Dengue (IgM/IgG)"
},
{
"TestCode": "DENGUE_NS1",
"TestName": "Dengue (NS1Ag)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 19,
"IsActive": true,
"LegacyName": "Dengue (NS1Ag)"
},
{
"TestCode": "HPV_IGG",
"TestName": "HPV IgG",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 20,
"IsActive": true,
"LegacyName": "HPV IgG"
},
{
"TestCode": "CHLAMYDIA",
"TestName": "Chlamydia",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 21,
"IsActive": true,
"LegacyName": "Chlamidan"
},
{
"TestCode": "URETH_FL",
"TestName": "Dịch niệu đạo",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 22,
"IsActive": true,
"LegacyName": "Dịch niệu đạo"
},
{
"TestCode": "URETH_WET",
"TestName": "Dịch niệu đạo - Soi tươi",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 23,
"IsActive": true,
"LegacyName": "Soi tươi ND"
},
{
"TestCode": "URETH_GRAM",
"TestName": "Dịch niệu đạo - Nhuộm Gram",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 24,
"IsActive": true,
"LegacyName": "Nhuộm Gram ND"
},
{
"TestCode": "VAG_FL",
"TestName": "Dịch âm đạo",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 25,
"IsActive": true,
"LegacyName": "Dịch âm đạo"
},
{
"TestCode": "VAG_WET",
"TestName": "Dịch âm đạo - Soi tươi",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 26,
"IsActive": true,
"LegacyName": "Soi tươi AD"
},
{
"TestCode": "VAG_GRAM",
"TestName": "Dịch âm đạo - Nhuộm Gram",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 27,
"IsActive": true,
"LegacyName": "Nhuộm Gram AD"
},
{
"TestCode": "GLU",
"TestName": "Glucose",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 3.05,
"RefMaxM": 6.4,
"RefMinF": 3.05,
"RefMaxF": 6.4,
"RefText": "3.05 - 6.4 mmol/l",
"Price": 0,
"SortOrder": 28,
"IsActive": true,
"LegacyName": "Glucose"
},
{
"TestCode": "HBA1C",
"TestName": "HbA1c",
"Unit": "%",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 6.0,
"RefMinF": "",
"RefMaxF": 6.0,
"RefText": "≤ 6.0 %",
"Price": 0,
"SortOrder": 29,
"IsActive": true,
"LegacyName": "HbA1c"
},
{
"TestCode": "UREA",
"TestName": "Ure",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 1.7,
"RefMaxM": 8.3,
"RefMinF": 1.7,
"RefMaxF": 8.3,
"RefText": "1.7 - 8.3 mmol/l",
"Price": 0,
"SortOrder": 30,
"IsActive": true,
"LegacyName": "Ure"
},
{
"TestCode": "CREA",
"TestName": "Creatinin",
"Unit": "µmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 124,
"RefMinF": "",
"RefMaxF": 97,
"RefText": "Nam ≤ 124; Nữ ≤ 97 µmol/l",
"Price": 0,
"SortOrder": 31,
"IsActive": true,
"LegacyName": "Creatinin"
},
{
"TestCode": "EGFR",
"TestName": "eGFR (CKD-EPI 2021)",
"Unit": "ml/phút/1.73m²",
"ResultType": "NUM",
"RefMinM": 60,
"RefMaxM": "",
"RefMinF": 60,
"RefMaxF": "",
"RefText": "> 60 ml/phút/1.73m²",
"Price": 0,
"SortOrder": 32,
"IsActive": true,
"LegacyName": "eGFR (CKD-EPI 2021) Nam|eGFR (CKD-EPI 2021) Nữ"
},
{
"TestCode": "TG",
"TestName": "Triglycerid",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 2.3,
"RefMinF": "",
"RefMaxF": 2.3,
"RefText": "≤ 2.3 mmol/l",
"Price": 0,
"SortOrder": 33,
"IsActive": true,
"LegacyName": "Triglycerit"
},
{
"TestCode": "CHOL",
"TestName": "Cholesterol",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 5.2,
"RefMinF": "",
"RefMaxF": 5.2,
"RefText": "≤ 5.2 mmol/l",
"Price": 0,
"SortOrder": 34,
"IsActive": true,
"LegacyName": "Cholesterol"
},
{
"TestCode": "HDL",
"TestName": "HDL-C",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 0.9,
"RefMaxM": 1.68,
"RefMinF": 0.9,
"RefMaxF": 1.68,
"RefText": "0.9 - 1.68 mmol/l",
"Price": 0,
"SortOrder": 35,
"IsActive": true,
"LegacyName": "HDL_C"
},
{
"TestCode": "LDL",
"TestName": "LDL-C",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 4.9,
"RefMinF": "",
"RefMaxF": 4.9,
"RefText": "≤ 4.9 mmol/l",
"Price": 0,
"SortOrder": 36,
"IsActive": true,
"LegacyName": "LDL_C"
},
{
"TestCode": "TBIL",
"TestName": "Bilirubin toàn phần",
"Unit": "µmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 17,
"RefMinF": "",
"RefMaxF": 17,
"RefText": "≤ 17 µmol/l",
"Price": 0,
"SortOrder": 37,
"IsActive": true,
"LegacyName": "Bilirubine TP"
},
{
"TestCode": "DBIL",
"TestName": "Bilirubin trực tiếp",
"Unit": "µmol/l",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 4.3,
"RefMinF": "",
"RefMaxF": 4.3,
"RefText": "≤ 4.3 µmol/l",
"Price": 0,
"SortOrder": 38,
"IsActive": true,
"LegacyName": "Bilirubine TT"
},
{
"TestCode": "CA",
"TestName": "Calci",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 2.02,
"RefMaxM": 2.6,
"RefMinF": 2.02,
"RefMaxF": 2.6,
"RefText": "2.02 - 2.60 mmol/l",
"Price": 0,
"SortOrder": 39,
"IsActive": true,
"LegacyName": "Calci máu"
},
{
"TestCode": "PROT",
"TestName": "Protid",
"Unit": "g/dl",
"ResultType": "NUM",
"RefMinM": 5,
"RefMaxM": 8,
"RefMinF": 5,
"RefMaxF": 8,
"RefText": "5 - 8 g/dl",
"Price": 0,
"SortOrder": 40,
"IsActive": true,
"LegacyName": "Protid"
},
{
"TestCode": "UA",
"TestName": "Acid Uric",
"Unit": "µmol/l",
"ResultType": "NUM",
"RefMinM": 200,
"RefMaxM": 420,
"RefMinF": 140,
"RefMaxF": 340,
"RefText": "Nam 200-420; Nữ 140-340 µmol/l",
"Price": 0,
"SortOrder": 41,
"IsActive": true,
"LegacyName": "Acid Uric"
},
{
"TestCode": "ALT",
"TestName": "ALT (GPT)",
"Unit": "U/L",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 42,
"RefMinF": "",
"RefMaxF": 32,
"RefText": "Nam ≤ 42; Nữ ≤ 32 U/L/37°C",
"Price": 0,
"SortOrder": 42,
"IsActive": true,
"LegacyName": "ALT (SGPT)"
},
{
"TestCode": "AST",
"TestName": "AST (GOT)",
"Unit": "U/L",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 42,
"RefMinF": "",
"RefMaxF": 32,
"RefText": "Nam ≤ 42; Nữ ≤ 32 U/L/37°C",
"Price": 0,
"SortOrder": 43,
"IsActive": true,
"LegacyName": "AST (SGOT)"
},
{
"TestCode": "GGT",
"TestName": "GGT (γ-Glutamyl transferase)",
"Unit": "U/L",
"ResultType": "NUM",
"RefMinM": 11,
"RefMaxM": 50,
"RefMinF": 7,
"RefMaxF": 32,
"RefText": "Nam 11-50; Nữ 7-32 U/L/37°C",
"Price": 0,
"SortOrder": 44,
"IsActive": true,
"LegacyName": "GGT (ᵞ Glutamin Transferase)"
},
{
"TestCode": "FE",
"TestName": "Sắt huyết thanh (Fe)",
"Unit": "µmol/l",
"ResultType": "NUM",
"RefMinM": 10.6,
"RefMaxM": 28.3,
"RefMinF": 6.6,
"RefMaxF": 26,
"RefText": "Nam 10.6-28.3; Nữ 6.6-26 µmol/l",
"Price": 0,
"SortOrder": 45,
"IsActive": true,
"LegacyName": "Fe ( IRON )"
},
{
"TestCode": "AMY",
"TestName": "Amylase",
"Unit": "U/L",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 220,
"RefMinF": "",
"RefMaxF": 220,
"RefText": "< 220 U/L/37°C",
"Price": 0,
"SortOrder": 46,
"IsActive": true,
"LegacyName": "Amylase"
},
{
"TestCode": "NA",
"TestName": "Na⁺",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 135,
"RefMaxM": 145,
"RefMinF": 135,
"RefMaxF": 145,
"RefText": "135 - 145 mmol/l",
"Price": 0,
"SortOrder": 47,
"IsActive": true,
"LegacyName": "Na"
},
{
"TestCode": "K",
"TestName": "K⁺",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 3.5,
"RefMaxM": 5.1,
"RefMinF": 3.5,
"RefMaxF": 5.1,
"RefText": "3.5 - 5.1 mmol/l",
"Price": 0,
"SortOrder": 48,
"IsActive": true,
"LegacyName": "K"
},
{
"TestCode": "CL",
"TestName": "Cl⁻",
"Unit": "mmol/l",
"ResultType": "NUM",
"RefMinM": 98,
"RefMaxM": 106,
"RefMinF": 98,
"RefMaxF": 106,
"RefText": "98 - 106 mmol/l",
"Price": 0,
"SortOrder": 49,
"IsActive": true,
"LegacyName": "Cl"
},
{
"TestCode": "FT3",
"TestName": "FT3",
"Unit": "pg/ml",
"ResultType": "NUM",
"RefMinM": 1.4,
"RefMaxM": 4.2,
"RefMinF": 1.4,
"RefMaxF": 4.2,
"RefText": "1.4 - 4.2 pg/ml",
"Price": 0,
"SortOrder": 50,
"IsActive": true,
"LegacyName": "FT3"
},
{
"TestCode": "FT4",
"TestName": "FT4",
"Unit": "ng/dl",
"ResultType": "NUM",
"RefMinM": 0.8,
"RefMaxM": 2.0,
"RefMinF": 0.8,
"RefMaxF": 2.0,
"RefText": "0.8 - 2.0 ng/dl",
"Price": 0,
"SortOrder": 51,
"IsActive": true,
"LegacyName": "FT4"
},
{
"TestCode": "TSH",
"TestName": "TSH",
"Unit": "µIU/ml",
"ResultType": "NUM",
"RefMinM": 0.3,
"RefMaxM": 4.0,
"RefMinF": 0.3,
"RefMaxF": 4.0,
"RefText": "0.3 - 4.0 µIU/ml",
"Price": 0,
"SortOrder": 52,
"IsActive": true,
"LegacyName": "TSH"
},
{
"TestCode": "FASC_IGG",
"TestName": "Fasciola IgG (Sán lá gan)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.1 - 0.50 OD",
"Price": 0,
"SortOrder": 53,
"IsActive": true,
"LegacyName": "Fasciola IgG"
},
{
"TestCode": "TAEN_AB",
"TestName": "Taenia Solium Ab (Sán dải heo)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.2 - 0.50 OD",
"Price": 0,
"SortOrder": 54,
"IsActive": true,
"LegacyName": "Taenia Solium  Antibody"
},
{
"TestCode": "TOXO_AB",
"TestName": "Toxocara canis (Giun đũa chó)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.3 - 0.50 OD",
"Price": 0,
"SortOrder": 55,
"IsActive": true,
"LegacyName": "Toxocaranis Ascaris"
},
{
"TestCode": "TRICH_AB",
"TestName": "Trichinella Ab (Giun xoắn)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.3 - 0.50 OD",
"Price": 0,
"SortOrder": 56,
"IsActive": true,
"LegacyName": "Trichinella Antibody"
},
{
"TestCode": "ASC_AB",
"TestName": "Ascaris Ab (Giun đũa)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.3 - 0.50 OD",
"Price": 0,
"SortOrder": 57,
"IsActive": true,
"LegacyName": "As caris Antibody (giun đũa)"
},
{
"TestCode": "STRONG_AB",
"TestName": "Strongyloides (Giun lươn)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.2 - 0.50 OD",
"Price": 0,
"SortOrder": 58,
"IsActive": true,
"LegacyName": "Strongyloides"
},
{
"TestCode": "AMOEBA_AB",
"TestName": "Entamoeba histolytica Ab (Amip)",
"Unit": "OD",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 0.5,
"RefMinF": "",
"RefMaxF": 0.5,
"RefText": "Negative: 0.3 - 0.50 OD",
"Price": 0,
"SortOrder": 59,
"IsActive": true,
"LegacyName": "Entamoeba Histolica Antibody"
},
{
"TestCode": "SA_CHILDREN",
"TestName": "Số con hiện có",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 60,
"IsActive": true,
"LegacyName": "Số con hiện có"
},
{
"TestCode": "SA_ABSTAIN",
"TestName": "Số ngày kiêng giao hợp",
"Unit": "ngày",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 61,
"IsActive": true,
"LegacyName": "Số ngày kiêng giao hợp (ngày)"
},
{
"TestCode": "SA_EJTIME",
"TestName": "Thời gian xuất tinh",
"Unit": "phút",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 62,
"IsActive": true,
"LegacyName": "Thời gian xuất tinh (phút)"
},
{
"TestCode": "SA_APPEAR",
"TestName": "Tính chất tinh dịch",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 63,
"IsActive": true,
"LegacyName": "Tính chất tinh dịch"
},
{
"TestCode": "SA_WET",
"TestName": "Soi tươi",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 64,
"IsActive": true,
"LegacyName": "Soi tươi"
},
{
"TestCode": "SA_PR_FAST",
"TestName": "Tỷ lệ di động tiến tới nhanh",
"Unit": "%",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 65,
"IsActive": true,
"LegacyName": "Tỷ lệ tiến tới nhanh"
},
{
"TestCode": "SA_PR_SLOW",
"TestName": "Tỷ lệ di động tiến tới chậm",
"Unit": "%",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 66,
"IsActive": true,
"LegacyName": "Tỷ lệ tiến tới chậm"
},
{
"TestCode": "SA_NP",
"TestName": "Tỷ lệ lắc lư tại chỗ",
"Unit": "%",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 67,
"IsActive": true,
"LegacyName": "Tỷ lệ lắc lư tại chỗ"
},
{
"TestCode": "SA_VOL",
"TestName": "Thể tích tinh dịch",
"Unit": "ml",
"ResultType": "NUM",
"RefMinM": 2,
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "≥ 2 ml",
"Price": 0,
"SortOrder": 68,
"IsActive": true,
"LegacyName": "Thể tích tinh dịch (ml)"
},
{
"TestCode": "SA_COUNT",
"TestName": "Số lượng tinh trùng",
"Unit": "con/cm³",
"ResultType": "NUM",
"RefMinM": 60000000,
"RefMaxM": 100000000,
"RefMinF": "",
"RefMaxF": "",
"RefText": "60 - 100 triệu/cm³",
"Price": 0,
"SortOrder": 69,
"IsActive": true,
"LegacyName": "Số lượng tinh trùng (con/cm3)"
},
{
"TestCode": "SA_STAIN",
"TestName": "Nhuộm soi",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 70,
"IsActive": true,
"LegacyName": "Nhuộm soi"
},
{
"TestCode": "SA_HEAD",
"TestName": "Hình dạng - Đầu",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 71,
"IsActive": true,
"LegacyName": "Đầu"
},
{
"TestCode": "SA_TAIL",
"TestName": "Hình dạng - Đuôi",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 72,
"IsActive": true,
"LegacyName": "Đuôi"
},
{
"TestCode": "SA_CONCL",
"TestName": "Kết luận",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 73,
"IsActive": true,
"LegacyName": "Kết luận"
},
{
"TestCode": "DRUG_MET",
"TestName": "MET (Ma túy đá)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 74,
"IsActive": true,
"LegacyName": "MET (Ma túy đá)"
},
{
"TestCode": "DRUG_THC",
"TestName": "THC (Cần sa)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 75,
"IsActive": true,
"LegacyName": "THC (Cần sa) "
},
{
"TestCode": "DRUG_MDMA",
"TestName": "MDMA (Thuốc lắc)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 76,
"IsActive": true,
"LegacyName": "MDMA (Thuốc lắc)"
},
{
"TestCode": "DRUG_MOP",
"TestName": "MOP (Morphin)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 77,
"IsActive": true,
"LegacyName": "MOP (Morphin)"
},
{
"TestCode": "DRUG_KET",
"TestName": "KET (Ketamin)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 78,
"IsActive": true,
"LegacyName": "KET (Ma túy đá tổng hợp)"
},
{
"TestCode": "ST_WBC",
"TestName": "Bạch cầu (PP trực tiếp)",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 79,
"IsActive": true,
"LegacyName": "Bạch cầu"
},
{
"TestCode": "ST_RBC",
"TestName": "Hồng cầu (PP trực tiếp)",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 80,
"IsActive": true,
"LegacyName": "Hồng cầu"
},
{
"TestCode": "ST_AMOEBA_CYST",
"TestName": "Kén Amibe",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 81,
"IsActive": true,
"LegacyName": "Kén Amibe"
},
{
"TestCode": "ST_AMOEBA_ACT",
"TestName": "Amibe hoạt động",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 82,
"IsActive": true,
"LegacyName": "Amibe hoạt động"
},
{
"TestCode": "ST_BALANT",
"TestName": "Balantidium coli",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 83,
"IsActive": true,
"LegacyName": "Balantidium Coli"
},
{
"TestCode": "ST_TRICHO",
"TestName": "Trichomonas intestinalis",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 84,
"IsActive": true,
"LegacyName": "Trichomonas Intestinalis"
},
{
"TestCode": "ST_OVA",
"TestName": "KSTĐR (PP trực tiếp)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 85,
"IsActive": true,
"LegacyName": "KSTĐR"
},
{
"TestCode": "ST_HOOKWORM",
"TestName": "Trứng giun móc",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 86,
"IsActive": true,
"LegacyName": "Trứng giun móc"
},
{
"TestCode": "ST_ASCARIS",
"TestName": "Trứng giun đũa",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 87,
"IsActive": true,
"LegacyName": "Trứng giun đũa"
},
{
"TestCode": "ST_TRICHURIS",
"TestName": "Trứng giun tóc",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 88,
"IsActive": true,
"LegacyName": "Trứng giun tóc"
},
{
"TestCode": "ST_ROTA",
"TestName": "Rota virus (nhóm A)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 89,
"IsActive": true,
"LegacyName": "RotA Virus (nhóm A)"
},
{
"TestCode": "ST_NORO",
"TestName": "Norovirus",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 90,
"IsActive": true,
"LegacyName": ""
},
{
"TestCode": "ST_HP_AG",
"TestName": "H. Pylori Ag (phân)",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 91,
"IsActive": true,
"LegacyName": ""
},
{
"TestCode": "SP_AFB",
"TestName": "BK đàm (Ziehl-Neelsen)",
"Unit": "/3 dòng",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "0/3 dòng",
"Price": 0,
"SortOrder": 92,
"IsActive": true,
"LegacyName": "BK trong đàm"
},
{
"TestCode": "SP_AFB_NOTE",
"TestName": "Nhận xét BK đàm",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 93,
"IsActive": true,
"LegacyName": "Nhận xét BK đàm"
},
{
"TestCode": "SP_APPEAR",
"TestName": "Trạng thái đàm",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 94,
"IsActive": true,
"LegacyName": "Trạng thái đàm"
},
{
"TestCode": "SP_GRAM",
"TestName": "Nhuộm Gram (đàm)",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "",
"Price": 0,
"SortOrder": 95,
"IsActive": true,
"LegacyName": ""
},
{
"TestCode": "U_GLU",
"TestName": "Glucose (niệu)",
"Unit": "mmol/L",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 96,
"IsActive": true,
"LegacyName": "GLU"
},
{
"TestCode": "U_BIL",
"TestName": "Bilirubin (niệu)",
"Unit": "µmol/L",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 97,
"IsActive": true,
"LegacyName": "BIL"
},
{
"TestCode": "U_KET",
"TestName": "Ketone",
"Unit": "mmol/L",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 98,
"IsActive": true,
"LegacyName": "KET"
},
{
"TestCode": "U_SG",
"TestName": "Tỷ trọng (SG)",
"Unit": "",
"ResultType": "NUM",
"RefMinM": 1.005,
"RefMaxM": 1.03,
"RefMinF": 1.005,
"RefMaxF": 1.03,
"RefText": "1.005 - 1.030",
"Price": 0,
"SortOrder": 99,
"IsActive": true,
"LegacyName": "SG"
},
{
"TestCode": "U_BLD",
"TestName": "Hồng cầu (Blood)",
"Unit": "Ery/µl",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative (5-10 Ery/µl)",
"Price": 0,
"SortOrder": 100,
"IsActive": true,
"LegacyName": "BLD"
},
{
"TestCode": "U_PH",
"TestName": "pH",
"Unit": "",
"ResultType": "NUM",
"RefMinM": 5,
"RefMaxM": 8,
"RefMinF": 5,
"RefMaxF": 8,
"RefText": "5 - 8",
"Price": 0,
"SortOrder": 101,
"IsActive": true,
"LegacyName": "pH"
},
{
"TestCode": "U_PRO",
"TestName": "Protein (niệu)",
"Unit": "g/L",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 102,
"IsActive": true,
"LegacyName": "PRO"
},
{
"TestCode": "U_URO",
"TestName": "Urobilinogen",
"Unit": "µmol/L",
"ResultType": "NUM",
"RefMinM": "",
"RefMaxM": 3.4,
"RefMinF": "",
"RefMaxF": 3.4,
"RefText": "≤ 3.4 µmol/L",
"Price": 0,
"SortOrder": 103,
"IsActive": true,
"LegacyName": "URO"
},
{
"TestCode": "U_NIT",
"TestName": "Nitrit",
"Unit": "",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative",
"Price": 0,
"SortOrder": 104,
"IsActive": true,
"LegacyName": "NIT"
},
{
"TestCode": "U_LEU",
"TestName": "Bạch cầu (Leukocyte)",
"Unit": "Leu/µl",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative (0-25 Leu/µl)",
"Price": 0,
"SortOrder": 105,
"IsActive": true,
"LegacyName": "LEU"
},
{
"TestCode": "U_ASC",
"TestName": "Ascorbic acid",
"Unit": "mmol/L",
"ResultType": "QUAL",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Negative (0.28-0.56)",
"Price": 0,
"SortOrder": 106,
"IsActive": true,
"LegacyName": "ASCORBIC ACID"
},
{
"TestCode": "U_MICRO",
"TestName": "Soi cặn (Microscopic)",
"Unit": "",
"ResultType": "TEXT",
"RefMinM": "",
"RefMaxM": "",
"RefMinF": "",
"RefMaxF": "",
"RefText": "Normal",
"Price": 0,
"SortOrder": 107,
"IsActive": true,
"LegacyName": "MICROSCOPIC"
}
],
"panelTests": [
{
"PanelCode": "SH",
"TestCode": "GLU",
"SortOrder": 1
},
{
"PanelCode": "SH",
"TestCode": "HBA1C",
"SortOrder": 2
},
{
"PanelCode": "SH",
"TestCode": "UREA",
"SortOrder": 3
},
{
"PanelCode": "SH",
"TestCode": "CREA",
"SortOrder": 4
},
{
"PanelCode": "SH",
"TestCode": "EGFR",
"SortOrder": 5
},
{
"PanelCode": "SH",
"TestCode": "TG",
"SortOrder": 6
},
{
"PanelCode": "SH",
"TestCode": "CHOL",
"SortOrder": 7
},
{
"PanelCode": "SH",
"TestCode": "HDL",
"SortOrder": 8
},
{
"PanelCode": "SH",
"TestCode": "LDL",
"SortOrder": 9
},
{
"PanelCode": "SH",
"TestCode": "TBIL",
"SortOrder": 10
},
{
"PanelCode": "SH",
"TestCode": "DBIL",
"SortOrder": 11
},
{
"PanelCode": "SH",
"TestCode": "CA",
"SortOrder": 12
},
{
"PanelCode": "SH",
"TestCode": "PROT",
"SortOrder": 13
},
{
"PanelCode": "SH",
"TestCode": "UA",
"SortOrder": 14
},
{
"PanelCode": "SH",
"TestCode": "ALT",
"SortOrder": 15
},
{
"PanelCode": "SH",
"TestCode": "AST",
"SortOrder": 16
},
{
"PanelCode": "SH",
"TestCode": "GGT",
"SortOrder": 17
},
{
"PanelCode": "SH",
"TestCode": "FE",
"SortOrder": 18
},
{
"PanelCode": "SH",
"TestCode": "AMY",
"SortOrder": 19
},
{
"PanelCode": "SH",
"TestCode": "ABO_RH",
"SortOrder": 20
},
{
"PanelCode": "GD",
"TestCode": "HBSAG",
"SortOrder": 1
},
{
"PanelCode": "GD",
"TestCode": "HBEAG",
"SortOrder": 2
},
{
"PanelCode": "GD",
"TestCode": "HBSAB",
"SortOrder": 3
},
{
"PanelCode": "GD",
"TestCode": "HCV_AB",
"SortOrder": 4
},
{
"PanelCode": "GD",
"TestCode": "HAV_IGM",
"SortOrder": 5
},
{
"PanelCode": "GD",
"TestCode": "AFP",
"SortOrder": 6
},
{
"PanelCode": "GD",
"TestCode": "HP_AB",
"SortOrder": 7
},
{
"PanelCode": "GD",
"TestCode": "CEA",
"SortOrder": 8
},
{
"PanelCode": "GD",
"TestCode": "PSA",
"SortOrder": 9
},
{
"PanelCode": "GD",
"TestCode": "AMY",
"SortOrder": 10
},
{
"PanelCode": "GD",
"TestCode": "PROT",
"SortOrder": 11
},
{
"PanelCode": "GD",
"TestCode": "FASC_IGG",
"SortOrder": 12
},
{
"PanelCode": "GD",
"TestCode": "ALT",
"SortOrder": 13
},
{
"PanelCode": "GD",
"TestCode": "AST",
"SortOrder": 14
},
{
"PanelCode": "GD",
"TestCode": "GGT",
"SortOrder": 15
},
{
"PanelCode": "GD",
"TestCode": "TBIL",
"SortOrder": 16
},
{
"PanelCode": "GD",
"TestCode": "DBIL",
"SortOrder": 17
},
{
"PanelCode": "GD",
"TestCode": "ABO_RH",
"SortOrder": 18
},
{
"PanelCode": "DK",
"TestCode": "FASC_IGG",
"SortOrder": 1
},
{
"PanelCode": "DK",
"TestCode": "TAEN_AB",
"SortOrder": 2
},
{
"PanelCode": "DK",
"TestCode": "TOXO_AB",
"SortOrder": 3
},
{
"PanelCode": "DK",
"TestCode": "TRICH_AB",
"SortOrder": 4
},
{
"PanelCode": "DK",
"TestCode": "ASC_AB",
"SortOrder": 5
},
{
"PanelCode": "DK",
"TestCode": "STRONG_AB",
"SortOrder": 6
},
{
"PanelCode": "DK",
"TestCode": "AMOEBA_AB",
"SortOrder": 7
},
{
"PanelCode": "TG",
"TestCode": "FT3",
"SortOrder": 1
},
{
"PanelCode": "TG",
"TestCode": "FT4",
"SortOrder": 2
},
{
"PanelCode": "TG",
"TestCode": "TSH",
"SortOrder": 3
},
{
"PanelCode": "NT",
"TestCode": "U_GLU",
"SortOrder": 1
},
{
"PanelCode": "NT",
"TestCode": "U_BIL",
"SortOrder": 2
},
{
"PanelCode": "NT",
"TestCode": "U_KET",
"SortOrder": 3
},
{
"PanelCode": "NT",
"TestCode": "U_SG",
"SortOrder": 4
},
{
"PanelCode": "NT",
"TestCode": "U_BLD",
"SortOrder": 5
},
{
"PanelCode": "NT",
"TestCode": "U_PH",
"SortOrder": 6
},
{
"PanelCode": "NT",
"TestCode": "U_PRO",
"SortOrder": 7
},
{
"PanelCode": "NT",
"TestCode": "U_URO",
"SortOrder": 8
},
{
"PanelCode": "NT",
"TestCode": "U_NIT",
"SortOrder": 9
},
{
"PanelCode": "NT",
"TestCode": "U_LEU",
"SortOrder": 10
},
{
"PanelCode": "NT",
"TestCode": "U_ASC",
"SortOrder": 11
},
{
"PanelCode": "NT",
"TestCode": "U_MICRO",
"SortOrder": 12
},
{
"PanelCode": "DR",
"TestCode": "ST_WBC",
"SortOrder": 1
},
{
"PanelCode": "DR",
"TestCode": "ST_RBC",
"SortOrder": 2
},
{
"PanelCode": "DR",
"TestCode": "ST_AMOEBA_CYST",
"SortOrder": 3
},
{
"PanelCode": "DR",
"TestCode": "ST_AMOEBA_ACT",
"SortOrder": 4
},
{
"PanelCode": "DR",
"TestCode": "ST_BALANT",
"SortOrder": 5
},
{
"PanelCode": "DR",
"TestCode": "ST_TRICHO",
"SortOrder": 6
},
{
"PanelCode": "DR",
"TestCode": "ST_OVA",
"SortOrder": 7
},
{
"PanelCode": "DR",
"TestCode": "ST_HOOKWORM",
"SortOrder": 8
},
{
"PanelCode": "DR",
"TestCode": "ST_ASCARIS",
"SortOrder": 9
},
{
"PanelCode": "DR",
"TestCode": "ST_TRICHURIS",
"SortOrder": 10
},
{
"PanelCode": "DR",
"TestCode": "ST_ROTA",
"SortOrder": 11
},
{
"PanelCode": "DR",
"TestCode": "ST_NORO",
"SortOrder": 12
},
{
"PanelCode": "DR",
"TestCode": "ST_HP_AG",
"SortOrder": 13
},
{
"PanelCode": "VS",
"TestCode": "HBSAG",
"SortOrder": 1
},
{
"PanelCode": "VS",
"TestCode": "HBEAG",
"SortOrder": 2
},
{
"PanelCode": "VS",
"TestCode": "HBSAB",
"SortOrder": 3
},
{
"PanelCode": "VS",
"TestCode": "HCV_AB",
"SortOrder": 4
},
{
"PanelCode": "VS",
"TestCode": "HAV_IGM",
"SortOrder": 5
},
{
"PanelCode": "VS",
"TestCode": "AFP",
"SortOrder": 6
},
{
"PanelCode": "VS",
"TestCode": "HP_AB",
"SortOrder": 7
},
{
"PanelCode": "VS",
"TestCode": "CEA",
"SortOrder": 8
},
{
"PanelCode": "VS",
"TestCode": "PSA",
"SortOrder": 9
},
{
"PanelCode": "VS",
"TestCode": "HIV",
"SortOrder": 10
},
{
"PanelCode": "VS",
"TestCode": "SYPHILIS",
"SortOrder": 11
},
{
"PanelCode": "VS",
"TestCode": "TB_AB",
"SortOrder": 12
},
{
"PanelCode": "VS",
"TestCode": "ABO_RH",
"SortOrder": 13
},
{
"PanelCode": "VS",
"TestCode": "RUBELLA",
"SortOrder": 14
},
{
"PanelCode": "VS",
"TestCode": "DENGUE_AB",
"SortOrder": 15
},
{
"PanelCode": "VS",
"TestCode": "DENGUE_NS1",
"SortOrder": 16
},
{
"PanelCode": "VS",
"TestCode": "HPV_IGG",
"SortOrder": 17
},
{
"PanelCode": "TD",
"TestCode": "SA_CHILDREN",
"SortOrder": 1
},
{
"PanelCode": "TD",
"TestCode": "SA_ABSTAIN",
"SortOrder": 2
},
{
"PanelCode": "TD",
"TestCode": "SA_EJTIME",
"SortOrder": 3
},
{
"PanelCode": "TD",
"TestCode": "SA_APPEAR",
"SortOrder": 4
},
{
"PanelCode": "TD",
"TestCode": "SA_WET",
"SortOrder": 5
},
{
"PanelCode": "TD",
"TestCode": "SA_PR_FAST",
"SortOrder": 6
},
{
"PanelCode": "TD",
"TestCode": "SA_PR_SLOW",
"SortOrder": 7
},
{
"PanelCode": "TD",
"TestCode": "SA_NP",
"SortOrder": 8
},
{
"PanelCode": "TD",
"TestCode": "SA_VOL",
"SortOrder": 9
},
{
"PanelCode": "TD",
"TestCode": "SA_COUNT",
"SortOrder": 10
},
{
"PanelCode": "TD",
"TestCode": "SA_STAIN",
"SortOrder": 11
},
{
"PanelCode": "TD",
"TestCode": "SA_HEAD",
"SortOrder": 12
},
{
"PanelCode": "TD",
"TestCode": "SA_TAIL",
"SortOrder": 13
},
{
"PanelCode": "TD",
"TestCode": "SA_CONCL",
"SortOrder": 14
},
{
"PanelCode": "ND",
"TestCode": "SYPHILIS",
"SortOrder": 1
},
{
"PanelCode": "ND",
"TestCode": "HIV",
"SortOrder": 2
},
{
"PanelCode": "ND",
"TestCode": "HBSAG",
"SortOrder": 3
},
{
"PanelCode": "ND",
"TestCode": "HCV_AB",
"SortOrder": 4
},
{
"PanelCode": "ND",
"TestCode": "HPV_IGG",
"SortOrder": 5
},
{
"PanelCode": "ND",
"TestCode": "CHLAMYDIA",
"SortOrder": 6
},
{
"PanelCode": "ND",
"TestCode": "URETH_FL",
"SortOrder": 7
},
{
"PanelCode": "ND",
"TestCode": "URETH_WET",
"SortOrder": 8
},
{
"PanelCode": "ND",
"TestCode": "URETH_GRAM",
"SortOrder": 9
},
{
"PanelCode": "ND",
"TestCode": "VAG_FL",
"SortOrder": 10
},
{
"PanelCode": "ND",
"TestCode": "VAG_WET",
"SortOrder": 11
},
{
"PanelCode": "ND",
"TestCode": "VAG_GRAM",
"SortOrder": 12
},
{
"PanelCode": "ID",
"TestCode": "NA",
"SortOrder": 1
},
{
"PanelCode": "ID",
"TestCode": "K",
"SortOrder": 2
},
{
"PanelCode": "ID",
"TestCode": "CL",
"SortOrder": 3
},
{
"PanelCode": "DA",
"TestCode": "SP_AFB",
"SortOrder": 1
},
{
"PanelCode": "DA",
"TestCode": "SP_AFB_NOTE",
"SortOrder": 2
},
{
"PanelCode": "DA",
"TestCode": "SP_APPEAR",
"SortOrder": 3
},
{
"PanelCode": "DA",
"TestCode": "SP_GRAM",
"SortOrder": 4
},
{
"PanelCode": "GN",
"TestCode": "DRUG_MET",
"SortOrder": 1
},
{
"PanelCode": "GN",
"TestCode": "DRUG_THC",
"SortOrder": 2
},
{
"PanelCode": "GN",
"TestCode": "DRUG_MDMA",
"SortOrder": 3
},
{
"PanelCode": "GN",
"TestCode": "DRUG_MOP",
"SortOrder": 4
},
{
"PanelCode": "GN",
"TestCode": "DRUG_KET",
"SortOrder": 5
}
]
};

