/**
 * demo-seed.js – Dữ liệu GIẢ cho chế độ DEMO (tên, SĐT, giá đều minh họa – không phải dữ liệu thật).
 */
(function (global) {
  'use strict';
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  global.DemoSeed = {
    run: function () {
      var ctx = { username: 'admin', fullName: 'Quản trị', role: 'ADMIN', perms: ['*'] };
      YearDb.all().forEach(function (y) { SpreadsheetApp.openById(y.SpreadsheetId).rename('DB_' + y.Year); });   // bản giả lập không có tên file thật
      YearDb.refreshCapacity();
      // Demo users
      [['bacsi', 'BS. Demo', 'DOCTOR'], ['ktv', 'KTV Demo', 'TECH'], ['letan', 'Lễ tân Demo', 'RECEPTION']].forEach(function (u) {
        AdminService.saveUser({ Username: u[0], FullName: u[1], RoleCode: u[2], Password: 'demo123' }, ctx);
      });
      // Admin: skip forced password change in demo
      var a = Db.findOne(T.USERS, null, 'Username', 'admin');
      Db.updateRow(T.USERS, null, a._row, { MustChangePassword: false });
      Db.readAll(T.USERS).forEach(function (u) { Db.updateRow(T.USERS, null, u._row, { MustChangePassword: false }); });

      // Illustrative prices
      var price = { GLU: 30000, HBA1C: 120000, UREA: 30000, CREA: 30000, EGFR: 0, TG: 40000, CHOL: 40000, HDL: 40000, LDL: 40000,
        TBIL: 35000, DBIL: 35000, CA: 35000, PROT: 30000, UA: 35000, ALT: 30000, AST: 30000, GGT: 40000, FE: 50000, AMY: 50000, ABO_RH: 40000,
        HBSAG: 70000, HBEAG: 90000, HBSAB: 90000, HCV_AB: 100000, HAV_IGM: 120000, AFP: 150000, HP_AB: 120000, CEA: 150000, PSA: 150000,
        HIV: 100000, SYPHILIS: 80000, TB_AB: 150000, RUBELLA: 150000, DENGUE_AB: 150000, DENGUE_NS1: 150000, HPV_IGG: 200000,
        FT3: 100000, FT4: 100000, TSH: 100000, FASC_IGG: 120000, TAEN_AB: 120000, TOXO_AB: 120000, TRICH_AB: 120000, ASC_AB: 120000,
        STRONG_AB: 120000, AMOEBA_AB: 120000, CHLAMYDIA: 150000 };
      var tests = Db.readAll(T.TESTS);
      Db.updateRows(T.TESTS, null, tests.filter(function (t) { return price[t.TestCode]; })
        .map(function (t) { return { row: t._row, patch: { Price: price[t.TestCode] } }; }));
      var pp = { NT: 50000, TD: 250000, ID: 90000, DA: 80000, GN: 140000 };
      Db.readAll(T.PANELS).forEach(function (p) { if (pp[p.PanelCode]) Db.updateRow(T.PANELS, null, p._row, { Price: pp[p.PanelCode] }); });
      Db.readAll(T.SETTINGS).forEach(function (s) {
        if (s.Key === 'CLINIC_NAME') Db.updateRow(T.SETTINGS, null, s._row, { Value: 'PHÒNG XN Y KHOA (DEMO)' });
      });
      AdminService.clearCache();

      // Fake patients
      var ho = ['NGUYỄN', 'TRẦN', 'LÊ', 'PHẠM', 'HOÀNG', 'VÕ', 'ĐẶNG', 'BÙI', 'ĐỖ', 'HUỲNH'];
      var dem = ['VĂN', 'THỊ', 'MINH', 'NGỌC', 'THANH', 'HỮU', 'QUỐC', 'KIM'];
      var ten = ['AN', 'BÌNH', 'CƯỜNG', 'DUNG', 'GIANG', 'HÀ', 'KHOA', 'LAN', 'MAI', 'NAM', 'OANH', 'PHÚC', 'QUANG', 'SƠN', 'TÂM', 'UYÊN', 'VY', 'XUÂN'];
      var wards = ['P. Pleiku', 'P. Hội Phú', 'P. Diên Hồng', 'P. Thống Nhất', 'P. An Phú', 'X. Biển Hồ', 'X. Gào'];
      var patients = [];
      for (var i = 0; i < 36; i++) {
        var female = i % 2 === 1;
        var name = pick(ho) + ' ' + (female ? 'THỊ' : pick(dem)) + ' ' + pick(ten);
        var phone = i % 9 === 4 && patients.length ? patients[patients.length - 1].Phone : '09' + String(10000000 + Math.floor(Math.random() * 89999999));
        patients.push(PatientService.save({ FullName: name, Gender: female ? 'Nữ' : 'Nam', BirthYear: 1950 + Math.floor(rnd(0, 55)),
          Phone: phone, Address: Math.floor(rnd(1, 300)) + ' Đường số ' + Math.floor(rnd(1, 30)), Ward: pick(wards), Province: 'Gia Lai', force: true }, ctx).patient);
      }

      // Orders over the past 75 days
      var tm = Catalog.testMap();
      var doctors = ['KT SỨC KHỎE', 'KT SỨC KHỎE', 'KT SỨC KHỎE', 'BS NGHĨA', 'BS SƠN', 'BS TOÁN'];
      var combos = [['SH'], ['SH'], ['SH', 'NT'], ['NT'], ['GD'], ['VS'], ['TG'], ['DK'], ['SH', 'TG'], ['ID'], ['GN'], ['SH', 'GD']];
      var shSets = [['GLU', 'CHOL', 'TG', 'HDL', 'LDL', 'ALT', 'AST'], ['GLU', 'HBA1C', 'UREA', 'CREA', 'UA'], ['GLU', 'CHOL', 'TG', 'GGT', 'ABO_RH']];
      var today = new Date();
      for (var d = 75; d >= 0; d--) {
        var day = new Date(today.getTime() - d * 86400000);
        var ds = Utilities.formatDate(day, APP.TZ, 'yyyy-MM-dd');
        var n = day.getDay() === 0 ? 1 : Math.floor(rnd(1, 5));
        for (var k = 0; k < n; k++) {
          var pt = pick(patients);
          var combo = pick(combos);
          var panels = combo.map(function (c) { return c === 'SH' ? { panelCode: 'SH', tests: pick(shSets) } : { panelCode: c }; });
          var res = [];
          var withResult = d > 0 || Math.random() < 0.5;
          if (withResult) panels.forEach(function (pl) {
            var codes = pl.tests || Catalog.testsOfPanel(pl.panelCode).map(function (t) { return t.TestCode; });
            codes.forEach(function (c) {
              var t = tm[c];
              var v = DemoSeed.value_(t, pt.Gender);
              if (v !== '') res.push({ panelCode: pl.panelCode, testCode: c, value: v });
            });
          });
          var follow = Math.random() < 0.3 ? pick([7, 14, 30, 60, 90]) : 0;
          try {
            OrderService.create({ patientId: pt.PatientID, orderDate: ds, doctorName: pick(doctors), panels: panels,
              assignedTo: Math.random() < 0.8 ? [pick(['ktv', 'ktv', 'bacsi'])] : [],
              followUpDays: follow, paymentStatus: Math.random() < 0.85 ? 'PAID' : 'UNPAID',
              discount: Math.random() < 0.1 ? 20000 : 0, results: res }, ctx);
          } catch (e) { console.warn('seed order skipped', e.message); }
        }
      }
      GasShim.clearCache();
    },

    value_: function (t, gender) {
      if (!t) return '';
      var female = gender === 'Nữ';
      switch (t.ResultType) {
        case 'NUM':
          var mn = female ? (t.RefMinF !== null ? t.RefMinF : t.RefMinM) : t.RefMinM;
          var mx = female ? (t.RefMaxF !== null ? t.RefMaxF : t.RefMaxM) : t.RefMaxM;
          if (mn === null && mx === null) return String(Math.round(rnd(10, 60)));
          if (mn === null) mn = mx * 0.3;
          if (mx === null) mx = mn * 2.5;
          var v = rnd(mn * 0.85, mx * 1.18);
          return String(Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100);
        case 'QUAL': return Math.random() < 0.9 ? 'Negative' : 'Positive';
        case 'BLOOD': return pick(['A Rh+', 'B Rh+', 'O Rh+', 'AB Rh+']);
        default: return t.TestCode === 'U_MICRO' ? 'Normal' : '';
      }
    }
  };
})(window);
