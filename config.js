/**
 * config.js – Cấu hình triển khai Frontend.
 *  API_URL = 'DEMO'  → chạy demo offline trong trình duyệt (dữ liệu giả, lưu localStorage).
 *  API_URL = 'https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec' → kết nối Google Apps Script thật.
 */
window.LIS_CONFIG = {
  API_URL: 'DEMO',
  REQUEST_TIMEOUT_MS: 60000
};
