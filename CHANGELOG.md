# Nhật ký phiên bản

Số phiên bản hiện ở màn đăng nhập và góc dưới thanh bên. Nếu giao diện (GitHub) và Apps Script khác phiên bản, thanh bên hiện cả 2 số màu vàng: cần dán `LIS_Code.gs` mới + Deploy → New version, upload đủ file giao diện rồi Ctrl+F5.

Khi cập nhật: tăng `APP.VERSION` (backend/00_Config.gs) và `App.FE_VERSION` (assets/app.js) cùng số, ghi thêm 1 mục ở đây.

## v2.2.3 (2026-11-26) — Phiếu chừa trống gọn 1 trang + xuất PDF nhanh hơn
- Phiếu có "Chừa trống cho máy XN": thu gọn khoảng cách (lề 5 mm, đầu phiếu 1 hàng: logo | phòng XN | thông tin BN, đệm dòng tối thiểu, chân phiếu 2 cột ghi chú | chữ ký). Vùng trống bắt đầu ~32 mm từ mép giấy như mẫu Word; tới ~20 chỉ số vẫn 1 trang A4.
- Xuất PDF: gộp định dạng mỗi ô bảng thành 1 lệnh, bỏ các lệnh thay token khi phiếu không dùng mẫu riêng → số lệnh Google Docs giảm ~78% (1.309 → 291 với 17 chỉ số). Logo/hình chìm được cache 6 giờ (không tải lại Drive mỗi lần in).
- Cần dán `LIS_Code.gs` + Deploy → New version. Không cần chạy `setup`.

## v2.2.2 (2026-11-26) — Hiển thị phiên bản
- Màn đăng nhập: "Phiên bản x.y.z". Thanh bên (dưới tên người dùng): "Phiên bản x.y.z"; giao diện ≠ máy chủ → "Giao diện vA · Máy chủ vB" màu vàng.
- Quản trị → Hệ thống: cảnh báo khi 2 số khác nhau dù chỉ chữ số cuối.
- Cần dán `LIS_Code.gs` (để máy chủ cùng số 2.2.2). Không cần chạy `setup`.

## v2.2.1
- Nhóm XN: ô "Chừa trống cho máy XN (mm)" (VD 170 như mẫu YKHOA COMBO). > 0 → khổ A4, thông tin BN lên bên phải đầu phiếu, khoảng trống cố định dưới tiêu đề, không in hình chìm; In nhanh tự co chữ phần còn lại cho vừa 1 trang.

## v2.2.0
- Quản trị → Danh mục XN → Nhóm: ô "Ghi chú trên phiếu in" (nhiều dòng) → in nghiêng bên trái khối chữ ký, cả In nhanh và PDF.
- Backend: dán `LIS_Code.gs` → Deploy New version (cột PrintNote tự thêm khi lưu nhóm, không cần setup).

## v2.1.9
- In nhanh / PDF dùng khoảng tham chiếu hiện tại của danh mục (đã xuống dòng); chỉ giữ bản lưu kèm kết quả khi các con số khác (ngưỡng đã đổi).
- Giữ nhiều khoảng trắng liền nhau (căn chỉnh "Nữ     ≤ 32").

## v2.1.8
- Quản trị → Danh mục XN → sửa chỉ số: ô "Khoảng tham chiếu" là ô nhiều dòng, Enter để xuống dòng (hoặc Alt+Enter trong Google Sheet).
- Màn nhập kết quả, In nhanh, PDF, Lịch sử chỉ số giữ đúng xuống dòng. Phiếu cũ cùng nội dung cũng in xuống dòng.
- Backend: dán `LIS_Code.gs` → Deploy New version. GitHub: `index.html`, `assets/app.js`, `assets/views-order.js`, `assets/views-admin.js`, `assets/api.js`, `assets/demo/backend.bundle.js`.

## v2.1.7
- Backend: dán `LIS_Code.gs` → Deploy New version (không cần setup).
- GitHub: `index.html`, `assets/app.js`, `assets/views-order.js`, `assets/styles.css`, `assets/api.js`, `assets/demo/backend.bundle.js` → Ctrl+F5.

## v2.1.6
- Cấp mã BN / mã phiếu luôn kiểm tra mã chưa tồn tại; bộ đếm bị lùi → tự nhảy tới số lớn nhất + 1.
- Sửa dữ liệu đã trùng: chạy `repairDuplicatePatientIds` (xem trước) → kiểm tra Nhật ký → `repairDuplicatePatientIdsApply`.

## v2.1.5
- Sheet đã đủ cột → setup không định dạng lại cả sheet (trước: tô tiêu đề + đặt định dạng chữ cho toàn bộ hàng chục nghìn dòng mỗi lần).
- Setup không đối soát chỉ mục nữa khi đã có (01:00 tự làm); kiểm tra cuối không mở các DB khóa sổ.
- Chỉ cần dán `LIS_Code.gs` → Deploy New version. **Không bắt buộc chạy setup.**

## v2.1.4
- Nút "Lịch sử" và "X lần khám trước năm … – xem ở Tra cứu phiếu" mở tab mới **không phải đăng nhập lại** (tab gốc trao phiên qua localStorage, hiệu lực 20 giây, dùng 1 lần).
- Upload: `index.html`, `assets/app.js`, `assets/api.js`, `assets/views-order.js`, `assets/views-admin.js`, `assets/demo/backend.bundle.js` → đợi 2 phút → Ctrl+F5.

## v2.1.3
- `setup` / 01:00 bỏ qua đo lại DB đã khóa sổ (RO) đã đo đủ; nút "Đo dung lượng" vẫn đo lại tất cả.
- Quét DB năm cũ (dựng chỉ mục, đo khoảng ngày) đọc thẳng vài cột, không nạp cả bảng vào cache.
- Hàm chạy tay `buildVisitIndex` (khi setup quá 6 phút). Nhật ký thực thi ghi số giây từng bước.

## v2.1.2
- Quản trị → Hệ thống hiện **phiên bản máy chủ** và **phiên bản giao diện**; khác nhau → cảnh báo (cập nhật thiếu bước).
- Từ v2.0.0 trở lên, upload đủ 8 file giao diện: `index.html`, `assets/app.js`, `assets/views-order.js`, `assets/views-admin.js`, `assets/styles.css`, `assets/api.js`, `assets/gas-shim.js`, `assets/demo/backend.bundle.js` (+ `assets/sync.js`, `assets/discount-core.js` nếu nâng từ v1.x).

## v2.1.1
1. Dán lại `LIS_Code.gs` → Deploy → New version → chạy **`setup`** (thêm cấu hình `RECENT_VISIT_YEARS`).
2. Upload: `index.html`, `assets/app.js`, `assets/views-order.js`, `assets/api.js`, `assets/demo/backend.bundle.js`.
- Tạo phiếu → chọn BN: chỉ tải lần khám **năm nay + N năm trước** (`RECENT_VISIT_YEARS`, mặc định 1 → 2025–2026); năm cũ hơn hiện "X lần khám trước năm 2025 – xem ở Tra cứu phiếu" (mở tab mới, điền sẵn mã BN + năm).
- Chiết khấu tái khám vẫn tính đúng với BN chỉ khám ở năm cũ (dùng lần khám đầu tiên trong chỉ mục; máy chủ kiểm tra lại khi lưu).

## v2.1.0
1. Dán lại **toàn bộ** `LIS_Code.gs` vào Apps Script → **Deploy → Manage deployments → Edit → New version**.
2. Chạy **`setup`** 1 lần: thêm cột `VisitLog` (sheet Patients), dựng chỉ mục lần khám từ mọi DB năm, đo khoảng ngày từng DB, thêm 4 cấu hình mới.
   Quên chạy setup vẫn dùng được (đọc mọi DB như cũ); 01:00 đêm đó hệ thống tự dựng chỉ mục.
3. Upload lên GitHub: `index.html`, `assets/app.js`, `assets/views-order.js`, `assets/views-admin.js`, `assets/styles.css`, `assets/api.js`, `assets/gas-shim.js`, `assets/demo/backend.bundle.js`.
- Mở hồ sơ BN: không đọc DB năm nào (danh sách lần khám nằm sẵn trên dòng hồ sơ).
- Lịch sử chỉ số: chỉ đọc DB năm BN có khám; xem lại trong 6 giờ lấy từ bộ nhớ đệm; chọn khoảng Toàn bộ / 1 / 3 / 5 năm / Tùy chọn.
- Tra cứu / Thống kê: hiện số DB sẽ đọc theo khoảng ngày; DB đã đầy/khóa sổ ngoài khoảng ngày được bỏ qua.
- Cấu hình chung: `SEARCH_DEFAULT_DAYS`, `SEARCH_MAX_DAYS`, `REPORT_MAX_DAYS`, `HISTORY_DEFAULT_YEARS` (0 = không giới hạn).
- Quản trị → Hệ thống → **Chỉ mục lần khám**: trạng thái + nút dựng lại (khi sửa/nhập phiếu trực tiếp trên Google Sheet).

## v1.3
- Backend: dán đè `00_Config.gs`, `05_Catalog_Audit.gs`, `07_Order.gs` (hoặc `LIS_Code.gs`) → Deploy New version.
- Frontend: upload đè `index.html`, `assets/app.js`, `assets/api.js`, `assets/views-order.js`, `assets/styles.css`.
- LDL-C (Friedewald) & eGFR (CKD-EPI 2021, κ Nữ = 0.7) tự tính; chọn chúng tự thêm TG, Cholesterol, HDL / Creatinin.
- Chỉ số có ở nhiều nhóm trong cùng phiếu chỉ tính tiền 1 lần; kết quả nhập ở nhóm này tự hiện ở nhóm kia.

## v1.2
1. Dán đè `LIS_Code.gs` (có thêm module `11_Work`) → **Deploy → Manage deployments → Edit → New version**.
2. Chạy lại **`setup`** (hoặc không cần: các cột `AssignedTo`, `FirstResultAt`, `CompletedAt` tự được thêm vào bảng Orders ở lần ghi đầu).
3. **Quản trị → Vai trò & quyền:** tick quyền **"Xuất danh sách phiếu mình phụ trách"** (`work.export`) cho vai trò cần dùng (bản cài mới đã bật sẵn cho KTV, Lễ tân).
4. Upload lại thư mục `frontend`.
