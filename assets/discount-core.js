/**
 * discount-core.js – Lõi tính chiết khấu tự động (hàm thuần, không gọi Sheets/DOM).
 * DÙNG CHUNG: trình duyệt (xem trước khi tạo phiếu) và máy chủ (backend/12_Discount.gs giữ bản sao y hệt – có test đối chiếu).
 *
 * Quy tắc (rules[]): { RuleID, Kind: 'PANEL'|'RETURN', Tier: 'ALL'|'NORMAL'|'VIP'|'VVIP', PanelCode ('*' = mọi nhóm),
 *                      Mode: 'PERCENT'|'AMOUNT', Value, FromDate 'yyyy-mm-dd', ToDate ('' = không giới hạn), IsActive }
 * Thứ tự: ① giảm theo nhóm XN trên tiền từng nhóm (nhiều quy tắc khớp → lấy mức có lợi nhất)
 *         ② giảm tái khám theo hạng BN trên phần tổng còn lại (cộng dồn) – hoặc chỉ lấy mức cao hơn nếu stack = false.
 */
(function (root) {
  'use strict';
  function money(v) { return String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  function compute(o) {
    var rules = o.rules || [], lines = o.lines || [], tier = o.tier || 'NORMAL', date = String(o.date || '');
    var R = Number(o.round) > 0 ? Number(o.round) : 1;
    var stack = o.stack !== false;
    var tierLabels = o.tierLabels || { NORMAL: 'Thường', VIP: 'VIP', VVIP: 'VVIP' };
    var names = o.panelNames || {};
    var rnd = function (x) { return Math.round(x / R) * R; };
    var fmt = function (r) { return r.Mode === 'PERCENT' ? Number(r.Value) + '%' : money(r.Value) + 'đ'; };
    var amt = function (r, base) {
      var v = Number(r.Value) || 0;
      var d = r.Mode === 'PERCENT' ? rnd(base * v / 100) : v;
      return Math.max(0, Math.min(base, d));
    };
    var act = rules.filter(function (r) {
      return r && (r.IsActive === true || r.IsActive === 'TRUE' || r.IsActive === 1) &&
        (!r.FromDate || String(r.FromDate) <= date) && (!r.ToDate || date <= String(r.ToDate)) &&
        (!r.Tier || r.Tier === 'ALL' || r.Tier === tier);
    });
    var gross = lines.reduce(function (s, l) { return s + (Number(l.Amount) || 0); }, 0);

    var panelItems = [];
    lines.forEach(function (l) {
      var base = Number(l.Amount) || 0;
      if (base <= 0) return;
      var best = null, bestAmt = 0;
      act.forEach(function (r) {
        if (r.Kind !== 'PANEL' || (r.PanelCode !== '*' && r.PanelCode !== l.PanelCode)) return;
        var a = amt(r, base);
        if (a > bestAmt) { best = r; bestAmt = a; }
      });
      if (best) panelItems.push({ kind: 'PANEL', ruleId: best.RuleID, panelCode: l.PanelCode, amount: bestAmt,
        label: 'KM ' + (names[l.PanelCode] || l.PanelCode) + ' ' + fmt(best) });
    });
    var panelSum = panelItems.reduce(function (s, i) { return s + i.amount; }, 0);

    var ret = null;
    if (o.isReturn) {
      var base2 = stack ? gross - panelSum : gross, bestR = null, bestRA = 0;
      act.forEach(function (r) {
        if (r.Kind !== 'RETURN') return;
        var a = amt(r, base2);
        if (a > bestRA) { bestR = r; bestRA = a; }
      });
      if (bestR) ret = { kind: 'RETURN', ruleId: bestR.RuleID, amount: bestRA, label: 'Tái khám ' + (tierLabels[tier] || tier) + ' ' + fmt(bestR) };
    }
    var items = stack ? panelItems.concat(ret ? [ret] : []) : (ret && ret.amount > panelSum ? [ret] : panelItems);
    var total = Math.min(gross, items.reduce(function (s, i) { return s + i.amount; }, 0));
    return { gross: gross, total: total, items: items, isReturn: !!o.isReturn,
             detail: items.map(function (i) { return i.label + ' (−' + money(i.amount) + ')'; }).join('; ') };
  }

  var api = { compute: compute, money: money };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.LisDiscount = api;
})(typeof window !== 'undefined' ? window : this);
