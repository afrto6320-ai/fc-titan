/* GPT SNIPE standalone validation & filter logic. No hidden network requests. */
(() => {
  "use strict";
  const toLatin = value => String(value ?? "").replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x6f0));
  const text = value => toLatin(value).normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
  function coins(value) {
    const source = toLatin(value).toLowerCase().replace(/\u00a0/g, " ").replace(/[\s,،٬]/g, "");
    const matched = source.match(/^(\d+(?:\.\d+)?)([km])?$/);
    if (!matched) return null;
    const result = Number(matched[1]) * (matched[2] === "k" ? 1000 : matched[2] === "m" ? 1_000_000 : 1);
    return Number.isSafeInteger(result) && result > 0 ? result : null;
  }
  function clampNumber(value, min, max) { const v = Number(value); return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.trunc(v))) : min; }
  function options(raw = {}) {
    return {
      target: String(raw.target || "").trim().slice(0, 80),
      itemId: String(raw.itemId || "").trim().slice(0, 30),
      rarity: String(raw.rarity || "").trim().slice(0, 40),
      minRating: raw.minRating === "" || raw.minRating == null ? 0 : clampNumber(raw.minRating, 1, 99),
      maxRating: raw.maxRating === "" || raw.maxRating == null ? 0 : clampNumber(raw.maxRating, 1, 99),
      maxPrice: clampNumber(raw.maxPrice, 0, 15_000_000),
      maxSpend: clampNumber(raw.maxSpend, 0, 30_000_000),
      maxBuys: clampNumber(raw.maxBuys || 1, 1, 30),
      maxSearches: clampNumber(raw.maxSearches || 30, 1, 300),
      intervalMs: clampNumber(raw.intervalMs || 4000, 600, 120000),
      autoBuy: raw.autoBuy === true
    };
  }
  function randomInterval(minMs, maxMs, random = Math.random) {
    const lo = clampNumber(minMs,600,60000), hi=clampNumber(maxMs,600,60000);
    if(hi<lo)throw Error('Invalid speed interval range');
    const r=Number(random());if(!Number.isFinite(r)||r<0||r>=1)throw Error('Invalid random sample');
    return lo+Math.floor(r*(hi-lo+1));
  }
  function validate(o) {
    if (!o.maxPrice || o.maxPrice < 150) throw Error("حدد Max Buy Now أكبر من أو يساوي 150 Coins.");
    if (!o.maxSpend || o.maxSpend < o.maxPrice) throw Error("حدد ميزانية لا تقل عن Max Buy Now.");
    if (o.minRating && o.maxRating && o.minRating > o.maxRating) throw Error("الحد الأدنى للتقييم أكبر من الحد الأقصى.");
    if (!/^[0-9]*$/.test(o.itemId)) throw Error("Player / Item ID يجب أن يتكوّن من أرقام فقط.");
    return o;
  }
  function match(card, o) {
    if (!card || !Number.isSafeInteger(card.price) || card.price <= 0) return { ok: false, reason: "السعر غير موثوق" };
    if (card.price > o.maxPrice) return { ok: false, reason: "السعر أعلى من الحد" };
    if (o.target && !text(card.name).includes(text(o.target))) return { ok: false, reason: "الاسم مختلف" };
    if (o.itemId && String(card.itemId ?? "") !== o.itemId) return { ok: false, reason: "ID غير ظاهر أو مختلف" };
    if (o.minRating && (!card.rating || card.rating < o.minRating)) return { ok: false, reason: "التقييم أقل أو غير معروف" };
    if (o.maxRating && (!card.rating || card.rating > o.maxRating)) return { ok: false, reason: "التقييم أعلى أو غير معروف" };
    if (o.rarity && (!card.rarity || !text(card.rarity).includes(text(o.rarity)))) return { ok: false, reason: "نوع البطاقة غير مطابق أو غير معروف" };
    return { ok: true, reason: "مطابق" };
  }
  function canBuy(card, o, spent, purchased) {
    const condition = match(card, o);
    if (!condition.ok) return condition;
    if (purchased >= o.maxBuys) return { ok:false, reason:"الحد الأقصى للمشتريات" };
    if (spent + card.price > o.maxSpend) return { ok:false, reason:"تجاوز الميزانية" };
    return { ok: true, reason: "مسموح" };
  }
  const core = Object.freeze({ text, coins, options, validate, match, canBuy, randomInterval });
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (typeof window !== "undefined") window.GPTSnipeCore = core;
})();
