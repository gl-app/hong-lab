/**
 * views-admin.js – Cảnh báo tái khám, Thống kê doanh thu + Xuất Excel, Nhật ký hệ thống, Quản trị.
 */
(function (App) {
  'use strict';
  var U = App.U, esc = U.esc;

  /* ================================================================ FOLLOW-UP */
  App.views['followup'] = function (view) {
    var st = { from: U.addDays(U.today(), -30), to: U.addDays(U.today(), Number(App.setting('FOLLOWUP_WINDOW_DAYS', 7))), status: 'PENDING', bucket: '' };
    view.innerHTML = '<div class="row g-3 mb-3" id="fu-kpi"></div><div class="card"><div class="card-header flex-wrap gap-2">' +
      '<div class="d-flex gap-2 flex-wrap align-items-center"><input type="date" class="form-control form-control-sm" id="fu-from" value="' + st.from + '" style="width:150px">' +
      '<span class="text-muted">→</span><input type="date" class="form-control form-control-sm" id="fu-to" value="' + st.to + '" style="width:150px">' +
      '<select class="form-select form-select-sm" id="fu-status" style="width:170px"><option value="PENDING">Chờ tái khám</option><option value="DONE">Đã tái khám</option><option value="SKIPPED">Bỏ qua</option><option value="ALL">Tất cả</option></select>' +
      '<button class="btn btn-sm btn-primary" id="fu-go"><i class="bi bi-arrow-clockwise"></i> Tải</button></div></div><div id="fu-list"></div></div>';

    function load() {
      st.from = U.$('#fu-from', view).value; st.to = U.$('#fu-to', view).value; st.status = U.$('#fu-status', view).value;
      U.$('#fu-list', view).innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
      U.api('followup.list', { from: st.from, to: st.to, status: st.status }).then(function (d) {
        var k = [['OVERDUE', 'Quá hạn', 'bi-exclamation-octagon', 'var(--danger)'], ['TODAY', 'Hôm nay', 'bi-calendar-check', 'var(--warn)'], ['UPCOMING', 'Sắp đến', 'bi-calendar-event', 'var(--brand)'], ['RETURNED', 'Đã quay lại (chưa đánh dấu)', 'bi-person-check', 'var(--success)']];
        U.$('#fu-kpi', view).innerHTML = k.map(function (x) {
          return '<div class="col-6 col-lg-3"><div class="card kpi" role="button" data-bucket="' + x[0] + '" style="' + (st.bucket === x[0] ? 'outline:2px solid ' + x[3] : '') + '"><div class="label"><i class="bi ' + x[2] + '" style="color:' + x[3] + '"></i> ' + x[1] + '</div>' +
            '<div class="value" style="color:' + x[3] + '">' + d.summary[x[0]] + '</div><div class="sub">bệnh nhân</div></div></div>';
        }).join('');
        var rows = st.bucket ? d.rows.filter(function (r) { return r.Bucket === st.bucket; }) : d.rows;
        U.$('#fu-list', view).innerHTML = rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Hẹn ngày</th><th>Còn</th><th>Bệnh nhân</th><th>Điện thoại</th><th>Phiếu gốc</th><th>Nhóm XN</th><th>Đã quay lại</th><th class="text-end">Thao tác</th></tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td>' + U.vnDate(r.FollowUpDate) + ' ' + U.badge(r.Bucket) + '</td><td class="tabular">' + (r.Bucket === 'RETURNED' ? '<span class="text-muted">' + U.vnDate(r.RevisitDate) + '</span>' : r.DaysLeft < 0 ? '<span class="text-danger">' + (-r.DaysLeft) + ' ngày trước</span>' : (r.DaysLeft === 0 ? 'Hôm nay' : r.DaysLeft + ' ngày')) + '</td>' +
              '<td><a href="#/patient/' + esc(r.PatientID) + '" class="fw-medium text-decoration-none">' + esc(r.PatientName) + '</a><div class="small text-muted">' + esc([r.Gender, r.Age !== null ? r.Age + 't' : ''].filter(String).join(' · ')) + '</div></td>' +
              '<td>' + (r.Phone ? '<a href="tel:' + esc(r.Phone) + '"><i class="bi bi-telephone"></i> ' + esc(r.Phone) + '</a>' : '—') + '</td>' +
              '<td><a class="mono small" href="#/order/' + r.OrderID + '">' + r.OrderID + '</a><div class="small text-muted">' + U.vnDate(r.OrderDate) + '</div></td><td>' + U.chips(r.PanelCodes) + '</td>' +
              '<td>' + (r.RevisitDate ? '<span class="text-success small"><i class="bi bi-check2"></i> ' + U.vnDate(r.RevisitDate) + '</span>' : '<span class="text-muted small">Chưa</span>') + '</td>' +
              '<td class="text-end text-nowrap">' + (App.can('order.create') ? '<a class="btn btn-sm btn-outline-primary" href="#/order-new/' + encodeURIComponent(r.PatientID) + '" title="Tạo phiếu tái khám"><i class="bi bi-plus-lg"></i></a> ' : '') +
                (r.FollowUpStatus === 'PENDING' ? '<button class="btn btn-sm btn-outline-success" data-fu="DONE" data-id="' + r.OrderID + '" title="Đánh dấu đã tái khám"><i class="bi bi-check2-circle"></i></button> ' +
                '<button class="btn btn-sm btn-outline-secondary" data-fu="SKIPPED" data-id="' + r.OrderID + '" title="Bỏ qua"><i class="bi bi-slash-circle"></i></button>' : U.badge(r.FollowUpStatus) +
                ' <button class="btn btn-sm btn-link" data-fu="PENDING" data-id="' + r.OrderID + '">Hoàn tác</button>') + '</td></tr>';
          }).join('') + '</tbody></table></div>' : U.empty('Không có lịch hẹn tái khám trong khoảng này', 'bi-calendar2-check');
      }).catch(function () {});
    }
    U.$('#fu-go', view).onclick = function () { st.bucket = ''; load(); };
    U.on(view, 'click', '[data-bucket]', function (e, el) { var b = el.getAttribute('data-bucket'); st.bucket = st.bucket === b ? '' : b; load(); });
    U.on(view, 'click', '[data-fu]', function (e, el) {
      var status = el.getAttribute('data-fu');
      var go = function (note) {
        U.api('followup.update', { orderId: el.getAttribute('data-id'), status: status, note: note || '' }).then(function () { U.toast('Đã cập nhật'); load(); App.refreshFollowupBadge(); }).catch(function () {});
      };
      if (status === 'SKIPPED') U.prompt('Bỏ qua lịch tái khám', 'Lý do (tuỳ chọn)', false).then(function (n) { if (n !== null) go(n); });
      else go();
    });
    load();
  };

  /* ================================================================ REPORT */
  App.views['report'] = function (view) {
    var t = U.today();
    var st = App._reportState || { from: t.substring(0, 8) + '01', to: t };
    var charts = [];
    App._cleanup = function () { charts.forEach(function (c) { c.destroy(); }); };
    var presets = [['Hôm nay', t, t], ['7 ngày', U.addDays(t, -6), t], ['Tháng này', t.substring(0, 8) + '01', t],
      ['Tháng trước', prevMonth(t)[0], prevMonth(t)[1]], ['Năm nay', t.substring(0, 4) + '-01-01', t]];
    view.innerHTML = '<div class="card mb-3"><div class="card-body d-flex flex-wrap gap-2 align-items-end">' +
      '<div><label class="form-label">Từ ngày</label><input type="date" class="form-control" id="r-from" value="' + st.from + '"></div>' +
      '<div><label class="form-label">Đến ngày</label><input type="date" class="form-control" id="r-to" value="' + st.to + '"></div>' +
      '<button class="btn btn-primary" id="r-go"><i class="bi bi-bar-chart"></i> Xem</button>' +
      presets.map(function (p, i) { return '<button class="btn btn-light" data-preset="' + i + '">' + p[0] + '</button>'; }).join('') +
      (App.can('report.export') ? '<div class="ms-auto d-flex gap-2 align-items-center"><div class="form-check mb-0"><input class="form-check-input" type="checkbox" id="r-incres"><label class="form-check-label small" for="r-incres">Kèm kết quả chi tiết</label></div>' +
        '<button class="btn btn-outline-primary" id="r-export"><i class="bi bi-file-earmark-excel"></i> Xuất Excel</button></div>' : '') +
      '</div></div><div id="r-body"></div>';

    function prevMonth(d) {
      var y = +d.substring(0, 4), m = +d.substring(5, 7) - 1;
      if (m === 0) { m = 12; y--; }
      var mm = ('0' + m).slice(-2);
      var last = new Date(y, m, 0).getDate();
      return [y + '-' + mm + '-01', y + '-' + mm + '-' + last];
    }
    function load() {
      st.from = U.$('#r-from', view).value; st.to = U.$('#r-to', view).value;
      App._reportState = st;
      var body = U.$('#r-body', view);
      body.innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
      U.api('report.revenue', st).then(function (r) {
        charts.forEach(function (c) { c.destroy(); }); charts = [];
        var s = r.summary;
        var kpi = [['Doanh thu thuần', U.money(s.net), 'Sau chiết khấu'], ['Số phiếu', U.num(s.orders), s.cancelled ? s.cancelled + ' phiếu hủy (không tính)' : 'không gồm phiếu hủy'],
          ['Bệnh nhân', U.num(s.patients), U.num(s.panels) + ' lượt nhóm XN'], ['Đã thu', U.money(s.paid), 'Chưa thu: ' + U.money(s.unpaid)],
          ['Chiết khấu', U.money(s.discount), 'Tổng trước CK: ' + U.money(s.gross)], ['TB / phiếu', U.money(s.orders ? Math.round(s.net / s.orders) : 0), '']];
        body.innerHTML = '<div class="row g-3 mb-3">' + kpi.map(function (k) {
          return '<div class="col-6 col-lg-4 col-xxl-2"><div class="card kpi h-100"><div class="label">' + k[0] + '</div><div class="value">' + k[1] + '</div><div class="sub">' + esc(k[2]) + '</div></div></div>';
        }).join('') + '</div>' +
          '<div class="row g-3"><div class="col-xl-8"><div class="card"><div class="card-header">Doanh thu theo ngày</div><div class="card-body"><canvas id="r-c1" height="110"></canvas></div></div></div>' +
          '<div class="col-xl-4"><div class="card h-100"><div class="card-header">Theo bác sĩ chỉ định</div><div class="table-wrap"><table class="table table-sm"><thead><tr><th>Bác sĩ</th><th class="text-end">Phiếu</th><th class="text-end">Doanh thu</th></tr></thead><tbody>' +
            (r.byDoctor.length ? r.byDoctor.map(function (d) { return '<tr><td>' + esc(d.doctor) + '</td><td class="text-end tabular">' + d.orders + '</td><td class="text-end tabular">' + U.money(d.net) + '</td></tr>'; }).join('') : '<tr><td colspan="3">' + U.empty('Không có dữ liệu') + '</td></tr>') +
          '</tbody></table></div></div></div>' +
          '<div class="col-12"><div class="card"><div class="card-header">Theo nhóm xét nghiệm <span class="small text-muted fw-normal ms-2">(đơn giá trước chiết khấu)</span></div><div class="table-wrap"><table class="table table-sm"><thead><tr><th>Mã</th><th>Nhóm XN</th><th class="text-end">Số lượt</th><th class="text-end">Doanh thu</th><th style="width:35%">Tỷ trọng</th></tr></thead><tbody>' +
            (function () {
              var tot = r.byPanel.reduce(function (a, b) { return a + b.amount; }, 0) || 1;
              return r.byPanel.length ? r.byPanel.map(function (p) {
                var pct = Math.round(p.amount * 1000 / tot) / 10;
                return '<tr><td><span class="panel-chip">' + p.panelCode + '</span></td><td>' + esc(p.panelName) + '</td><td class="text-end tabular">' + p.count + '</td><td class="text-end tabular">' + U.money(p.amount) + '</td>' +
                  '<td><div class="d-flex align-items-center gap-2"><div class="progress flex-grow-1" style="height:6px"><div class="progress-bar" style="width:' + pct + '%;background:var(--brand)"></div></div><span class="small tabular" style="width:44px">' + pct + '%</span></div></td></tr>';
              }).join('') : '<tr><td colspan="5">' + U.empty('Không có dữ liệu') + '</td></tr>';
            })() + '</tbody></table></div></div></div></div>';
        if (window.Chart && r.byDay.length) {
          charts.push(new Chart(U.$('#r-c1', body), {
            data: { labels: r.byDay.map(function (d) { return U.vnDate(d.date).substring(0, 5); }),
              datasets: [{ type: 'bar', label: 'Doanh thu (đ)', data: r.byDay.map(function (d) { return d.net; }), backgroundColor: '#0f4c5c', borderRadius: 3, yAxisID: 'y' },
                { type: 'line', label: 'Số phiếu', data: r.byDay.map(function (d) { return d.orders; }), borderColor: '#e36414', backgroundColor: '#e36414', yAxisID: 'y1', cubicInterpolationMode: 'monotone', pointRadius: 2 }] },
            options: { interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom' },
                tooltip: { callbacks: { label: function (c) { return c.dataset.label + ': ' + (c.datasetIndex === 0 ? U.money(c.parsed.y) : c.parsed.y); } } } },
              scales: { y: { ticks: { callback: function (v) { return v >= 1e6 ? (v / 1e6) + 'tr' : (v >= 1e3 ? (v / 1e3) + 'k' : v); } } },
                y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { precision: 0 } } } }
          }));
        }
      }).catch(function () { body.innerHTML = U.empty('Lỗi tải báo cáo', 'bi-exclamation-triangle'); });
    }
    U.$('#r-go', view).onclick = load;
    U.on(view, 'click', '[data-preset]', function (e, el) { var p = presets[+el.getAttribute('data-preset')]; U.$('#r-from', view).value = p[1]; U.$('#r-to', view).value = p[2]; load(); });
    var ex = U.$('#r-export', view);
    if (ex) ex.onclick = function () {
      ex.disabled = true;
      U.api('report.export', { from: U.$('#r-from', view).value, to: U.$('#r-to', view).value, includeResults: U.$('#r-incres', view).checked })
        .then(function (d) { App.exportXlsx(d); }).catch(function () {}).finally(function () { ex.disabled = false; });
    };
    load();
  };

  /** Build .xlsx with SheetJS: Tổng hợp, Phiếu XN, Chi tiết nhóm, Kết quả (tuỳ chọn). */
  App.exportXlsx = function (d) {
    if (!window.XLSX) { U.toast('Thư viện Excel chưa tải xong', 'error'); return; }
    var wb = XLSX.utils.book_new();
    var money = d.includesMoney;
    var active = d.orders.filter(function (o) { return o.Status !== 'CANCELLED'; });
    var sum = function (arr, k) { return arr.reduce(function (a, o) { return a + (Number(o[k]) || 0); }, 0); };
    var summary = [['BÁO CÁO TỔNG HỢP PHIẾU XÉT NGHIỆM'], ['Từ ngày', U.vnDate(d.from), 'Đến ngày', U.vnDate(d.to)], ['Xuất lúc', new Date().toLocaleString('vi-VN'), 'Người xuất', App.state.user.username], [],
      ['Chỉ tiêu', 'Giá trị'], ['Tổng số phiếu', d.orders.length], ['Phiếu hợp lệ', active.length], ['Phiếu hủy', d.orders.length - active.length]];
    if (money) summary.push(['Tổng tiền (trước CK)', sum(active, 'GrossAmount')], ['Chiết khấu', sum(active, 'Discount')], ['Doanh thu thuần', sum(active, 'NetAmount')],
      ['Đã thu', sum(active.filter(function (o) { return o.PaymentStatus === 'PAID'; }), 'NetAmount')]);
    var ws0 = XLSX.utils.aoa_to_sheet(summary);
    ws0['!cols'] = [{ wch: 26 }, { wch: 20 }, { wch: 12 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws0, 'TongHop');

    var cols = [['OrderID', 'Mã phiếu'], ['OrderDate', 'Ngày khám'], ['PatientID', 'Mã BN'], ['PatientName', 'Họ tên'], ['Gender', 'Giới tính'], ['Age', 'Tuổi'], ['Phone', 'SĐT'],
      ['Address', 'Địa chỉ'], ['DoctorName', 'BS chỉ định'], ['PanelCodes', 'Nhóm XN']];
    if (money) cols = cols.concat([['GrossAmount', 'Tổng tiền'], ['Discount', 'Chiết khấu'], ['NetAmount', 'Thành tiền'], ['PaymentStatus', 'Thanh toán']]);
    cols = cols.concat([['Status', 'Trạng thái'], ['FollowUpDate', 'Ngày tái khám'], ['Note', 'Ghi chú'], ['LegacyCode', 'Mã cũ'], ['CreatedBy', 'Người tạo'], ['CreatedAt', 'Thời điểm tạo']]);
    var aoa = [cols.map(function (c) { return c[1]; })].concat(d.orders.map(function (o) {
      return cols.map(function (c) {
        var v = o[c[0]];
        if (c[0] === 'Status' || c[0] === 'PaymentStatus') return U.statusLabel(v);
        if (c[0] === 'OrderDate' || c[0] === 'FollowUpDate') return U.vnDate(v);
        return v === null || v === undefined ? '' : v;
      });
    }));
    var ws1 = XLSX.utils.aoa_to_sheet(aoa);
    ws1['!cols'] = cols.map(function (c) { return { wch: Math.max(10, c[1].length + 2, c[0] === 'PatientName' || c[0] === 'Address' ? 26 : 0) }; });
    ws1['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: aoa.length - 1, c: cols.length - 1 } }) };
    XLSX.utils.book_append_sheet(wb, ws1, 'PhieuXN');

    var lh = ['Mã phiếu', 'Ngày khám', 'Họ tên', 'Trạng thái phiếu', 'Mã nhóm', 'Nhóm XN'].concat(money ? ['Đơn giá'] : []).concat(['Kết quả']);
    var la = [lh].concat(d.lines.map(function (l) {
      return [l.OrderID, U.vnDate(l.OrderDate), l.PatientName, U.statusLabel(l.Status), l.PanelCode, l.PanelName].concat(money ? [l.Amount] : []).concat([l.ResultStatus === 'RESULTED' ? 'Có KQ' : 'Chờ KQ']);
    }));
    var ws2 = XLSX.utils.aoa_to_sheet(la);
    ws2['!cols'] = lh.map(function () { return { wch: 16 }; });
    XLSX.utils.book_append_sheet(wb, ws2, 'ChiTietNhom');

    if (d.results && d.results.length) {
      var rh = ['Mã phiếu', 'Ngày khám', 'Mã BN', 'Mã nhóm', 'Mã chỉ số', 'Chỉ số', 'Kết quả', 'Đơn vị', 'Tham chiếu', 'Cờ'];
      var ra = [rh].concat(d.results.map(function (r) {
        var num = Number(String(r.Value).replace(',', '.'));
        return [r.OrderID, U.vnDate(r.OrderDate), r.PatientID, r.PanelCode, r.TestCode, r.TestName, r.Value !== '' && !isNaN(num) ? num : r.Value, r.Unit, r.RefText, r.Flag];
      }));
      var ws3 = XLSX.utils.aoa_to_sheet(ra);
      ws3['!cols'] = rh.map(function (h, i) { return { wch: i === 5 || i === 8 ? 26 : 14 }; });
      XLSX.utils.book_append_sheet(wb, ws3, 'KetQua');
    }
    XLSX.writeFile(wb, 'LIS_BaoCao_' + d.from + '_' + d.to + '.xlsx');
    U.toast('Đã xuất ' + d.orders.length + ' phiếu ra Excel');
  };

  /* ================================================================ AUDIT */
  App.views['audit'] = function (view) {
    var t = U.today();
    view.innerHTML = '<div class="card mb-3"><div class="card-body"><form class="row g-2 align-items-end" id="a-form">' +
      '<div class="col-6 col-md-2"><label class="form-label">Từ ngày</label><input type="date" class="form-control" name="from" value="' + U.addDays(t, -7) + '"></div>' +
      '<div class="col-6 col-md-2"><label class="form-label">Đến ngày</label><input type="date" class="form-control" name="to" value="' + t + '"></div>' +
      '<div class="col-6 col-md-2"><label class="form-label">Tài khoản</label><input class="form-control" name="username"></div>' +
      '<div class="col-6 col-md-2"><label class="form-label">Thao tác</label><select class="form-select" name="action"><option value="">Tất cả</option>' +
        ['LOGIN', 'LOGIN_FAILED', 'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_CANCEL', 'RESULT_SAVE', 'PRINT', 'FOLLOWUP_UPDATE', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'EXPORT',
         'USER_CREATE', 'USER_UPDATE', 'ROLE_UPDATE', 'SETTINGS_UPDATE', 'YEAR_DB_SAVE', 'TEST_UPDATE', 'PANEL_UPDATE'].map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></div>' +
      '<div class="col-md-3"><label class="form-label">Từ khóa (mã phiếu, nội dung)</label><input class="form-control" name="q"></div>' +
      '<div class="col-md-1"><button class="btn btn-primary w-100" type="submit"><i class="bi bi-search"></i></button></div></form></div></div><div class="card" id="a-list"></div>';
    var form = U.$('#a-form', view);
    function load() {
      U.$('#a-list', view).innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
      U.api('audit.list', U.formData(form)).then(function (d) {
        U.$('#a-list', view).innerHTML = d.rows.length ? '<div class="card-header">' + d.total + ' bản ghi' + (d.total > d.rows.length ? ' (hiển thị ' + d.rows.length + ')' : '') + '</div><div class="table-wrap"><table class="table table-sm"><thead><tr><th>Thời gian</th><th>Nguồn</th><th>Tài khoản</th><th>Thao tác</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead><tbody>' +
          d.rows.map(function (r) {
            var link = /^XN-/.test(r.EntityID) ? '<a class="mono" href="#/order/' + esc(r.EntityID) + '">' + esc(r.EntityID) + '</a>' : (/^BN-/.test(r.EntityID) ? '<a class="mono" href="#/patient/' + esc(r.EntityID) + '">' + esc(r.EntityID) + '</a>' : esc(r.EntityID));
            return '<tr><td class="small text-nowrap">' + U.vnDateTime(r.Timestamp) + '</td><td class="small text-muted">' + esc(r.Source) + '</td><td>' + esc(r.Username) + '</td>' +
              '<td><span class="badge ' + (/FAIL|CANCEL/.test(r.Action) ? 'text-bg-danger' : 'text-bg-light') + '">' + esc(r.Action) + '</span></td><td class="small">' + esc(r.Entity) + ' ' + link + '</td><td>' + App.auditDetail(r.Detail) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : U.empty('Không có bản ghi');
      }).catch(function () {});
    }
    form.onsubmit = function (e) { e.preventDefault(); load(); };
    load();
  };

  /* ================================================================ ADMIN */
  App.views['admin'] = function (view, params) {
    var tabs = [];
    if (App.can('admin.config')) tabs.push(['general', 'Cấu hình chung', 'bi-sliders']);
    if (App.can('admin.users')) tabs.push(['users', 'Tài khoản', 'bi-people'], ['roles', 'Vai trò & quyền', 'bi-shield-lock']);
    if (App.can('admin.config')) tabs.push(['catalog', 'Danh mục XN', 'bi-list-check'], ['doctors', 'Bác sĩ chỉ định', 'bi-person-badge'], ['years', 'Kết nối dữ liệu năm', 'bi-database'], ['system', 'Hệ thống', 'bi-cpu']);
    var tab = params[0] && tabs.some(function (t) { return t[0] === params[0]; }) ? params[0] : tabs[0][0];
    view.innerHTML = '<ul class="nav nav-tabs mb-3">' + tabs.map(function (t) {
      return '<li class="nav-item"><a class="nav-link' + (t[0] === tab ? ' active' : '') + '" href="#/admin/' + t[0] + '"><i class="bi ' + t[2] + '"></i> ' + t[1] + '</a></li>';
    }).join('') + '</ul><div id="ad-body"></div>';
    var body = U.$('#ad-body', view);
    ({ general: general, users: users, roles: roles, catalog: catalog, doctors: doctors, years: years, system: system })[tab](body);
  };

  function general(body) {
    U.api('admin.settings.get').then(function (rows) {
      body.innerHTML = '<div class="card"><div class="card-body"><form id="g-form" class="row g-3">' + rows.map(function (r) {
        var long = /FOOTER|ADDRESS/.test(r.Key);
        return '<div class="col-md-6"><label class="form-label mono">' + esc(r.Key) + '</label>' +
          (long ? '<textarea class="form-control" rows="2" name="' + esc(r.Key) + '">' + esc(r.Value) + '</textarea>' : '<input class="form-control" name="' + esc(r.Key) + '" value="' + esc(r.Value) + '">') +
          '<div class="form-text">' + esc(r.Description || '') + '</div></div>';
      }).join('') + '</form></div><div class="card-footer bg-white text-end"><button class="btn btn-primary" id="g-save"><i class="bi bi-save"></i> Lưu cấu hình</button></div></div>';
      U.$('#g-save', body).onclick = function () {
        var d = U.formData(U.$('#g-form', body));
        U.api('admin.settings.save', { items: Object.keys(d).map(function (k) { return { Key: k, Value: d[k] }; }) }).then(function () {
          U.toast('Đã lưu cấu hình');
          return Api.call('auth.me');
        }).then(function (boot) { if (boot) { App.state.settings = boot.settings; } }).catch(function () {});
      };
    }).catch(function () {});
  }

  function users(body) {
    Promise.all([U.api('admin.users.list'), U.api('admin.roles.list')]).then(function (res) {
      var list = res[0], roles = res[1].roles;
      var roleName = function (c) { var r = roles.filter(function (x) { return x.RoleCode === c; })[0]; return r ? r.RoleName : c; };
      body.innerHTML = '<div class="card"><div class="card-header justify-content-between"><span>' + list.length + ' tài khoản</span><button class="btn btn-sm btn-primary" id="u-new"><i class="bi bi-person-plus"></i> Thêm tài khoản</button></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Tên đăng nhập</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th><th></th></tr></thead><tbody>' +
        list.map(function (u) {
          return '<tr><td class="mono fw-semibold">' + esc(u.Username) + '</td><td>' + esc(u.FullName) + '</td><td>' + esc(roleName(u.RoleCode)) + ' <span class="small text-muted mono">' + esc(u.RoleCode) + '</span></td>' +
            '<td>' + (u.IsActive ? '<span class="st st-COMPLETED">Hoạt động</span>' : '<span class="st st-CANCELLED">Khóa</span>') + (u.MustChangePassword ? ' <span class="small text-warning">chờ đổi MK</span>' : '') + '</td>' +
            '<td class="small">' + U.vnDateTime(u.LastLoginAt) + '</td><td class="text-end"><button class="btn btn-sm btn-light" data-edit="' + esc(u.Username) + '"><i class="bi bi-pencil"></i></button> ' +
            '<button class="btn btn-sm btn-light" data-reset="' + esc(u.Username) + '" title="Đặt lại mật khẩu"><i class="bi bi-key"></i></button></td></tr>';
        }).join('') + '</tbody></table></div></div>';
      function edit(u) {
        var isNew = !u;
        u = u || { IsActive: true };
        var m = U.modal('<div class="modal-header"><h5 class="modal-title">' + (isNew ? 'Thêm tài khoản' : 'Sửa ' + esc(u.Username)) + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><form id="u-form" class="row g-2">' +
          '<div class="col-6"><label class="form-label">Tên đăng nhập</label><input class="form-control" name="Username" value="' + esc(u.Username || '') + '"' + (isNew ? ' required pattern="[a-z0-9._-]{3,32}"' : ' readonly') + '></div>' +
          '<div class="col-6"><label class="form-label">Họ tên</label><input class="form-control" name="FullName" required value="' + esc(u.FullName || '') + '"></div>' +
          '<div class="col-6"><label class="form-label">Vai trò (Group)</label><select class="form-select" name="RoleCode">' + roles.map(function (r) { return '<option value="' + r.RoleCode + '"' + (u.RoleCode === r.RoleCode ? ' selected' : '') + '>' + esc(r.RoleName) + '</option>'; }).join('') + '</select></div>' +
          '<div class="col-6"><label class="form-label">' + (isNew ? 'Mật khẩu ban đầu' : 'Mật khẩu mới (bỏ trống = giữ)') + '</label><input class="form-control" name="Password" type="text" minlength="6"' + (isNew ? ' required' : '') + ' autocomplete="new-password"></div>' +
          '<div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" name="IsActive" id="u-act"' + (u.IsActive ? ' checked' : '') + '><label class="form-check-label" for="u-act">Cho phép đăng nhập</label></div></div>' +
          '</form><div class="small text-muted mt-2">Người dùng phải đổi mật khẩu ở lần đăng nhập kế tiếp khi được cấp mật khẩu mới.</div></div><div class="modal-footer"><button class="btn btn-primary" id="u-save">Lưu</button></div>');
        m.body.querySelector('#u-save').onclick = function () {
          var f = m.body.querySelector('#u-form');
          if (!f.reportValidity()) return;
          var d = U.formData(f);
          if (!d.Password) delete d.Password;
          U.api('admin.users.save', d).then(function () { m.hide(); U.toast('Đã lưu tài khoản'); users(body); }).catch(function () {});
        };
      }
      U.$('#u-new', body).onclick = function () { edit(null); };
      U.on(body, 'click', '[data-edit]', function (e, el) { edit(list.filter(function (u) { return u.Username === el.getAttribute('data-edit'); })[0]); });
      U.on(body, 'click', '[data-reset]', function (e, el) {
        var un = el.getAttribute('data-reset');
        U.prompt('Đặt lại mật khẩu cho ' + un, 'Mật khẩu tạm (≥ 6 ký tự)', true).then(function (pw) {
          if (!pw) return;
          U.api('admin.users.resetPassword', { Username: un, NewPassword: pw }).then(function () { U.toast('Đã đặt lại mật khẩu – người dùng phải đổi khi đăng nhập'); }).catch(function () {});
        });
      });
    }).catch(function () {});
  }

  function roles(body) {
    U.api('admin.roles.list').then(function (d) {
      var groups = {};
      d.permissions.forEach(function (p) { (groups[p.group] = groups[p.group] || []).push(p); });
      body.innerHTML = '<div class="card"><div class="card-header justify-content-between"><span>Ma trận phân quyền theo vai trò</span><button class="btn btn-sm btn-outline-primary" id="r-new"><i class="bi bi-plus-lg"></i> Vai trò mới</button></div>' +
        '<div class="table-wrap"><table class="table table-sm perm-matrix"><thead><tr><th>Chức năng</th>' + d.roles.map(function (r) {
          return '<th><div>' + esc(r.RoleName) + '</div><div class="mono small text-muted">' + r.RoleCode + '</div></th>';
        }).join('') + '</tr></thead><tbody>' +
        Object.keys(groups).map(function (g) {
          return '<tr class="table-light"><td colspan="' + (d.roles.length + 1) + '" class="small fw-semibold text-uppercase text-muted">' + esc(g) + '</td></tr>' + groups[g].map(function (p) {
            return '<tr><td>' + esc(p.label) + ' <span class="small text-muted mono">' + p.key + '</span></td>' + d.roles.map(function (r) {
              var all = r.Permissions.indexOf('*') > -1;
              return '<td><input class="form-check-input" type="checkbox" data-role="' + r.RoleCode + '" data-perm="' + p.key + '"' + (all || r.Permissions.indexOf(p.key) > -1 ? ' checked' : '') + (all ? ' disabled title="Toàn quyền"' : '') + '></td>';
            }).join('') + '</tr>';
          }).join('');
        }).join('') + '</tbody></table></div><div class="card-footer bg-white d-flex gap-2 justify-content-end">' +
        d.roles.filter(function (r) { return r.Permissions.indexOf('*') === -1; }).map(function (r) { return '<button class="btn btn-sm btn-primary" data-save-role="' + r.RoleCode + '">Lưu ' + esc(r.RoleCode) + '</button>'; }).join('') + '</div></div>';
      U.on(body, 'click', '[data-save-role]', function (e, el) {
        var code = el.getAttribute('data-save-role');
        var role = d.roles.filter(function (r) { return r.RoleCode === code; })[0];
        var perms = U.$$('input[data-role="' + code + '"]:checked', body).map(function (x) { return x.getAttribute('data-perm'); });
        U.api('admin.roles.save', { RoleCode: code, RoleName: role.RoleName, Permissions: perms }).then(function () { U.toast('Đã lưu quyền ' + code + ' (hiệu lực ngay)'); }).catch(function () {});
      });
      U.$('#r-new', body).onclick = function () {
        var m = U.modal('<div class="modal-header"><h5 class="modal-title">Vai trò mới</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><form id="rn-form" class="row g-2">' +
          '<div class="col-5"><label class="form-label">Mã (A-Z, _)</label><input class="form-control mono" name="RoleCode" required pattern="[A-Za-z0-9_]{2,20}"></div>' +
          '<div class="col-7"><label class="form-label">Tên vai trò</label><input class="form-control" name="RoleName" required></div></form></div>' +
          '<div class="modal-footer"><button class="btn btn-primary" id="rn-save">Tạo</button></div>', { size: 'sm' });
        m.body.querySelector('#rn-save').onclick = function () {
          var f = m.body.querySelector('#rn-form');
          if (!f.reportValidity()) return;
          var x = U.formData(f);
          U.api('admin.roles.save', { RoleCode: x.RoleCode, RoleName: x.RoleName, Permissions: ['order.view'] }).then(function () { m.hide(); roles(body); }).catch(function () {});
        };
      };
    }).catch(function () {});
  }

  function catalog(body) {
    var cat = App.state.catalog;
    var sel = cat.panels[0] ? cat.panels[0].PanelCode : null;
    function render() {
      cat = App.state.catalog;
      body.innerHTML = '<div class="row g-3"><div class="col-lg-4"><div class="card"><div class="card-header justify-content-between"><span>Nhóm xét nghiệm</span><button class="btn btn-sm btn-outline-primary" id="c-newp"><i class="bi bi-plus-lg"></i></button></div>' +
        '<div class="list-group list-group-flush">' + cat.panels.map(function (p) {
          return '<button class="list-group-item list-group-item-action d-flex justify-content-between' + (p.PanelCode === sel ? ' active' : '') + '" data-psel="' + p.PanelCode + '"><span><b>' + p.PanelCode + '</b> · ' + esc(p.PanelName) + '</span>' +
            (p.IsActive ? '' : '<span class="small">ẩn</span>') + '</button>';
        }).join('') + '</div></div></div><div class="col-lg-8" id="c-panel"></div>' +
        '<div class="col-12"><div class="card"><div class="card-header justify-content-between"><span>Danh mục chỉ số (' + cat.tests.length + ')</span><div class="d-flex gap-2"><input class="form-control form-control-sm" id="c-tq" placeholder="Lọc…" style="width:180px"><button class="btn btn-sm btn-outline-primary" id="c-newt"><i class="bi bi-plus-lg"></i> Chỉ số</button></div></div>' +
        '<div class="table-wrap" style="max-height:480px"><table class="table table-sm table-hover"><thead class="sticky-top"><tr><th>Mã</th><th>Tên chỉ số</th><th>Kiểu</th><th>Đơn vị</th><th>Nam</th><th>Nữ</th><th>Hiển thị tham chiếu</th><th class="text-end">Đơn giá</th><th></th></tr></thead><tbody id="c-tests">' +
        cat.tests.slice().sort(function (a, b) { return a.SortOrder - b.SortOrder; }).map(function (t) {
          var rg = function (a, b) { return (a === null ? '' : a) + (a !== null || b !== null ? ' – ' : '') + (b === null ? '' : b); };
          return '<tr data-tedit="' + t.TestCode + '"><td class="mono small">' + t.TestCode + '</td><td>' + esc(t.TestName) + '</td><td class="small">' + t.ResultType + '</td><td class="small">' + esc(t.Unit || '') + '</td>' +
            '<td class="small tabular">' + rg(t.RefMinM, t.RefMaxM) + '</td><td class="small tabular">' + rg(t.RefMinF, t.RefMaxF) + '</td><td class="small">' + esc(t.RefText || '') + '</td>' +
            '<td class="text-end tabular">' + U.num(t.Price) + '</td><td>' + (t.IsActive ? '' : '<span class="small text-muted">ẩn</span>') + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div></div>';
      renderPanel();
    }
    function renderPanel(isNew) {
      var box = U.$('#c-panel', body);
      var p = isNew ? { PanelCode: '', PanelName: '', PrintTitle: 'PHIẾU KẾT QUẢ XÉT NGHIỆM', PricingMode: 'TEST', Price: 0, IsActive: true, SortOrder: cat.panels.length + 1 } : App.panel(sel);
      if (!p) { box.innerHTML = ''; return; }
      var members = isNew ? [] : App.testsOfPanel(p.PanelCode).map(function (t) { return t.TestCode; });
      box.innerHTML = '<div class="card"><div class="card-header">' + (isNew ? 'Nhóm mới' : 'Nhóm ' + p.PanelCode) + '</div><div class="card-body"><form id="p-form" class="row g-2">' +
        '<div class="col-3"><label class="form-label">Mã</label><input class="form-control mono" name="PanelCode" value="' + esc(p.PanelCode) + '"' + (isNew ? ' required' : ' readonly') + '></div>' +
        '<div class="col-6"><label class="form-label">Tên nhóm</label><input class="form-control" name="PanelName" required value="' + esc(p.PanelName) + '"></div>' +
        '<div class="col-3"><label class="form-label">Thứ tự</label><input class="form-control" name="SortOrder" value="' + esc(p.SortOrder) + '"></div>' +
        '<div class="col-6"><label class="form-label">Tiêu đề phiếu in</label><input class="form-control" name="PrintTitle" value="' + esc(p.PrintTitle || '') + '"></div>' +
        '<div class="col-6"><label class="form-label">Phụ đề phiếu in</label><input class="form-control" name="PrintSubtitle" value="' + esc(p.PrintSubtitle || '') + '"></div>' +
        '<div class="col-4"><label class="form-label">Cách tính giá</label><select class="form-select" name="PricingMode"><option value="TEST"' + (p.PricingMode === 'TEST' ? ' selected' : '') + '>Tổng giá chỉ số</option><option value="PANEL"' + (p.PricingMode === 'PANEL' ? ' selected' : '') + '>Giá trọn gói nhóm</option></select></div>' +
        '<div class="col-4"><label class="form-label">Giá nhóm (đ)</label><input class="form-control tabular" name="Price" value="' + esc(p.Price || 0) + '"></div>' +
        '<div class="col-4 d-flex align-items-end"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" name="IsActive" id="p-act"' + (p.IsActive ? ' checked' : '') + '><label class="form-check-label" for="p-act">Đang sử dụng</label></div></div>' +
        '<div class="col-12"><label class="form-label">ID mẫu in Google Docs riêng (tuỳ chọn)</label><input class="form-control mono" name="TemplateDocId" value="' + esc(p.TemplateDocId || '') + '" placeholder="Bỏ trống = dùng mẫu chuẩn tự sinh"></div>' +
        '</form><label class="form-label mt-3">Chỉ số thuộc nhóm (thứ tự in theo thứ tự chọn)</label><div class="test-pick" style="max-height:260px;overflow:auto"><div class="d-flex flex-wrap column-gap-3">' +
        cat.tests.map(function (t) {
          return '<div class="form-check" style="min-width:220px"><input class="form-check-input" type="checkbox" id="pm-' + t.TestCode + '" value="' + t.TestCode + '"' + (members.indexOf(t.TestCode) > -1 ? ' checked' : '') + '>' +
            '<label class="form-check-label small" for="pm-' + t.TestCode + '">' + esc(t.TestName) + ' <span class="text-muted mono">' + t.TestCode + '</span></label></div>';
        }).join('') + '</div></div></div><div class="card-footer bg-white text-end"><button class="btn btn-primary" id="p-save">Lưu nhóm</button></div></div>';
      var order = members.slice();
      U.on(box, 'change', '.test-pick input', function (e, el) {
        if (el.checked) order.push(el.value); else order = order.filter(function (c) { return c !== el.value; });
      });
      U.$('#p-save', box).onclick = function () {
        var f = U.$('#p-form', box);
        if (!f.reportValidity()) return;
        var d = U.formData(f);
        d.Price = Number(String(d.Price).replace(/\D/g, '')) || 0;
        U.api('admin.catalog.savePanel', { panel: d, tests: order }).then(function (c) {
          App.setCatalog(c); sel = String(d.PanelCode).toUpperCase(); U.toast('Đã lưu nhóm ' + sel); render();
        }).catch(function () {});
      };
    }
    function editTest(t) {
      var isNew = !t;
      t = t || { ResultType: 'NUM', IsActive: true, SortOrder: cat.tests.length + 1, Price: 0, RefMinM: null, RefMaxM: null, RefMinF: null, RefMaxF: null };
      var v = function (x) { return x === null || x === undefined ? '' : x; };
      var m = U.modal('<div class="modal-header"><h5 class="modal-title">' + (isNew ? 'Thêm chỉ số' : 'Chỉ số ' + t.TestCode) + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><form id="t-form" class="row g-2">' +
        '<div class="col-4"><label class="form-label">Mã</label><input class="form-control mono" name="TestCode" required value="' + esc(v(t.TestCode)) + '"' + (isNew ? '' : ' readonly') + '></div>' +
        '<div class="col-8"><label class="form-label">Tên hiển thị</label><input class="form-control" name="TestName" required value="' + esc(v(t.TestName)) + '"></div>' +
        '<div class="col-4"><label class="form-label">Kiểu kết quả</label><select class="form-select" name="ResultType">' + [['NUM', 'Số (có ngưỡng)'], ['QUAL', 'Âm/Dương tính'], ['BLOOD', 'Nhóm máu'], ['TEXT', 'Văn bản']].map(function (o) {
          return '<option value="' + o[0] + '"' + (t.ResultType === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="col-4"><label class="form-label">Đơn vị</label><input class="form-control" name="Unit" value="' + esc(v(t.Unit)) + '"></div>' +
        '<div class="col-4"><label class="form-label">Đơn giá (đ)</label><input class="form-control tabular" name="Price" value="' + esc(v(t.Price)) + '"></div>' +
        '<div class="col-3"><label class="form-label">Nam – Min</label><input class="form-control" name="RefMinM" value="' + esc(v(t.RefMinM)) + '"></div>' +
        '<div class="col-3"><label class="form-label">Nam – Max</label><input class="form-control" name="RefMaxM" value="' + esc(v(t.RefMaxM)) + '"></div>' +
        '<div class="col-3"><label class="form-label">Nữ – Min</label><input class="form-control" name="RefMinF" value="' + esc(v(t.RefMinF)) + '"></div>' +
        '<div class="col-3"><label class="form-label">Nữ – Max</label><input class="form-control" name="RefMaxF" value="' + esc(v(t.RefMaxF)) + '"></div>' +
        '<div class="col-8"><label class="form-label">Khoảng tham chiếu hiển thị trên phiếu</label><input class="form-control" name="RefText" value="' + esc(v(t.RefText)) + '"></div>' +
        '<div class="col-2"><label class="form-label">Thứ tự</label><input class="form-control" name="SortOrder" value="' + esc(v(t.SortOrder)) + '"></div>' +
        '<div class="col-2 d-flex align-items-end"><div class="form-check"><input class="form-check-input" type="checkbox" name="IsActive" id="t-act"' + (t.IsActive ? ' checked' : '') + '><label class="form-check-label" for="t-act">Dùng</label></div></div>' +
        '</form><div class="small text-muted mt-2">Ngưỡng dùng để gắn cờ ↑/↓ tự động. Bỏ trống Nữ = dùng ngưỡng Nam.</div></div><div class="modal-footer"><button class="btn btn-primary" id="t-save">Lưu</button></div>', { size: 'lg' });
      m.body.querySelector('#t-save').onclick = function () {
        var f = m.body.querySelector('#t-form');
        if (!f.reportValidity()) return;
        var d = U.formData(f);
        d.Price = Number(String(d.Price).replace(/\D/g, '')) || 0;
        U.api('admin.catalog.saveTest', d).then(function (c) { App.setCatalog(c); m.hide(); U.toast('Đã lưu chỉ số'); render(); }).catch(function () {});
      };
    }
    body.addEventListener('click', function (e) {
      var ps = e.target.closest('[data-psel]');
      if (ps) { sel = ps.getAttribute('data-psel'); render(); return; }
      if (e.target.closest('#c-newp')) { U.$$('[data-psel]', body).forEach(function (x) { x.classList.remove('active'); }); renderPanel(true); return; }
      if (e.target.closest('#c-newt')) { editTest(null); return; }
      var te = e.target.closest('[data-tedit]');
      if (te) editTest(App.test(te.getAttribute('data-tedit')));
    });
    body.addEventListener('input', function (e) {
      if (e.target.id !== 'c-tq') return;
      var q = e.target.value.toLowerCase();
      U.$$('#c-tests tr', body).forEach(function (tr) { tr.style.display = tr.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none'; });
    });
    render();
  }

  function doctors(body) {
    var list = App.state.catalog.doctors;
    body.innerHTML = '<div class="card" style="max-width:720px"><div class="card-header justify-content-between"><span>Bác sĩ / nguồn chỉ định</span></div><div class="table-wrap"><table class="table table-sm"><thead><tr><th>Tên</th><th>Thứ tự</th><th>Dùng</th><th></th></tr></thead><tbody>' +
      list.map(function (d, i) {
        return '<tr data-i="' + i + '"><td><input class="form-control form-control-sm" value="' + esc(d.DoctorName) + '" data-f="name"></td><td style="width:90px"><input class="form-control form-control-sm" value="' + esc(d.SortOrder) + '" data-f="sort"></td>' +
          '<td><input class="form-check-input" type="checkbox" data-f="active"' + (d.IsActive ? ' checked' : '') + '></td><td><button class="btn btn-sm btn-light" data-dsave="' + i + '">Lưu</button></td></tr>';
      }).join('') + '<tr><td><input class="form-control form-control-sm" id="dn-name" placeholder="Thêm bác sĩ mới…"></td><td><input class="form-control form-control-sm" id="dn-sort" value="' + (list.length + 1) + '"></td><td></td><td><button class="btn btn-sm btn-primary" id="dn-add">Thêm</button></td></tr>' +
      '</tbody></table></div></div>';
    U.on(body, 'click', '[data-dsave]', function (e, el) {
      var i = +el.getAttribute('data-dsave'), tr = el.closest('tr');
      U.api('admin.doctors.save', { OriginalName: list[i].DoctorName, DoctorName: tr.querySelector('[data-f=name]').value, SortOrder: tr.querySelector('[data-f=sort]').value, IsActive: tr.querySelector('[data-f=active]').checked })
        .then(function (c) { App.setCatalog(c); U.toast('Đã lưu'); doctors(body); }).catch(function () {});
    });
    U.$('#dn-add', body).onclick = function () {
      var n = U.$('#dn-name', body).value.trim();
      if (!n) return;
      U.api('admin.doctors.save', { DoctorName: n, SortOrder: U.$('#dn-sort', body).value, IsActive: true }).then(function (c) { App.setCatalog(c); doctors(body); }).catch(function () {});
    };
  }

  function years(body) {
    U.api('admin.years.list').then(function (list) {
      body.innerHTML = '<div class="row g-3"><div class="col-lg-7"><div class="card"><div class="card-header">Google Sheet dữ liệu theo năm</div><div class="table-wrap"><table class="table"><thead><tr><th>Năm</th><th>Spreadsheet ID</th><th>Chế độ</th><th>Ghi chú</th><th></th></tr></thead><tbody>' +
        list.map(function (y) {
          return '<tr><td class="fw-bold">' + y.Year + '</td><td class="mono small"><a href="https://docs.google.com/spreadsheets/d/' + esc(y.SpreadsheetId) + '" target="_blank" rel="noopener">' + esc(String(y.SpreadsheetId).substring(0, 18)) + '…</a></td>' +
            '<td>' + (y.Mode === 'RO' ? '<span class="st st-UNPAID">Chỉ đọc</span>' : '<span class="st st-COMPLETED">Đọc/Ghi</span>') + '</td><td class="small">' + esc(y.Note || '') + '</td>' +
            '<td><button class="btn btn-sm btn-light" data-yedit="' + y.Year + '"><i class="bi bi-pencil"></i></button></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="alert alert-light border small mt-3 mb-0"><b>Cơ chế định tuyến:</b> Mã phiếu <span class="kbd">XN-YYMMDD-NNN</span> → năm 20YY → Spreadsheet tương ứng. Tra cứu/thống kê theo khoảng ngày sẽ tự gộp các năm liên quan. ' +
        'Năm cũ nên đặt <b>Chỉ đọc</b> để khóa sửa dữ liệu. Hồ sơ bệnh nhân dùng chung mọi năm.</div></div>' +
        '<div class="col-lg-5"><div class="card"><div class="card-header" id="y-title">Thêm / cập nhật kết nối</div><div class="card-body"><form id="y-form" class="row g-2">' +
        '<div class="col-4"><label class="form-label">Năm</label><input class="form-control" name="Year" required inputmode="numeric" value="' + (new Date().getFullYear() + 1) + '"></div>' +
        '<div class="col-8"><label class="form-label">Chế độ</label><select class="form-select" name="Mode"><option value="RW">Đọc/Ghi</option><option value="RO">Chỉ đọc (khóa sổ)</option></select></div>' +
        '<div class="col-12"><label class="form-label">Link hoặc ID Google Sheet</label><input class="form-control mono" name="SpreadsheetId" required placeholder="https://docs.google.com/spreadsheets/d/…"></div>' +
        '<div class="col-12"><label class="form-label">Ghi chú</label><input class="form-control" name="Note"></div></form>' +
        '<div id="y-test" class="small mt-2"></div></div><div class="card-footer bg-white d-flex gap-2 justify-content-end"><button class="btn btn-light" id="y-check"><i class="bi bi-plug"></i> Kiểm tra kết nối</button><button class="btn btn-primary" id="y-save">Lưu</button></div></div>' +
        '<div class="small text-muted mt-2">Chia sẻ quyền <b>Editor</b> của Sheet mới cho tài khoản Google đã deploy Web App. Khi lưu ở chế độ Đọc/Ghi, hệ thống tự tạo các bảng Orders, OrderPanels, Results, AuditLog.</div></div></div>';
      var form = U.$('#y-form', body);
      U.on(body, 'click', '[data-yedit]', function (e, el) {
        var y = list.filter(function (x) { return String(x.Year) === el.getAttribute('data-yedit'); })[0];
        form.Year.value = y.Year; form.Mode.value = y.Mode; form.SpreadsheetId.value = y.SpreadsheetId; form.Note.value = y.Note || '';
        U.$('#y-title', body).textContent = 'Cập nhật năm ' + y.Year;
      });
      U.$('#y-check', body).onclick = function () {
        U.api('admin.years.test', { SpreadsheetId: form.SpreadsheetId.value }).then(function (r) {
          U.$('#y-test', body).innerHTML = r.ok ? '<div class="alert alert-success py-2 mb-0"><i class="bi bi-check-circle"></i> Kết nối OK: <b>' + esc(r.name) + '</b>' +
            (r.missing.length ? '<br>Bảng sẽ được tạo: ' + esc(r.missing.join(', ')) : '<br>Đủ bảng dữ liệu.') + '</div>' : '<div class="alert alert-danger py-2 mb-0">' + esc(r.error) + '</div>';
        }).catch(function () {});
      };
      U.$('#y-save', body).onclick = function () {
        if (!form.reportValidity()) return;
        U.api('admin.years.save', U.formData(form)).then(function () { U.toast('Đã lưu kết nối năm ' + form.Year.value); years(body); }).catch(function () {});
      };
    }).catch(function () {});
  }

  function system(body) {
    body.innerHTML = '<div class="row g-3"><div class="col-md-6"><div class="card"><div class="card-body"><h6>Bộ nhớ đệm (cache)</h6><p class="small text-muted">Danh mục, cấu hình, vai trò và kết nối năm được cache 6 giờ để tăng tốc. Xóa cache nếu bạn sửa trực tiếp trên Google Sheet.</p>' +
      '<button class="btn btn-outline-primary" id="sy-cache"><i class="bi bi-arrow-repeat"></i> Xóa cache & tải lại danh mục</button></div></div></div>' +
      '<div class="col-md-6"><div class="card"><div class="card-body"><h6>Thông tin</h6><div class="small">Phiên bản: <b>' + esc((App.state.settings || {}).APP_VERSION || '1.0.0') + '</b><br>Chế độ: <b>' + (Api.isDemo ? 'DEMO (dữ liệu trong trình duyệt)' : 'Google Apps Script') + '</b><br>' +
      'Kết nối năm: ' + App.state.years.map(function (y) { return y.Year + (y.Mode === 'RO' ? ' (RO)' : ''); }).join(', ') + '</div>' +
      (Api.isDemo ? '<button class="btn btn-outline-danger mt-3" id="sy-reset"><i class="bi bi-trash"></i> Xóa dữ liệu DEMO & tạo lại</button>' : '') + '</div></div></div></div>';
    U.$('#sy-cache', body).onclick = function () {
      U.api('admin.cache.clear').then(function () { return U.api('catalog.get'); }).then(function (c) { App.setCatalog(c); U.toast('Đã làm mới'); }).catch(function () {});
    };
    var r = U.$('#sy-reset', body);
    if (r) r.onclick = function () { U.confirm('Xóa dữ liệu DEMO', 'Toàn bộ dữ liệu demo trong trình duyệt sẽ bị xóa và tạo lại.', 'Xóa', true).then(function (ok) { if (ok) Api.resetDemo(); }); };
  }
})(window.App);
