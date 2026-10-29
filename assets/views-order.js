/**
 * views-order.js – Tạo phiếu, Tra cứu, Chi tiết phiếu (nhập kết quả, in), Hồ sơ BN, Lịch sử chỉ số.
 */
(function (App) {
  'use strict';
  var U = App.U, esc = U.esc;

  /* ================================================================ SHARED: patient form */
  function patientFormHtml(p) {
    p = p || {};
    var provinces = App.lookup('PROVINCE');
    var pv = p.Province || provinces[0] || '';
    return '<form id="pt-form" class="row g-2">' +
      '<input type="hidden" name="PatientID" value="' + esc(p.PatientID || '') + '">' +
      '<div class="col-12"><label class="form-label">Họ và tên *</label><input class="form-control" name="FullName" required value="' + esc(p.FullName || '') + '" style="text-transform:uppercase"></div>' +
      '<div class="col-6 col-md-4"><label class="form-label">Giới tính *</label><select class="form-select" name="Gender">' +
        ['Nam', 'Nữ'].map(function (g) { return '<option' + (p.Gender === g ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></div>' +
      '<div class="col-6 col-md-4"><label class="form-label">Năm sinh</label><input class="form-control" name="BirthYear" inputmode="numeric" maxlength="4" value="' + esc(p.BirthYear || '') + '" placeholder="vd 1980"></div>' +
      '<div class="col-6 col-md-4"><label class="form-label">hoặc Tuổi</label><input class="form-control" name="Age" inputmode="numeric" maxlength="3"></div>' +
      '<div class="col-12 col-md-6"><label class="form-label">Số điện thoại</label><input class="form-control" name="Phone" inputmode="tel" value="' + esc(p.Phone || '') + '"></div>' +
      '<div class="col-12 col-md-6"><label class="form-label">Tỉnh / TP</label><input class="form-control" name="Province" list="dl-province" value="' + esc(pv) + '" autocomplete="off">' +
        '<datalist id="dl-province">' + provinces.map(function (v) { return '<option value="' + esc(v) + '">'; }).join('') + '</datalist></div>' +
      '<div class="col-12 col-md-6"><label class="form-label">Phường / Xã</label><input class="form-control" name="Ward" list="dl-ward" value="' + esc(p.Ward || '') + '" placeholder="Gõ để chọn…" autocomplete="off">' +
        '<datalist id="dl-ward">' + wardOptions(pv) + '</datalist></div>' +
      '<div class="col-12 col-md-6"><label class="form-label">Địa chỉ (số nhà, đường, thôn…)</label><input class="form-control" name="Address" value="' + esc(p.Address || '') + '"></div>' +
      '</form>';
  }
  function wardOptions(province) {
    return ((App.state.catalog.wards || {})[province] || []).map(function (w) { return '<option value="' + esc(w) + '">'; }).join('');
  }
  /** Đổi tỉnh → nạp lại gợi ý phường/xã. Gọi 1 lần cho container chứa form. */
  function bindPatientForm(root) {
    root.addEventListener('input', function (e) {
      if (e.target.name !== 'Province') return;
      var dl = root.querySelector('#dl-ward');
      if (dl) dl.innerHTML = wardOptions(e.target.value.trim());
    });
  }
  App.bindPatientForm = bindPatientForm;

  function patientLine(p) {
    var age = p.BirthYear ? (new Date().getFullYear() - p.BirthYear) + ' tuổi' : '';
    return '<div class="d-flex justify-content-between gap-2"><div><div class="fw-semibold">' + esc(p.FullName) + '</div>' +
      '<div class="small text-muted">' + esc([p.Gender, age, p.BirthYear ? 'SN ' + p.BirthYear : ''].filter(String).join(' · ')) + '</div>' +
      '<div class="small text-muted">' + esc([p.Address, p.Ward, p.Province].filter(String).join(', ')) + '</div></div>' +
      '<div class="text-end"><div class="mono small">' + esc(p.PatientID) + '</div><div class="small"><i class="bi bi-telephone"></i> ' + esc(p.Phone || '—') + '</div></div></div>';
  }

  /* ================================================================ SHARED: result inputs */
  function resultInput(t, value, gender, disabled, attrs) {
    var f = App.flag(t, value, gender);
    var cls = 'form-control form-control-sm res-input' + (f ? ' is-' + f : '');
    var dis = disabled ? ' disabled' : '';
    attrs = attrs || '';
    if (t.ResultType === 'QUAL' || t.ResultType === 'BLOOD') {
      var opts = App.lookup(t.ResultType === 'QUAL' ? 'QUAL' : 'BLOOD');
      var known = !value || opts.indexOf(value) > -1;
      return '<select class="form-select form-select-sm res-input' + (f ? ' is-' + f : '') + '" data-test="' + t.TestCode + '"' + dis + ' ' + attrs + '><option value=""></option>' +
        opts.map(function (o) { return '<option' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') +
        (known ? '' : '<option selected>' + esc(value) + '</option>') + '</select>';
    }
    var wide = t.ResultType === 'TEXT' ? ' style="max-width:none"' : '';
    if (App.Calc.is(t.TestCode)) {
      return '<input class="' + cls + ' res-calc" data-test="' + t.TestCode + '" value="' + esc(value || '') + '" readonly tabindex="-1" placeholder="Tự tính" title="Tự tính: ' + esc(App.Calc.label(t.TestCode)) + '">';
    }
    return '<input class="' + cls + '" data-test="' + t.TestCode + '" value="' + esc(value || '') + '"' + dis + wide +
      (t.ResultType === 'NUM' ? ' inputmode="decimal"' : '') + ' ' + attrs + '>';
  }

  function resultTableHtml(panelCode, testCodes, resMap, gender, disabled) {
    var tests = App.testsOfPanel(panelCode).filter(function (t) { return !testCodes || !testCodes.length || testCodes.indexOf(t.TestCode) > -1; });
    if (!tests.length) return U.empty('Nhóm chưa có chỉ số');
    return '<div class="table-wrap"><table class="table table-sm res-table" data-panel="' + panelCode + '"><thead><tr><th style="width:36px">#</th><th>Chỉ số</th><th>Kết quả</th><th>Đơn vị</th><th>Khoảng tham chiếu</th><th></th></tr></thead><tbody>' +
      tests.map(function (t, i) {
        var r = resMap[t.TestCode] || {};
        var ref = App.refFor(t, gender).text;
        var f = App.flag(t, r.Value, gender) || r.Flag || '';
        return '<tr><td class="text-muted">' + (i + 1) + '</td><td><div class="fw-medium">' + esc(t.TestName) + (App.Calc.is(t.TestCode) ? ' <span class="badge text-bg-light" title="' + esc(App.Calc.label(t.TestCode)) + '">ƒ tự tính</span>' : '') + '</div><div class="small text-muted mono">' + t.TestCode + '</div></td>' +
          '<td>' + resultInput(t, r.Value, gender, disabled) + '</td><td class="small text-muted">' + esc(t.Unit || '') + '</td>' +
          '<td class="small">' + esc(ref) + '</td><td class="small flag-cell flag-' + f + '">' + U.flagLabel(f) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /** Live flag colouring + Enter → next input. */
  /** getCtx() → { gender, age }. Chỉ số tự tính (LDL, eGFR) cập nhật ngay khi nhập chỉ số trung gian. */
  function bindResultInputs(root, getCtx) {
    var ctxOf = function () { var c = getCtx(); return typeof c === 'string' ? { gender: c } : c; };
    var onEdit = function (e, el) { updateFlag(el, ctxOf().gender); recalcCalc(root, ctxOf()); };
    U.on(root, 'input', '.res-input', onEdit);
    U.on(root, 'change', '.res-input', onEdit);
    U.on(root, 'keydown', 'input.res-input', function (e, el) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var all = U.$$('.res-input:not([disabled]):not([readonly])', root);
      var nx = all[all.indexOf(el) + 1];
      if (nx) nx.focus();
    });
  }
  function recalcCalc(root, ctx) {
    var calcs = U.$$('.res-calc', root);
    if (!calcs.length) return;
    var vals = {};
    U.$$('.res-input:not(.res-calc)', root).forEach(function (el) { var k = el.getAttribute('data-test'); if (el.value.trim() !== '' || vals[k] === undefined) vals[k] = el.value.trim(); });
    calcs.forEach(function (el) {
      var v = App.Calc.compute(el.getAttribute('data-test'), vals, ctx);
      if (el.value !== v) { el.value = v; updateFlag(el, ctx.gender); }
    });
  }
  App.recalcCalc = recalcCalc;
  function updateFlag(el, gender) {
    var t = App.test(el.getAttribute('data-test'));
    var f = App.flag(t, el.value, gender);
    el.classList.remove('is-H', 'is-L', 'is-N', 'is-POS');
    if (f) el.classList.add('is-' + f);
    var cell = el.closest('tr') && el.closest('tr').querySelector('.flag-cell');
    if (cell) { cell.className = 'small flag-cell flag-' + f; cell.textContent = U.flagLabel(f); }
  }
  function collectResults(table) {
    return U.$$('.res-input:not(.res-calc)', table).map(function (el) { return { testCode: el.getAttribute('data-test'), value: el.value.trim() }; });
  }

  /* ================================================================ VIEW: ORDER NEW */
  App.views['order-new'] = function (view, params) {
    var st = { patient: null, panels: {}, results: false, follow: 0 };
    var canPrice = App.can('order.price');
    var canResult = App.can('result.enter');
    var presets = String(App.setting('FOLLOWUP_PRESETS', '7,14,30,90')).split(',').map(Number).filter(Boolean);

    view.innerHTML =
      '<div class="row g-3">' +
      '<div class="col-xl-5"><div class="card pt-sticky"><div class="card-header"><span class="step">1</span> Bệnh nhân</div><div class="card-body" id="pt-box"></div></div></div>' +
      '<div class="col-xl-7"><div class="card"><div class="card-header"><span class="step">2</span> Phiếu yêu cầu xét nghiệm</div><div class="card-body">' +
        '<div class="row g-2 mb-3">' +
          '<div class="col-sm-4"><label class="form-label">Ngày khám</label><input type="date" class="form-control" id="o-date" value="' + U.today() + '"></div>' +
          '<div class="col-sm-8"><label class="form-label">Bác sĩ chỉ định</label><input class="form-control" id="o-doctor" list="dl-doctor" value="' + esc(App.setting('DEFAULT_DOCTOR', '')) + '">' +
            '<datalist id="dl-doctor">' + App.state.catalog.doctors.filter(function (d) { return d.IsActive; }).map(function (d) { return '<option value="' + esc(d.DoctorName) + '">'; }).join('') + '</datalist></div>' +
          '<div class="col-12"><label class="form-label">Người phụ trách <span class="text-muted">(mặc định là bạn – bấm để chọn thêm / đổi người khác; không gồm Quản trị hệ thống)</span></label><div id="o-assign"></div></div>' +
        '</div>' +
        '<label class="form-label">Nhóm xét nghiệm <span class="text-muted">(chọn nhiều)</span></label>' +
        '<div class="panel-grid mb-2" id="panel-grid">' + App.activePanels().map(function (p) {
          return '<div class="panel-tile" data-panel="' + p.PanelCode + '" tabindex="0" role="checkbox" aria-checked="false"><div class="code">' + p.PanelCode + '</div><div class="name">' + esc(p.PanelName) + '</div>' +
            '<div class="price">' + (p.PricingMode === 'PANEL' ? U.money(p.Price) : 'Theo chỉ số') + '</div></div>';
        }).join('') + '</div>' +
        '<div id="test-picks"></div>' +
        (canResult ? '<div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="o-withres"><label class="form-check-label" for="o-withres">Nhập kết quả ngay</label></div><div id="res-box"></div>' : '') +
        '<div class="row g-2 mt-1">' +
          '<div class="col-md-6"><label class="form-label">Hẹn tái khám (số ngày)</label><div class="input-group"><input class="form-control" id="o-follow" inputmode="numeric" placeholder="0 = không hẹn">' +
            '<span class="input-group-text" id="o-follow-date">—</span></div><div class="mt-1 d-flex flex-wrap gap-1">' +
            presets.map(function (n) { return '<button type="button" class="btn btn-sm btn-outline-secondary" data-follow="' + n + '">' + n + ' ngày</button>'; }).join('') +
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-follow="0">Không</button></div></div>' +
          '<div class="col-md-6"><label class="form-label">Ghi chú</label><textarea class="form-control" id="o-note" rows="2"></textarea></div>' +
        '</div>' +
        '<div class="sum-box mt-3"><div class="row g-2 align-items-end">' +
          '<div class="col-sm-4"><label class="form-label">Chiết khấu (đ)</label><input class="form-control tabular" id="o-discount" inputmode="numeric" value="0"></div>' +
          '<div class="col-sm-4"><label class="form-label">Thanh toán</label><select class="form-select" id="o-pay"><option value="PAID">Đã thu</option><option value="UNPAID">Chưa thu</option></select></div>' +
          '<div class="col-sm-4 text-sm-end"><div class="small text-muted">Tổng <span id="o-gross" class="tabular">0 đ</span></div><div class="total tabular" id="o-net">0 đ</div></div>' +
        '</div></div>' +
      '</div></div>' +
      '<div class="sticky-actions d-flex gap-2 justify-content-end"><button class="btn btn-light" id="o-reset">Làm mới</button>' +
        (App.can('print') ? '<button class="btn btn-outline-primary" id="o-save-print"><i class="bi bi-printer"></i> Lưu & In</button>' : '') +
        '<button class="btn btn-primary px-4" id="o-save"><i class="bi bi-check2-circle"></i> Lưu phiếu</button></div>' +
      '</div></div>';

    var assignPicker = App.assigneePicker(U.$('#o-assign', view), [App.state.user.username]);   // mặc định: người đang đăng nhập

    /* ---------- Patient box */
    var ptBox = U.$('#pt-box', view);
    function renderPatientSearch(results, q) {
      ptBox.innerHTML =
        '<div class="input-group mb-2"><span class="input-group-text"><i class="bi bi-search"></i></span>' +
        '<input class="form-control" id="pt-q" placeholder="SĐT hoặc họ tên bệnh nhân…" value="' + esc(q || '') + '" autocomplete="off">' +
        '<button class="btn btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#pt-adv" title="Tìm nâng cao"><i class="bi bi-sliders"></i></button></div>' +
        '<div class="collapse" id="pt-adv"><div class="row g-2 mb-2"><div class="col-6"><input class="form-control form-control-sm" id="pt-by" placeholder="Năm sinh"></div>' +
        '<div class="col-6"><input class="form-control form-control-sm" id="pt-ward" placeholder="Phường/Xã, địa chỉ"></div></div></div>' +
        '<div id="pt-results" class="d-grid gap-2 mb-3">' + (results || '') + '</div>' +
        '<button class="btn btn-outline-primary w-100" id="pt-new"><i class="bi bi-person-plus"></i> Bệnh nhân mới</button>';
      var qi = U.$('#pt-q', ptBox);
      qi.focus();
      // Tìm tức thì trên danh bạ BN đã tải về trình duyệt (App.Patients) – không gọi server mỗi lần gõ
      var doSearch = U.debounce(function () {
        var box = U.$('#pt-results', ptBox);
        if (!box || !U.$('#pt-by', ptBox)) return;            // đã chọn BN / đổi màn hình
        var q2 = qi.value.trim(), by = U.$('#pt-by', ptBox).value.trim(), ward = U.$('#pt-ward', ptBox).value.trim();
        if (q2.length < 2 && !by && !ward) { box.innerHTML = ''; return; }
        if (!App.Patients.ready()) box.innerHTML = '<div class="small text-muted text-center py-2"><span class="spinner-border spinner-border-sm"></span> Đang tải danh bạ bệnh nhân…</div>';
        App.Patients.load().then(function () {
          if (!U.$('#pt-results', ptBox) || !U.$('#pt-by', ptBox)) return;
          var d = App.Patients.search(qi.value.trim(), U.$('#pt-by', ptBox).value.trim(), U.$('#pt-ward', ptBox).value.trim(), 30);
          box.innerHTML = d.rows.length ? (d.total > d.rows.length ? '<div class="small text-muted">Hiển thị ' + d.rows.length + '/' + d.total + ' kết quả</div>' : '') +
            d.rows.map(function (p) { return '<div class="patient-item" data-pid="' + esc(p.PatientID) + '">' + patientLine(p) + '</div>'; }).join('')
            : '<div class="text-muted small text-center py-2">Không tìm thấy. Bấm "Bệnh nhân mới" để tạo.</div>';
          st._rows = d.rows;
        }).catch(function () { box.innerHTML = '<div class="text-danger small text-center py-2">Không tải được danh bạ bệnh nhân.</div>'; });
      }, 120);
      ['#pt-q', '#pt-by', '#pt-ward'].forEach(function (s) { U.$(s, ptBox).addEventListener('input', doSearch); });
      if (q) doSearch();
    }
    function renderPatientSelected() {
      var p = st.patient;
      ptBox.innerHTML = '<div class="patient-selected">' + patientLine(p) + '</div><div class="d-flex gap-2 mt-2">' +
        '<button class="btn btn-sm btn-light" id="pt-change"><i class="bi bi-arrow-left-right"></i> Đổi bệnh nhân</button>' +
        (App.can('patient.edit') ? '<button class="btn btn-sm btn-light" id="pt-edit"><i class="bi bi-pencil"></i> Sửa thông tin</button>' : '') +
        (App.can('history.view') ? '<a class="btn btn-sm btn-light" href="#/patient/' + esc(p.PatientID) + '" target="_blank"><i class="bi bi-clock-history"></i> Lịch sử</a>' : '') + '</div>' +
        '<div id="pt-last" class="mt-3"></div>';
      U.api('patient.get', { patientId: p.PatientID }, { silent: true }).then(function (full) {
        var last = full.orders.slice(0, 5);
        U.$('#pt-last', ptBox).innerHTML = last.length ? '<div class="small text-muted mb-1">Lần khám gần đây</div><div class="list-group list-group-flush small">' +
          last.map(function (o) { return '<a class="list-group-item list-group-item-action px-0 d-flex justify-content-between" href="#/order/' + o.OrderID + '"><span>' + U.vnDate(o.OrderDate) + ' · ' + U.chips(o.PanelCodes) + '</span>' + U.badge(o.Status) + '</a>'; }).join('') + '</div>'
          : '<div class="small text-muted">Bệnh nhân mới – chưa có lịch sử khám.</div>';
      }).catch(function () {});
      refreshResults();
    }
    function renderPatientForm(p, dupMatches) {
      ptBox.innerHTML = (dupMatches ? '<div class="alert alert-warning small mb-2"><b>Có thể trùng bệnh nhân.</b> Chọn hồ sơ có sẵn hoặc bấm "Vẫn tạo mới".</div>' +
        '<div class="d-grid gap-2 mb-3">' + dupMatches.map(function (m) { return '<div class="patient-item" data-pid="' + esc(m.PatientID) + '">' + patientLine(m) + '</div>'; }).join('') + '</div>' : '') +
        patientFormHtml(p) + '<div class="d-flex gap-2 mt-3"><button class="btn btn-light" id="pt-cancel">Hủy</button>' +
        '<button class="btn btn-primary ms-auto" id="pt-save">' + (dupMatches ? 'Vẫn tạo mới' : (p && p.PatientID ? 'Cập nhật' : 'Lưu bệnh nhân')) + '</button></div>';
      st._dupForce = !!dupMatches;
      st._rows = dupMatches || st._rows;
      U.$('[name=FullName]', ptBox).focus();
      if (!ptBox._pfBound) { bindPatientForm(ptBox); ptBox._pfBound = true; }
    }
    U.on(ptBox, 'click', '.patient-item', function (e, el) {
      var pid = el.getAttribute('data-pid');
      st.patient = (st._rows || []).filter(function (p) { return p.PatientID === pid; })[0];
      renderPatientSelected();
    });
    U.on(ptBox, 'click', '#pt-new', function () {
      var q = (U.$('#pt-q', ptBox) || {}).value || '';
      var pre = /^[\d\s.+-]{3,}$/.test(q) ? { Phone: q } : { FullName: q };
      renderPatientForm(pre);
    });
    U.on(ptBox, 'click', '#pt-change', function () { st.patient = null; renderPatientSearch(); refreshResults(); });
    U.on(ptBox, 'click', '#pt-edit', function () { renderPatientForm(st.patient); });
    U.on(ptBox, 'click', '#pt-cancel', function () { if (st.patient) renderPatientSelected(); else renderPatientSearch(); });
    U.on(ptBox, 'click', '#pt-save', function () {
      var form = U.$('#pt-form', ptBox);
      if (!form.reportValidity()) return;
      var d = U.formData(form);
      if (st._dupForce) d.force = true;
      U.api('patient.save', d).then(function (r) {
        if (r.duplicate) { renderPatientForm(d, r.matches); return; }
        st.patient = r.patient;
        App.Patients.upsert(r.patient);
        U.toast(d.PatientID ? 'Đã cập nhật bệnh nhân' : 'Đã tạo bệnh nhân ' + r.patient.PatientID);
        renderPatientSelected();
      }).catch(function () {});
    });

    /* ---------- Panels & tests */
    var grid = U.$('#panel-grid', view);
    function togglePanel(code) {
      if (st.panels[code]) delete st.panels[code];
      else st.panels[code] = { tests: App.testsOfPanel(code).map(function (t) { return t.TestCode; }) };
      U.$$('.panel-tile', grid).forEach(function (el) {
        var on = !!st.panels[el.getAttribute('data-panel')];
        el.classList.toggle('on', on); el.setAttribute('aria-checked', on);
      });
      renderTestPicks(); refreshResults(); recalc();
    }
    U.on(grid, 'click', '.panel-tile', function (e, el) { togglePanel(el.getAttribute('data-panel')); });
    U.on(grid, 'keydown', '.panel-tile', function (e, el) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePanel(el.getAttribute('data-panel')); } });

    var pricing = { amounts: {}, dup: {} };
    function selection() { var o = {}; Object.keys(st.panels).forEach(function (c) { o[c] = st.panels[c].tests; }); return o; }
    /** Chọn chỉ số tự tính → tự chọn chỉ số trung gian; bỏ chỉ số trung gian → bỏ chỉ số tự tính phụ thuộc. */
    function enforceDeps(code, changed, checked) {
      var orderOf = function (pc) { var all = App.testsOfPanel(pc).map(function (t) { return t.TestCode; }); st.panels[pc].tests = all.filter(function (c) { return st.panels[pc].tests.indexOf(c) > -1; }); };
      var inOrder = function (t) { return Object.keys(st.panels).some(function (pc) { return st.panels[pc].tests.indexOf(t) > -1; }); };
      var msgs = [];
      if (checked && App.Calc.is(changed)) {
        App.Calc.deps(changed).forEach(function (d) {
          if (inOrder(d)) return;
          var target = App.testsOfPanel(code).some(function (t) { return t.TestCode === d; }) ? code
            : Object.keys(st.panels).filter(function (pc) { return App.testsOfPanel(pc).some(function (t) { return t.TestCode === d; }); })[0];
          if (target) { st.panels[target].tests.push(d); orderOf(target); msgs.push(App.test(d).TestName); }
        });
        if (msgs.length) U.toast(App.test(changed).TestName + ' tự tính → đã chọn thêm: ' + msgs.join(', '));
      }
      if (!checked && !inOrder(changed)) {
        Object.keys(st.panels).forEach(function (pc) {
          App.Calc.dependents(changed, st.panels[pc].tests).forEach(function (c) {
            st.panels[pc].tests = st.panels[pc].tests.filter(function (x) { return x !== c; });
            msgs.push(App.test(c).TestName);
          });
        });
        if (msgs.length) U.toast('Bỏ ' + App.test(changed).TestName + ' → bỏ luôn chỉ số tự tính: ' + msgs.join(', '), 'warn');
      }
      orderOf(code);
    }
    function renderTestPicks() {
      pricing = App.priceLines(selection());
      var box = U.$('#test-picks', view);
      box.innerHTML = Object.keys(st.panels).map(function (code) {
        var p = App.panel(code);
        var tests = App.testsOfPanel(code);
        var sel = st.panels[code].tests;
        var dup = pricing.dup[code] || {};
        return '<div class="test-pick mb-2" data-panel="' + code + '"><div class="d-flex align-items-center mb-1"><b class="me-2">' + esc(p.PanelName) + '</b>' +
          '<span class="small text-muted">' + sel.length + '/' + tests.length + ' chỉ số</span><div class="ms-auto">' +
          '<button class="btn btn-link btn-sm p-0 me-2" data-all="' + code + '">Chọn hết</button><button class="btn btn-link btn-sm p-0" data-none="' + code + '">Bỏ hết</button></div></div>' +
          '<div class="d-flex flex-wrap column-gap-3">' + tests.map(function (t) {
            var id = 'tp-' + code + '-' + t.TestCode;
            return '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + id + '" data-p="' + code + '" data-t="' + t.TestCode + '"' + (sel.indexOf(t.TestCode) > -1 ? ' checked' : '') + '>' +
              '<label class="form-check-label small" for="' + id + '">' + esc(t.TestName) +
              (App.Calc.is(t.TestCode) ? ' <span class="badge text-bg-light" title="Tự tính: ' + esc(App.Calc.label(t.TestCode)) + '">ƒ</span>' : '') +
              (dup[t.TestCode] && sel.indexOf(t.TestCode) > -1 ? ' <span class="text-success" title="Chỉ số trùng – chỉ tính tiền 1 lần">đã tính ở ' + dup[t.TestCode] + '</span>'
                : (p.PricingMode === 'TEST' && t.Price ? ' <span class="text-muted">' + U.num(t.Price) + '</span>' : '')) + '</label></div>';
          }).join('') + '</div></div>';
      }).join('');
    }
    var picks = U.$('#test-picks', view);
    U.on(picks, 'change', 'input[data-t]', function (e, el) {
      var code = el.getAttribute('data-p');
      st.panels[code].tests = U.$$('input[data-p="' + code + '"]:checked', picks).map(function (x) { return x.getAttribute('data-t'); });
      enforceDeps(code, el.getAttribute('data-t'), el.checked);
      renderTestPicks(); refreshResults(); recalc();
    });
    U.on(picks, 'click', '[data-all],[data-none]', function (e, el) {
      var code = el.getAttribute('data-all') || el.getAttribute('data-none');
      st.panels[code].tests = el.hasAttribute('data-all') ? App.testsOfPanel(code).map(function (t) { return t.TestCode; }) : [];
      renderTestPicks(); refreshResults(); recalc();
    });

    /* ---------- Inline results */
    function refreshResults() {
      var box = U.$('#res-box', view);
      if (!box) return;
      var on = U.$('#o-withres', view).checked;
      if (!on || !Object.keys(st.panels).length) { box.innerHTML = ''; return; }
      var keep = {};
      U.$$('.res-input', box).forEach(function (el) { keep[el.getAttribute('data-test')] = { Value: el.value }; });
      var g = st.patient ? st.patient.Gender : 'Nam';
      box.innerHTML = Object.keys(st.panels).map(function (code) {
        return '<div class="mb-3"><div class="fw-semibold mb-1">' + esc(App.panel(code).PanelName) + '</div>' + resultTableHtml(code, st.panels[code].tests, keep, g, false) + '</div>';
      }).join('');
    }
    if (canResult) {
      U.$('#o-withres', view).addEventListener('change', refreshResults);
      // Chỉ số có ở nhiều nhóm (vd ALT ∈ SH & GD): nhập 1 chỗ → các ô cùng chỉ số tự điền theo
      U.$('#res-box', view).addEventListener('input', function (e) {
        var el = e.target.closest('.res-input');
        if (!el) return;
        U.$$('#res-box .res-input[data-test="' + el.getAttribute('data-test') + '"]', view).forEach(function (o) {
          if (o !== el && !o.classList.contains('res-calc') && o.value !== el.value) { o.value = el.value; updateFlag(o, st.patient ? st.patient.Gender : 'Nam'); }
        });
      });
      bindResultInputs(U.$('#res-box', view), function () {
        var y = Number(String(U.$('#o-date', view).value).substring(0, 4)) || new Date().getFullYear();
        return { gender: st.patient ? st.patient.Gender : 'Nam', age: st.patient && st.patient.BirthYear ? y - st.patient.BirthYear : 0 };
      });
    }

    /* ---------- Money */
    function recalc() {
      var pr = App.priceLines(selection());
      var gross = Object.keys(st.panels).reduce(function (a, c) { return a + (pr.amounts[c] || 0); }, 0);
      var disc = Number(String(U.$('#o-discount', view).value).replace(/\D/g, '')) || 0;
      U.$('#o-gross', view).textContent = U.money(gross);
      U.$('#o-net', view).textContent = U.money(Math.max(0, gross - disc));
    }
    U.$('#o-discount', view).addEventListener('input', recalc);
    if (!canPrice && !App.can('order.create')) U.$('#o-discount', view).disabled = true;

    /* ---------- Follow-up */
    function setFollow(n) {
      U.$('#o-follow', view).value = n || '';
      var d = U.$('#o-date', view).value;
      U.$('#o-follow-date', view).textContent = n ? U.vnDate(U.addDays(d, n)) : '—';
    }
    U.on(view, 'click', '[data-follow]', function (e, el) { setFollow(Number(el.getAttribute('data-follow'))); });
    U.$('#o-follow', view).addEventListener('input', function () { setFollow(Number(this.value) || 0); });
    U.$('#o-date', view).addEventListener('change', function () { setFollow(Number(U.$('#o-follow', view).value) || 0); });

    /* ---------- Save */
    function save(andPrint) {
      if (!st.patient) { U.toast('Chưa chọn bệnh nhân', 'warn'); return; }
      var codes = Object.keys(st.panels);
      if (!codes.length) { U.toast('Chưa chọn nhóm xét nghiệm', 'warn'); return; }
      var empty = codes.filter(function (c) { return !st.panels[c].tests.length; });
      if (empty.length) { U.toast('Nhóm ' + empty.join(', ') + ' chưa chọn chỉ số nào', 'warn'); return; }
      var payload = {
        patientId: st.patient.PatientID, orderDate: U.$('#o-date', view).value, doctorName: U.$('#o-doctor', view).value, assignedTo: assignPicker.get(),
        panels: codes.map(function (c) { return { panelCode: c, tests: st.panels[c].tests }; }),
        discount: Number(String(U.$('#o-discount', view).value).replace(/\D/g, '')) || 0,
        paymentStatus: U.$('#o-pay', view).value, followUpDays: Number(U.$('#o-follow', view).value) || 0, note: U.$('#o-note', view).value
      };
      if (canResult && U.$('#o-withres', view).checked) {
        payload.results = [];
        U.$$('#res-box table[data-panel]', view).forEach(function (tb) {
          var pc = tb.getAttribute('data-panel');
          collectResults(tb).forEach(function (r) { if (r.value) payload.results.push({ panelCode: pc, testCode: r.testCode, value: r.value }); });
        });
      }
      var btns = U.$$('#o-save, #o-save-print', view);
      btns.forEach(function (b) { b.disabled = true; });
      U.api('order.create', payload).then(function (d) {
        U.toast('Đã lưu phiếu ' + d.order.OrderID);
        if (andPrint) App.quickPrint(d);
        App.go('order/' + d.order.OrderID);
      }).catch(function () {}).finally(function () { btns.forEach(function (b) { b.disabled = false; }); });
    }
    U.$('#o-save', view).onclick = function () { save(false); };
    if (U.$('#o-save-print', view)) U.$('#o-save-print', view).onclick = function () { save(true); };
    U.$('#o-reset', view).onclick = function () { App.go('order-new'); };

    // Preselect patient from route (#/order-new/BN-000123)
    if (params[0]) {
      U.api('patient.get', { patientId: params[0] }).then(function (p) { st.patient = p; renderPatientSelected(); }).catch(function () { renderPatientSearch(); });
    } else renderPatientSearch();
  };

  /* ================================================================ VIEW: ORDER SEARCH */
  App.views['order-search'] = function (view) {
    var saved = App._searchState || { q: '', from: U.addDays(U.today(), -30), to: U.today(), status: '', panelCode: '', doctor: '' };
    view.innerHTML =
      '<div class="card mb-3"><div class="card-body"><form id="s-form" class="row g-2 align-items-end">' +
        '<div class="col-lg-4"><label class="form-label">Từ khóa</label><input class="form-control" name="q" value="' + esc(saved.q) + '" placeholder="Mã phiếu XN-…, mã BN, họ tên, SĐT"></div>' +
        '<div class="col-6 col-lg-2"><label class="form-label">Từ ngày</label><input type="date" class="form-control" name="from" value="' + saved.from + '"></div>' +
        '<div class="col-6 col-lg-2"><label class="form-label">Đến ngày</label><input type="date" class="form-control" name="to" value="' + saved.to + '"></div>' +
        '<div class="col-6 col-lg-2"><label class="form-label">Trạng thái</label><select class="form-select" name="status"><option value="">Tất cả</option>' +
          ['REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(function (s) { return '<option value="' + s + '"' + (saved.status === s ? ' selected' : '') + '>' + U.statusLabel(s) + '</option>'; }).join('') + '</select></div>' +
        '<div class="col-6 col-lg-2"><label class="form-label">Nhóm XN</label><select class="form-select" name="panelCode"><option value="">Tất cả</option>' +
          App.state.catalog.panels.map(function (p) { return '<option value="' + p.PanelCode + '"' + (saved.panelCode === p.PanelCode ? ' selected' : '') + '>' + esc(p.PanelCode + ' – ' + p.PanelName) + '</option>'; }).join('') + '</select></div>' +
        '<div class="col-12 d-flex gap-2"><button class="btn btn-primary" type="submit"><i class="bi bi-search"></i> Tìm kiếm</button>' +
          '<button class="btn btn-light" type="button" data-range="0">Hôm nay</button><button class="btn btn-light" type="button" data-range="7">7 ngày</button><button class="btn btn-light" type="button" data-range="30">30 ngày</button>' +
          (App.can('order.create') ? '<a class="btn btn-outline-primary ms-auto" href="#/order-new"><i class="bi bi-plus-lg"></i> Phiếu mới</a>' : '') + '</div>' +
      '</form></div></div><div class="card"><div id="s-result">' + U.empty('Nhập điều kiện và bấm Tìm kiếm', 'bi-search') + '</div></div>';

    var form = U.$('#s-form', view);
    function run() {
      var d = U.formData(form);
      App._searchState = d;
      U.$('#s-result', view).innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
      Promise.all([U.api('order.search', d), App.Users.load().catch(function () { return []; })]).then(function (res) {
        var r = res[0];
        if (!r.rows.length) { U.$('#s-result', view).innerHTML = U.empty('Không có phiếu phù hợp'); return; }
        var money = r.rows[0].NetAmount !== null;
        U.$('#s-result', view).innerHTML = '<div class="card-header justify-content-between"><span>' + r.total + ' phiếu</span>' +
          (r.total > r.rows.length ? '<span class="small text-muted">Hiển thị ' + r.rows.length + ' phiếu mới nhất</span>' : '') + '</div>' +
          '<div class="table-wrap"><table class="table table-hover"><thead><tr><th>Mã phiếu</th><th>Ngày</th><th>Bệnh nhân</th><th>SĐT</th><th>Nhóm XN</th><th>BS chỉ định</th><th>Phụ trách</th>' +
          (money ? '<th class="text-end">Thành tiền</th>' : '') + '<th>Trạng thái</th></tr></thead><tbody>' +
          r.rows.map(function (o) {
            return '<tr data-id="' + o.OrderID + '"><td class="mono fw-semibold">' + o.OrderID + (o.LegacyCode ? '<div class="small text-muted">' + esc(o.LegacyCode) + '</div>' : '') + '</td><td>' + U.vnDate(o.OrderDate) + '</td>' +
              '<td><div class="fw-medium">' + esc(o.PatientName) + '</div><div class="small text-muted">' + esc([o.Gender, o.Age !== null ? o.Age + 't' : ''].filter(String).join(' · ')) + '</div></td>' +
              '<td>' + esc(o.Phone || '') + '</td><td>' + U.chips(o.PanelCodes) + '</td><td class="small">' + esc(o.DoctorName || '') + '</td><td class="small">' + esc(App.Users.names(o.AssignedTo)) + '</td>' +
              (money ? '<td class="text-end tabular">' + U.money(o.NetAmount) + '</td>' : '') + '<td>' + U.badge(o.Status) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }).catch(function () { U.$('#s-result', view).innerHTML = U.empty('Lỗi tải dữ liệu', 'bi-exclamation-triangle'); });
    }
    form.onsubmit = function (e) { e.preventDefault(); run(); };
    U.on(view, 'click', '[data-range]', function (e, el) {
      var n = Number(el.getAttribute('data-range'));
      form.to.value = U.today(); form.from.value = U.addDays(U.today(), -n); run();
    });
    U.on(view, 'click', 'tr[data-id]', function (e, el) { App.go('order/' + el.getAttribute('data-id')); });
    run();
  };

  /* ================================================================ VIEW: ORDER DETAIL */
  App.views['order'] = function (view, params) {
    var orderId = params[0];
    var data = null;
    var activeTab = params[1] || null;

    function load() {
      return U.api('order.get', { orderId: orderId }).then(function (d) { data = d; render(); })
        .catch(function (e) { view.innerHTML = U.empty(e.message, 'bi-exclamation-triangle'); });
    }

    function render() {
      var o = data.order;
      var cancelled = o.Status === 'CANCELLED';
      var money = o.NetAmount !== null;
      var resMap = {};
      data.results.forEach(function (r) { (resMap[r.PanelCode] = resMap[r.PanelCode] || {})[r.TestCode] = r; });
      var canEnter = App.can('result.enter') && !cancelled;
      if (!activeTab) activeTab = data.panels.length ? 'p-' + data.panels[0].PanelCode : 'history';

      view.innerHTML =
        '<div class="d-flex align-items-center gap-2 mb-3 flex-wrap"><a href="#/order-search" class="btn btn-sm btn-light"><i class="bi bi-arrow-left"></i></a>' +
          '<h4 class="mb-0 mono fw-bold">' + o.OrderID + '</h4>' + U.badge(o.Status) +
          (money ? (App.can('order.edit') && !cancelled ? '<button class="btn p-0 border-0" id="pay-toggle" title="Bấm để đổi trạng thái thanh toán">' + U.badge(o.PaymentStatus) + '</button>' : U.badge(o.PaymentStatus)) : '') +
          '<div class="ms-auto d-flex gap-2 flex-wrap">' +
          (App.can('print') && !cancelled ? '<div class="btn-group"><button class="btn btn-primary" id="d-qprint"><i class="bi bi-printer"></i> In nhanh</button>' +
            '<button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-label="Thêm"></button><ul class="dropdown-menu dropdown-menu-end">' +
            '<li><button class="dropdown-item" data-export="pdf"><i class="bi bi-filetype-pdf"></i> Tải PDF</button></li><li><button class="dropdown-item" data-export="docx"><i class="bi bi-filetype-docx"></i> Tải Word (.docx)</button></li></ul></div>' : '') +
          (App.can('order.edit') && !cancelled ? '<button class="btn btn-outline-secondary" id="d-edit"><i class="bi bi-pencil-square"></i> Sửa phiếu</button>' : '') +
          (App.can('order.cancel') && !cancelled ? '<button class="btn btn-outline-danger" id="d-cancel"><i class="bi bi-x-circle"></i> Hủy</button>' : '') +
          '</div></div>' +
        '<div class="row g-3 mb-3">' +
          '<div class="col-lg-7"><div class="card h-100"><div class="card-body"><div class="d-flex justify-content-between"><div>' +
            '<div class="small text-muted">Bệnh nhân</div><a class="fs-5 fw-semibold text-decoration-none" href="#/patient/' + esc(o.PatientID) + '">' + esc(o.PatientName) + '</a>' +
            '<div class="text-muted">' + esc([o.Gender, o.Age !== null ? o.Age + ' tuổi' : '', o.Phone].filter(String).join(' · ')) + '</div>' +
            '<div class="small text-muted">' + esc(o.Address || '') + '</div></div><div class="text-end mono small">' + esc(o.PatientID) + '</div></div>' +
            '<hr class="my-2"><div class="row small g-2"><div class="col-sm-4"><div class="text-muted">Ngày khám</div><b>' + U.vnDate(o.OrderDate) + '</b></div>' +
            '<div class="col-sm-4"><div class="text-muted">BS chỉ định</div><b>' + esc(o.DoctorName || '—') + '</b></div>' +
            '<div class="col-sm-4"><div class="text-muted">Tái khám</div><b>' + (o.FollowUpDate ? U.vnDate(o.FollowUpDate) : '—') + '</b> ' + (o.FollowUpStatus && o.FollowUpStatus !== 'PENDING' ? U.badge(o.FollowUpStatus) : '') + '</div>' +
            '<div class="col-12"><div class="text-muted">Người phụ trách</div><b id="d-assignees">' + (o.AssignedTo.length ? esc(o.AssignedTo.join(', ')) : '—') + '</b>' +
              (o.CompletedAt ? ' <span class="small text-muted ms-2">Trả KQ: ' + U.vnDateTime(o.CompletedAt) + '</span>' : '') + '</div></div>' +
            (o.Note ? '<div class="small mt-2"><span class="text-muted">Ghi chú:</span> ' + esc(o.Note) + '</div>' : '') +
          '</div></div></div>' +
          '<div class="col-lg-5"><div class="card h-100"><div class="card-body"><table class="table table-sm mb-2"><tbody>' +
            data.panels.map(function (p) {
              var pn = App.panel(p.PanelCode);
              return '<tr><td><span class="panel-chip">' + p.PanelCode + '</span> ' + esc(pn ? pn.PanelName : '') + (p.PrintCount ? ' <i class="bi bi-printer text-muted" title="Đã in ' + p.PrintCount + ' lần"></i>' : '') +
                '</td><td class="small">' + (p.ResultStatus === 'RESULTED' ? '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Có KQ</span>' : '<span class="text-muted">Chờ KQ</span>') + '</td>' +
                (money ? '<td class="text-end tabular">' + U.money(p.Amount) + '</td>' : '') + '</tr>';
            }).join('') + '</tbody></table>' +
            (money ? '<div class="d-flex justify-content-between small"><span class="text-muted">Tổng</span><span class="tabular">' + U.money(o.GrossAmount) + '</span></div>' +
              '<div class="d-flex justify-content-between align-items-center small" id="disc-row"><span class="text-muted">Chiết khấu</span>' +
                (App.can('order.price') && !cancelled
                  ? '<button class="btn btn-link btn-sm p-0 tabular text-decoration-none" id="disc-edit" title="Sửa chiết khấu">− ' + U.money(o.Discount) + ' <i class="bi bi-pencil small"></i></button>'
                  : '<span class="tabular">− ' + U.money(o.Discount) + '</span>') + '</div>' +
              '<div class="d-flex justify-content-between fw-bold fs-5 text-primary"><span>Thành tiền</span><span class="tabular">' + U.money(o.NetAmount) + '</span></div>' : '') +
            '<div class="small text-muted mt-2">Tạo: ' + esc(o.CreatedBy) + ' · ' + U.vnDateTime(o.CreatedAt) + '<br>Cập nhật: ' + esc(o.UpdatedBy) + ' · ' + U.vnDateTime(o.UpdatedAt) + '</div>' +
          '</div></div></div></div>' +
        '<div class="card"><div class="card-header p-0 border-0"><ul class="nav nav-tabs px-2 pt-2 w-100" role="tablist">' +
          data.panels.map(function (p) { return '<li class="nav-item"><button class="nav-link' + (activeTab === 'p-' + p.PanelCode ? ' active' : '') + '" data-tab="p-' + p.PanelCode + '">' + p.PanelCode + ' · ' + esc((App.panel(p.PanelCode) || {}).PanelName || '') + '</button></li>'; }).join('') +
          (App.can('history.view') ? '<li class="nav-item"><button class="nav-link' + (activeTab === 'history' ? ' active' : '') + '" data-tab="history"><i class="bi bi-graph-up"></i> Lịch sử chỉ số</button></li>' : '') +
          '<li class="nav-item"><button class="nav-link' + (activeTab === 'audit' ? ' active' : '') + '" data-tab="audit"><i class="bi bi-journal-text"></i> Nhật ký phiếu</button></li>' +
        '</ul></div><div class="card-body" id="d-tab"></div></div>';

      renderTab(resMap, canEnter);
      bind();
      if (o.AssignedTo.length) App.Users.load().then(function () { var el = U.$('#d-assignees', view); if (el) el.textContent = App.Users.names(o.AssignedTo); }).catch(function () {});
    }

    function renderTab(resMap, canEnter) {
      var box = U.$('#d-tab', view);
      var o = data.order;
      if (activeTab.indexOf('p-') === 0) {
        var code = activeTab.substring(2);
        var op = data.panels.filter(function (p) { return p.PanelCode === code; })[0];
        box.innerHTML = resultTableHtml(code, op.TestCodes, resMap[code] || {}, o.Gender, !canEnter) +
          (canEnter ? '<div class="d-flex gap-2 justify-content-end mt-3"><span class="small text-muted me-auto align-self-center"><span class="kbd">Enter</span> chuyển ô kế tiếp</span>' +
            '<button class="btn btn-primary" id="d-save-res"><i class="bi bi-save"></i> Lưu kết quả ' + code + '</button></div>' : '');
        bindResultInputs(box, function () { return { gender: o.Gender, age: o.Age }; });
        var btn = U.$('#d-save-res', box);
        if (btn) btn.onclick = function () {
          btn.disabled = true;
          U.api('order.saveResults', { orderId: o.OrderID, panelCode: code, results: collectResults(U.$('table', box)) })
            .then(function (d) { data = d; U.toast('Đã lưu kết quả ' + code); render(); })
            .catch(function () {}).finally(function () { btn.disabled = false; });
        };
        var first = U.$('.res-input:not([disabled])', box);
        if (first && !first.value) first.focus();
      } else if (activeTab === 'history') {
        App.renderHistory(box, o.PatientID, o.OrderID);
      } else if (activeTab === 'audit') {
        box.innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
        U.api('order.audit', { orderId: o.OrderID }).then(function (rows) {
          box.innerHTML = rows.length ? '<div class="table-wrap"><table class="table table-sm"><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Chi tiết</th></tr></thead><tbody>' +
            rows.map(function (r) { return '<tr><td class="small text-nowrap">' + U.vnDateTime(r.Timestamp) + '</td><td>' + esc(r.Username) + '</td><td><span class="badge text-bg-light">' + esc(r.Action) + '</span></td><td>' + App.auditDetail(r.Detail) + '</td></tr>'; }).join('') +
            '</tbody></table></div>' : U.empty('Chưa có nhật ký');
        }).catch(function () {});
      }
    }

    function bind() {
      U.$$('[data-tab]', view).forEach(function (b) {
        b.onclick = function () {
          activeTab = b.getAttribute('data-tab');
          U.$$('[data-tab]', view).forEach(function (x) { x.classList.toggle('active', x === b); });
          var resMap = {};
          data.results.forEach(function (r) { (resMap[r.PanelCode] = resMap[r.PanelCode] || {})[r.TestCode] = r; });
          renderTab(resMap, App.can('result.enter') && data.order.Status !== 'CANCELLED');
        };
      });
      var qp = U.$('#d-qprint', view);
      if (qp) qp.onclick = function () { App.choosePanelsThen(data, function (codes) { App.quickPrint(data, codes); }); };
      U.$$('[data-export]', view).forEach(function (b) {
        b.onclick = function () {
          var fmt = b.getAttribute('data-export');
          if (Api.isDemo) { U.toast('Tải PDF/Word chạy trên Google Apps Script – ở DEMO hãy dùng "In nhanh" → Lưu PDF.', 'warn'); return; }
          App.choosePanelsThen(data, function (codes) {
            U.toast('Đang tạo file ' + fmt.toUpperCase() + '…');
            U.api('print.render', { orderId: data.order.OrderID, panelCodes: codes, format: fmt }).then(function (f) {
              U.downloadBase64(f.base64, f.fileName, f.mimeType);
            }).catch(function () {});
          });
        };
      });
      // Sửa chiết khấu / thanh toán ngay tại ô Thành tiền
      var de = U.$('#disc-edit', view);
      if (de) de.onclick = function () {
        var o = data.order;
        U.$('#disc-row', view).innerHTML = '<span class="text-muted">Chiết khấu</span><div class="input-group input-group-sm" style="max-width:230px">' +
          '<input class="form-control text-end tabular" id="disc-val" inputmode="numeric" value="' + (o.Discount || 0) + '">' +
          '<button class="btn btn-primary" id="disc-ok" title="Lưu"><i class="bi bi-check-lg"></i></button><button class="btn btn-light" id="disc-x" title="Hủy"><i class="bi bi-x-lg"></i></button></div>';
        var inp = U.$('#disc-val', view);
        inp.focus(); inp.select();
        var save = function () {
          var v = Number(String(inp.value).replace(/\D/g, '')) || 0;
          if (v > (o.GrossAmount || 0)) { U.toast('Chiết khấu lớn hơn tổng tiền', 'warn'); return; }
          U.api('order.update', { orderId: o.OrderID, version: o.Version, discount: v }).then(function (d) { data = d; U.toast('Đã cập nhật chiết khấu'); render(); })
            .catch(function (e) { if (e.code === 'CONFLICT') load(); });
        };
        U.$('#disc-ok', view).onclick = save;
        U.$('#disc-x', view).onclick = render;
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); if (e.key === 'Escape') render(); });
      };
      var pb = U.$('#pay-toggle', view);
      if (pb) pb.onclick = function () {
        var o = data.order;
        U.api('order.update', { orderId: o.OrderID, version: o.Version, paymentStatus: o.PaymentStatus === 'PAID' ? 'UNPAID' : 'PAID' })
          .then(function (d) { data = d; U.toast(d.order.PaymentStatus === 'PAID' ? 'Đã ghi nhận thu tiền' : 'Đã chuyển về Chưa thu'); render(); })
          .catch(function (e) { if (e.code === 'CONFLICT') load(); });
      };
      var ed = U.$('#d-edit', view);
      if (ed) ed.onclick = editOrder;
      var cc = U.$('#d-cancel', view);
      if (cc) cc.onclick = function () {
        U.prompt('Hủy phiếu ' + data.order.OrderID, 'Lý do hủy (bắt buộc, được ghi nhật ký)', true).then(function (reason) {
          if (!reason) return;
          U.api('order.cancel', { orderId: data.order.OrderID, reason: reason }).then(function (d) { data = d; U.toast('Đã hủy phiếu'); render(); }).catch(function () {});
        });
      };
    }

    function editOrder() {
      var o = data.order;
      var cur = {};
      data.panels.forEach(function (p) { cur[p.PanelCode] = p; });
      var canPrice = App.can('order.price');
      var m = U.modal('<div class="modal-header"><h5 class="modal-title">Sửa phiếu ' + o.OrderID + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><form id="e-form" class="row g-2">' +
        '<div class="col-md-4"><label class="form-label">Ngày khám</label><input type="date" class="form-control" name="orderDate" value="' + o.OrderDate + '"></div>' +
        '<div class="col-md-8"><label class="form-label">BS chỉ định</label><input class="form-control" name="doctorName" list="dl-doctor2" value="' + esc(o.DoctorName || '') + '"><datalist id="dl-doctor2">' +
          App.state.catalog.doctors.map(function (d) { return '<option value="' + esc(d.DoctorName) + '">'; }).join('') + '</datalist></div>' +
        '<div class="col-12"><label class="form-label">Người phụ trách</label><div id="e-assign"></div></div>' +
        '<div class="col-12"><label class="form-label">Nhóm xét nghiệm & đơn giá</label><div class="table-wrap"><table class="table table-sm"><tbody>' +
          App.activePanels().map(function (p) {
            var on = !!cur[p.PanelCode];
            return '<tr><td style="width:32px"><input class="form-check-input" type="checkbox" data-ep="' + p.PanelCode + '"' + (on ? ' checked' : '') + '></td><td><span class="panel-chip">' + p.PanelCode + '</span> ' + esc(p.PanelName) +
              (on && cur[p.PanelCode].ResultStatus === 'RESULTED' ? ' <span class="small text-warning">(đã có KQ)</span>' : '') + '</td>' +
              '<td style="width:150px"><input class="form-control form-control-sm text-end tabular" data-amt="' + p.PanelCode + '" value="' + (on ? cur[p.PanelCode].Amount : '') + '" placeholder="theo bảng giá"' + (canPrice ? '' : ' disabled') + '></td></tr>';
          }).join('') + '</tbody></table></div></div>' +
        '<div class="col-md-4"><label class="form-label">Chiết khấu</label><input class="form-control tabular" name="discount" value="' + (o.Discount || 0) + '"' + (canPrice ? '' : ' disabled') + '></div>' +
        '<div class="col-md-4"><label class="form-label">Thanh toán</label><select class="form-select" name="paymentStatus"><option value="PAID"' + (o.PaymentStatus === 'PAID' ? ' selected' : '') + '>Đã thu</option><option value="UNPAID"' + (o.PaymentStatus !== 'PAID' ? ' selected' : '') + '>Chưa thu</option></select></div>' +
        '<div class="col-md-4"><label class="form-label">Tái khám (ngày)</label><input class="form-control" name="followUpDays" value="' + (o.FollowUpDays || '') + '"></div>' +
        '<div class="col-12"><label class="form-label">Ghi chú</label><textarea class="form-control" name="note" rows="2">' + esc(o.Note || '') + '</textarea></div>' +
        '</form></div><div class="modal-footer"><button class="btn btn-light" data-bs-dismiss="modal">Đóng</button><button class="btn btn-primary" id="e-save">Lưu thay đổi</button></div>', { size: 'lg' });
      var ePicker = App.assigneePicker(m.body.querySelector('#e-assign'), o.AssignedTo, { inline: true });
      m.body.querySelector('#e-save').onclick = function () {
        var f = U.formData(m.body.querySelector('#e-form'));
        var panels = U.$$('[data-ep]:checked', m.body).map(function (c) {
          var code = c.getAttribute('data-ep');
          var amt = m.body.querySelector('[data-amt="' + code + '"]').value.replace(/\D/g, '');
          var line = { panelCode: code, tests: cur[code] ? cur[code].TestCodes : undefined };
          if (canPrice && amt !== '') line.amount = Number(amt);
          return line;
        });
        if (!panels.length) { U.toast('Phiếu cần ít nhất 1 nhóm', 'warn'); return; }
        var payload = { orderId: o.OrderID, version: o.Version, orderDate: f.orderDate, doctorName: f.doctorName, paymentStatus: f.paymentStatus,
          followUpDays: Number(f.followUpDays) || 0, note: f.note, panels: panels, assignedTo: ePicker.get() };
        if (canPrice) payload.discount = Number(String(f.discount).replace(/\D/g, '')) || 0;
        U.api('order.update', payload).then(function (d) { data = d; m.hide(); U.toast('Đã cập nhật phiếu'); render(); })
          .catch(function (e) { if (e.code === 'CONFLICT') { m.hide(); load(); } });
      };
    }

    load();
  };

  /** Ask which panels to print when the order has more than one. */
  App.choosePanelsThen = function (data, cb) {
    if (data.panels.length <= 1) { cb(data.panels.map(function (p) { return p.PanelCode; })); return; }
    var m = U.modal('<div class="modal-header"><h5 class="modal-title">Chọn nhóm cần in</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">' +
      data.panels.map(function (p) {
        return '<div class="form-check"><input class="form-check-input" type="checkbox" id="pp-' + p.PanelCode + '" value="' + p.PanelCode + '" checked>' +
          '<label class="form-check-label" for="pp-' + p.PanelCode + '"><span class="panel-chip">' + p.PanelCode + '</span> ' + esc((App.panel(p.PanelCode) || {}).PanelName || '') +
          (p.ResultStatus !== 'RESULTED' ? ' <span class="small text-muted">(chưa có KQ)</span>' : '') + '</label></div>';
      }).join('') + '</div><div class="modal-footer"><button class="btn btn-primary" id="pp-ok">Tiếp tục</button></div>', { size: 'sm' });
    m.body.querySelector('#pp-ok').onclick = function () {
      var codes = U.$$('input:checked', m.body).map(function (x) { return x.value; });
      if (!codes.length) return;
      m.hide(); cb(codes);
    };
  };

  /* ================================================================ QUICK PRINT (browser) */
  App.quickPrint = function (data, codes) {
    var s = App.state.settings || {};
    var o = data.order;
    codes = codes || data.panels.map(function (p) { return p.PanelCode; });
    var onlyResulted = String(s.PRINT_ONLY_RESULTED || 'TRUE').toUpperCase() !== 'FALSE';
    var size = String(s.PRINT_PAGE_SIZE || 'A5').toUpperCase() === 'A4' ? 'A4' : 'A5';   // khổ mặc định; từng nhóm có thể đặt riêng (Panels.PageSize)
    var SZ = { A4: { w: '192mm', h: 297, base: 11, sig: '4.6em' }, A5: { w: '130mm', h: 210, base: 9.5, sig: '4.2em' } };
    var firstSize = null;
    // Font phiếu in (Settings.PRINT_FONT, mặc định Be Vietnam Pro – thiết kế cho tiếng Việt). Google Font → tải trong iframe in.
    var FONT = {
      'be vietnam pro': { css: '"Be Vietnam Pro"', g: 'Be+Vietnam+Pro' }, 'roboto': { css: 'Roboto', g: 'Roboto' },
      'noto sans': { css: '"Noto Sans"', g: 'Noto+Sans' }, 'arial': { css: 'Arial' }, 'times new roman': { css: '"Times New Roman", Times, serif' }
    }[String(s.PRINT_FONT || 'Be Vietnam Pro').trim().toLowerCase()] || { css: '"Be Vietnam Pro"', g: 'Be+Vietnam+Pro' };
    var fontLink = FONT.g ? '<link id="pf" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=' + FONT.g + ':wght@400;500;600;700&display=block">' : '';
    var od = o.OrderDate.split('-');
    var now = new Date();
    var logo = s.CLINIC_LOGO_DATA || s.CLINIC_LOGO_URL || '';
    var wmOn = logo && String(s.WATERMARK_ENABLED || 'TRUE').toUpperCase() !== 'FALSE';
    var wmOp = Math.min(0.3, Math.max(0.03, Number(s.WATERMARK_OPACITY) || 0.08));
    var pages = codes.map(function (code) {
      var p = App.panel(code) || { PanelName: code, PrintTitle: 'PHIẾU KẾT QUẢ XÉT NGHIỆM' };
      var psz = p.PageSize === 'A4' || p.PageSize === 'A5' ? p.PageSize : size;
      if (!firstSize) firstSize = psz;
      var op = data.panels.filter(function (x) { return x.PanelCode === code; })[0] || { TestCodes: [] };
      var res = {};
      data.results.filter(function (r) { return r.PanelCode === code; }).forEach(function (r) { res[r.TestCode] = r; });
      var tests = App.testsOfPanel(code).filter(function (t) {
        return (!op.TestCodes.length || op.TestCodes.indexOf(t.TestCode) > -1) && (!onlyResulted || (res[t.TestCode] && res[t.TestCode].Value !== ''));
      });
      var anyAbn = false;
      var rowsHtml = tests.length ? tests.map(function (t, i) {
        var r = res[t.TestCode] || {};
        var ab = r.Flag && r.Flag !== 'N';
        if (ab) anyAbn = true;
        var mark = r.Flag === 'H' ? ' ↑' : (r.Flag === 'L' ? ' ↓' : '');
        return '<tr><td class="c mu">' + (i + 1) + '</td><td class="tn">' + esc(t.TestName) + '</td><td class="c rv' + (ab ? ' ab' : '') + '">' + esc(r.Value || '') + mark + '</td>' +
          '<td class="c mu">' + esc(t.Unit || '') + '</td><td class="rf">' + esc(r.RefText || App.refFor(t, o.Gender).text) + '</td></tr>';
      }).join('') : '<tr><td colspan="5" class="c mu" style="padding:10px">(Chưa có kết quả)</td></tr>';
      return '<section class="page sz-' + psz.toLowerCase() + '" data-sz="' + psz + '">' +
        '<header><div class="logo">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : '') + '</div><div class="org">' +
          '<div class="cn">' + esc(s.CLINIC_NAME || '') + '</div>' +
          '<div class="ci">' + esc([s.CLINIC_LICENSE, s.CLINIC_ADDRESS].filter(Boolean).join(' · ')) + '</div>' +
          '<div class="ci">' + (s.CLINIC_PHONE ? 'Điện thoại: ' + esc(s.CLINIC_PHONE) : '') + '</div></div></header>' +
        '<div class="ttl"><h1>' + esc(p.PrintTitle || 'PHIẾU KẾT QUẢ XÉT NGHIỆM') + '</h1>' + (p.PrintSubtitle ? '<h2>' + esc(p.PrintSubtitle) + '</h2>' : '') + '</div>' +
        '<table class="info"><tr><td class="w60">Họ và tên: <b class="pn">' + esc(o.PatientName) + '</b></td><td>Tuổi: <b>' + (o.Age === null ? '' : o.Age) + '</b>' +
          '<span class="sp"></span>Giới tính: <b>' + esc(o.Gender || '') + '</b></td></tr>' +
          '<tr><td>Mã BN: <b class="mono">' + esc(o.PatientID) + '</b></td><td>Ngày khám: <b>' + U.vnDate(o.OrderDate) + '</b></td></tr>' +
          '<tr><td>Địa chỉ: ' + esc(o.Address || '') + '</td><td>BS chỉ định: ' + esc(o.DoctorName || '') + '</td></tr></table>' +
        '<table class="res"><thead><tr><th style="width:7%">STT</th><th style="width:37%">XÉT NGHIỆM</th><th style="width:17%">KẾT QUẢ</th><th style="width:13%">ĐƠN VỊ</th><th>KHOẢNG THAM CHIẾU</th></tr></thead><tbody>' +
          rowsHtml + '</tbody></table>' +
        (anyAbn ? '<div class="legend"><b class="ab">In đậm đỏ</b>: ngoài khoảng tham chiếu (↑ cao hơn · ↓ thấp hơn)</div>' : '') +
        '<table class="foot"><tr><td class="fl">' + (o.FollowUpDate ? 'Hẹn tái khám: <b>' + U.vnDate(o.FollowUpDate) + '</b>' : '') + '</td>' +
          '<td class="fr"><div class="mu">' + esc(s.CLINIC_CITY || 'Pleiku') + ', ngày ' + Number(od[2]) + ' tháng ' + Number(od[1]) + ' năm ' + od[0] + '</div>' +
          '<div class="role">TRƯỞNG PHÒNG XÉT NGHIỆM</div><div class="sig"></div><div class="nm">' + esc(s.LAB_HEAD || '') + '</div></td></tr></table>' +
        '<div class="note">' + esc(s.REPORT_FOOTER || '') + '<span class="pt">In lúc ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN') + '</span></div>' +
        '</section>';
    }).join('');
    var pm = 'margin:8mm 9mm 8mm 9mm}';
    var css = '@page{size:' + (firstSize || size) + ' portrait;' + pm + '@page a4{size:A4 portrait;' + pm + '@page a5{size:A5 portrait;' + pm + '*{box-sizing:border-box}' +
      'body{font-family:' + FONT.css + ',Arial,"Helvetica Neue",Helvetica,"Segoe UI",sans-serif;color:#1f2933;margin:0;line-height:1.35}' +
      '.page{position:relative;z-index:1;page-break-after:always;page-break-inside:avoid}' +
      '.sz-a4{page:a4;width:' + SZ.A4.w + ';font-size:' + SZ.A4.base + 'pt}.sz-a5{page:a5;width:' + SZ.A5.w + ';font-size:' + SZ.A5.base + 'pt}' +
      '.sz-a4 .sig{height:' + SZ.A4.sig + '}.sz-a5 .sig{height:' + SZ.A5.sig + '}.page:last-child{page-break-after:auto}' +
      'header{display:flex;gap:10px;align-items:center;padding-bottom:6px;border-bottom:2px solid #0f4c5c}' +
      '.logo img{height:46px;width:auto;display:block}.org{flex:1}.cn{font-weight:700;color:#0f4c5c;font-size:1.25em;letter-spacing:.02em}' +
      '.ci{font-size:.8em;color:#5f6b7a}' +
      '.ttl{text-align:center;margin:.75em 0 .6em}h1{color:#0f4c5c;font-size:1.32em;margin:0;letter-spacing:.03em}h2{color:#0f4c5c;font-size:1.08em;margin:1px 0 0;font-weight:700}' +
      'table{width:100%;border-collapse:collapse}' +
      '.info{background:rgba(15,76,92,.05);border:1px solid #d5e2e5;border-radius:4px;margin-bottom:.6em}.info td{padding:.25em .65em;vertical-align:top}.w60{width:60%}' +
      '.pn{font-size:1.08em;letter-spacing:.02em}.sp{display:inline-block;width:14px}.mono{font-variant-numeric:tabular-nums;letter-spacing:.03em}' +
      '.res th{background:#0f4c5c;color:#fff;font-size:.8em;font-weight:700;padding:.5em .4em;border:.5pt solid #0f4c5c;letter-spacing:.03em}' +
      '.res td{border:.5pt solid #c3ced4;padding:.32em .45em}.res tbody tr:nth-child(even) td{background:rgba(15,76,92,.045)}' +
      '.c{text-align:center}.mu{color:#5f6b7a}.tn{font-weight:600}.rv{font-weight:700;font-size:1.04em}.rf{font-size:.9em}.ab{color:#b42318}' +
      '.legend{font-size:.78em;color:#5f6b7a;margin-top:4px}' +
      '.foot{margin-top:1em;page-break-inside:avoid;break-inside:avoid}.foot td{vertical-align:top}.fl{width:40%;padding-top:2px}.fr{width:60%;text-align:center}.fr .mu,.role,.nm{white-space:nowrap}' +
      '.role{font-weight:700;margin-top:2px;letter-spacing:.02em}.nm{font-weight:700}' +
      '.note{font-size:.7em;color:#5f6b7a;font-style:italic;margin-top:.8em;padding-top:.4em;border-top:1px solid #e3e9ec}.pt{float:right;font-style:normal}' +
      '.wm{position:fixed;left:50%;top:54%;width:60%;transform:translate(-50%,-50%);opacity:' + wmOp + ';z-index:0;pointer-events:none}' +
      '@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
    var frame = document.getElementById('print-frame');
    // iframe phải có kích thước thật (đặt ngoài màn hình) để đo chiều cao chính xác khi tự co cho vừa trang
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:1300px;border:0;';
    var doc = frame.contentWindow.document;
    doc.open();
    doc.write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>' + esc(o.PatientID + ' ' + o.PatientName) + '</title>' + fontLink + '<style>' + css + '</style></head><body>' +
      (wmOn ? '<img class="wm" src="' + esc(logo) + '" alt="">' : '') + pages + '</body></html>');
    doc.close();
    // Tự co chữ cho mỗi phiếu vừa đúng 1 trang (giữ chữ ký + tên Trưởng phòng ở trang 1)
    var fitPages = function () {
      Array.prototype.forEach.call(doc.querySelectorAll('.page'), function (pg) {
        var cfg = SZ[pg.getAttribute('data-sz')] || SZ[size];
        var maxH = Math.floor((cfg.h - 16) * 96 / 25.4) - 6;   // chiều cao vùng in (px)
        var basePt = cfg.base;
        var k = 1;
        while (pg.scrollHeight > maxH && k > 0.7) { k = Math.round((k - 0.03) * 100) / 100; pg.style.fontSize = (basePt * k).toFixed(2) + 'pt'; }
      });
    };
    var printed = false;
    var go = function () {
      if (printed) return;
      printed = true;
      try { fitPages(); } catch (e) { /* đo lỗi → in bình thường */ }
      frame.contentWindow.focus(); frame.contentWindow.print();
    };
    // Chờ font tải xong (tối đa 3,5 giây) rồi mới đo & in – tránh in bằng font dự phòng
    var t0 = Date.now();
    var waitFont = function () {
      var link = doc.getElementById('pf');
      if (!link || !doc.fonts || !doc.fonts.load) return go();
      if (!link.sheet && Date.now() - t0 < 3000) return setTimeout(waitFont, 80);
      var fam = FONT.css;
      Promise.race([
        Promise.all(['400', '600', '700'].map(function (w) { return doc.fonts.load(w + ' 12px ' + fam, 'Ệệ'); })).then(function () { return doc.fonts.ready; }),
        new Promise(function (r) { setTimeout(r, 3500 - (Date.now() - t0)); })
      ]).then(go, go);
    };
    setTimeout(waitFont, 120);
  };

  /* ================================================================ HISTORY COMPONENT */
  App.renderHistory = function (box, patientId, highlightOrder) {
    box.innerHTML = '<div class="empty"><div class="spinner-border text-secondary"></div></div>';
    U.api('history.byPatient', { patientId: patientId }).then(function (h) {
      if (!h.tests.length) { box.innerHTML = U.empty('Chưa có dữ liệu kết quả để so sánh', 'bi-graph-up'); return; }
      var visits = h.visits.slice(-10);
      var vIdx = {};
      visits.forEach(function (v) { vIdx[v.OrderID] = true; });
      box.innerHTML = '<div class="d-flex align-items-center mb-2"><div class="small text-muted">' + h.visits.length + ' lần có kết quả · hiển thị ' + visits.length + ' lần gần nhất. Bấm vào chỉ số để xem biểu đồ.</div></div>' +
        '<div class="table-wrap"><table class="table table-sm table-hover hist-table"><thead><tr><th>Chỉ số</th><th>Đơn vị</th>' +
        visits.map(function (v) { return '<th class="vcol' + (v.OrderID === highlightOrder ? ' text-primary' : '') + '">' + U.vnDate(v.OrderDate) + '</th>'; }).join('') + '<th>Xu hướng</th></tr></thead><tbody>' +
        h.tests.map(function (t) {
          var byOrder = {};
          t.points.forEach(function (p) { byOrder[p.OrderID] = p; });
          return '<tr data-test="' + t.TestCode + '"><td class="fw-medium">' + esc(t.TestName) + '</td><td class="small text-muted">' + esc(t.Unit || '') + '</td>' +
            visits.map(function (v) { var p = byOrder[v.OrderID]; return '<td class="val' + (p ? ' flag-' + (p.Flag || '') : '') + '">' + (p ? esc(p.Value) : '<span class="text-muted">·</span>') + '</td>'; }).join('') +
            '<td class="trend-' + t.trend + '">' + ({ UP: '<i class="bi bi-arrow-up-right"></i> Tăng', DOWN: '<i class="bi bi-arrow-down-right"></i> Giảm', FLAT: '<i class="bi bi-arrow-right"></i> Không đổi' }[t.trend] || '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      U.on(box, 'click', 'tr[data-test]', function (e, el) {
        var t = h.tests.filter(function (x) { return x.TestCode === el.getAttribute('data-test'); })[0];
        App.historyChart(t);
      });
    }).catch(function () { box.innerHTML = U.empty('Lỗi tải lịch sử', 'bi-exclamation-triangle'); });
  };

  App.historyChart = function (t) {
    var tdef = App.test(t.TestCode) || {};
    var numeric = t.points.filter(function (p) { return p.NumValue !== null; });
    var m = U.modal('<div class="modal-header"><h5 class="modal-title">' + esc(t.TestName) + ' <span class="text-muted small">' + esc(t.Unit || '') + '</span></h5><button class="btn-close" data-bs-dismiss="modal"></button></div>' +
      '<div class="modal-body">' + (numeric.length >= 1 ? '<canvas id="hc" height="120"></canvas>' : '') +
      '<table class="table table-sm mt-3"><thead><tr><th>Ngày</th><th>Mã phiếu</th><th>Kết quả</th><th>Tham chiếu</th></tr></thead><tbody>' +
      t.points.slice().reverse().map(function (p) { return '<tr><td>' + U.vnDate(p.OrderDate) + '</td><td><a href="#/order/' + p.OrderID + '" data-bs-dismiss="modal" class="mono">' + p.OrderID + '</a></td><td class="flag-' + (p.Flag || '') + '">' + esc(p.Value) + ' ' + (p.Flag && p.Flag !== 'N' ? U.flagLabel(p.Flag) : '') + '</td><td class="small">' + esc(p.RefText || '') + '</td></tr>'; }).join('') +
      '</tbody></table></div>', { size: 'lg' });
    if (!numeric.length || !window.Chart) return;
    var ref = { min: tdef.RefMinM, max: tdef.RefMaxM };
    setTimeout(function () {
      var ctx = m.body.querySelector('#hc');
      var labels = numeric.map(function (p) { return U.vnDate(p.OrderDate); });
      var ds = [{ label: t.TestName, data: numeric.map(function (p) { return p.NumValue; }), borderColor: '#0f4c5c', backgroundColor: '#0f4c5c', tension: .25,
        pointRadius: 5, pointBackgroundColor: numeric.map(function (p) { return p.Flag && p.Flag !== 'N' ? '#b42318' : '#0f4c5c'; }) }];
      if (ref.max !== null && ref.max !== undefined) ds.push({ label: 'Ngưỡng trên', data: labels.map(function () { return ref.max; }), borderColor: '#e36414', borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 });
      if (ref.min !== null && ref.min !== undefined) ds.push({ label: 'Ngưỡng dưới', data: labels.map(function () { return ref.min; }), borderColor: '#9aa5b1', borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 });
      new Chart(ctx, { type: 'line', data: { labels: labels, datasets: ds }, options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false } } } });
    }, 200);
  };

  /* ================================================================ VIEW: PATIENT */
  App.views['patient'] = function (view, params) {
    var pid = params[0];
    function load() {
      U.api('patient.get', { patientId: pid }).then(function (p) {
        view.innerHTML = '<div class="d-flex align-items-center gap-2 mb-3"><a href="javascript:history.back()" class="btn btn-sm btn-light"><i class="bi bi-arrow-left"></i></a><h4 class="mb-0">' + esc(p.FullName) + '</h4><span class="mono text-muted">' + esc(p.PatientID) + '</span>' +
          '<div class="ms-auto d-flex gap-2">' + (App.can('patient.edit') ? '<button class="btn btn-outline-secondary" id="pe-edit"><i class="bi bi-pencil"></i> Sửa hồ sơ</button>' : '') +
          (App.can('order.create') ? '<a class="btn btn-primary" href="#/order-new/' + encodeURIComponent(p.PatientID) + '"><i class="bi bi-plus-lg"></i> Tạo phiếu mới</a>' : '') + '</div></div>' +
          '<div class="row g-3"><div class="col-lg-4"><div class="card mb-3"><div class="card-body">' + patientLine(p) +
            '<hr><div class="small text-muted">Tạo: ' + esc(p.CreatedBy || '') + ' · ' + U.vnDateTime(p.CreatedAt) + (p.UpdatedAt ? '<br>Cập nhật: ' + esc(p.UpdatedBy) + ' · ' + U.vnDateTime(p.UpdatedAt) : '') + '</div></div></div>' +
          '<div class="card"><div class="card-header">Các lần khám (' + p.orders.length + ')</div><div class="list-group list-group-flush">' +
            (p.orders.length ? p.orders.map(function (o) {
              return '<a class="list-group-item list-group-item-action" href="#/order/' + o.OrderID + '"><div class="d-flex justify-content-between"><span class="mono small fw-semibold">' + o.OrderID + '</span>' + U.badge(o.Status) + '</div>' +
                '<div class="small text-muted">' + U.vnDate(o.OrderDate) + ' · ' + esc(o.DoctorName || '') + '</div><div>' + U.chips(o.PanelCodes) + '</div></a>';
            }).join('') : U.empty('Chưa có phiếu')) + '</div></div></div>' +
          '<div class="col-lg-8"><div class="card"><div class="card-header"><i class="bi bi-graph-up"></i> Lịch sử thay đổi chỉ số</div><div class="card-body" id="pe-hist"></div></div></div></div>';
        if (App.can('history.view')) App.renderHistory(U.$('#pe-hist', view), p.PatientID);
        else U.$('#pe-hist', view).innerHTML = U.empty('Không có quyền xem lịch sử chỉ số', 'bi-lock');
        var ed = U.$('#pe-edit', view);
        if (ed) ed.onclick = function () {
          var m = U.modal('<div class="modal-header"><h5 class="modal-title">Sửa hồ sơ ' + esc(p.PatientID) + '</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">' +
            patientFormHtml(p) + '<div class="small text-muted mt-2">Thay đổi không ảnh hưởng thông tin đã chốt trên các phiếu cũ.</div></div><div class="modal-footer"><button class="btn btn-primary" id="pe-save">Lưu</button></div>', { size: 'lg' });
          bindPatientForm(m.body);
          m.body.querySelector('#pe-save').onclick = function () {
            var f = m.body.querySelector('#pt-form');
            if (!f.reportValidity()) return;
            U.api('patient.save', U.formData(f)).then(function (r) { if (r.patient) App.Patients.upsert(r.patient); m.hide(); U.toast('Đã cập nhật'); load(); }).catch(function () {});
          };
        };
      }).catch(function (e) { view.innerHTML = U.empty(e.message, 'bi-exclamation-triangle'); });
    }
    load();
  };

  /* ================================================================ AUDIT DETAIL RENDER */
  App.auditDetail = function (raw) {
    var d;
    try { d = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return '<span class="small">' + esc(raw) + '</span>'; }
    if (!d || typeof d !== 'object') return '';
    if (d.changes) {
      return '<div class="small">' + (d.panel ? '<span class="panel-chip">' + esc(d.panel) + '</span> ' : '') + d.changes.map(function (c) {
        var t = App.test(c.t);
        return '<span class="me-2">' + esc(t ? t.TestName : c.t) + ': <s class="text-muted">' + esc(c.from || '∅') + '</s> → <b>' + esc(c.to || '∅') + '</b></span>';
      }).join('') + '</div>';
    }
    var keys = Object.keys(d);
    if (!keys.length) return '';
    return '<div class="small">' + keys.map(function (k) {
      var v = d[k];
      if (v && typeof v === 'object' && 'from' in v) return '<span class="me-2">' + esc(k) + ': <s class="text-muted">' + esc(v.from === '' ? '∅' : v.from) + '</s> → <b>' + esc(v.to === '' ? '∅' : v.to) + '</b></span>';
      return '<span class="me-2">' + esc(k) + ': <b>' + esc(typeof v === 'object' ? JSON.stringify(v) : v) + '</b></span>';
    }).join('') + '</div>';
  };
})(window.App);
