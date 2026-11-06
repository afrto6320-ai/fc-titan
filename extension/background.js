const FUTGG_BASE = "https://www.fut.gg/api/fut/players/v2/27/";
const DATASET_URL = "https://raw.githubusercontent.com/LakshmiKanth11/EA_FC_ANALYSIS/main/EA_FC_PLAYERS_DATASET_AND_%20DASHBOARD/data/players.csv";
const REQUEST_TIMEOUT_MS = 8500;
const MIN_REQUEST_GAP_MS = 2500;
let lastRequestAt = 0;
let requestTail = Promise.resolve();

function cleanText(value, max = 80) {
  return String(value ?? "").trim().slice(0, max);
}

function safeImageUrl(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  try {
    if (/^2026\//i.test(source.replace(/^\/+/, ""))) {
      const path = source.replace(/^\/+/, "");
      return `https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto,width=120/${path}`;
    }
    const url = new URL(source.startsWith("//") ? `https:${source}` : source.startsWith("/") ? `https://www.fut.gg${source}` : source);
    if (["www.fut.gg", "game-assets.fut.gg"].includes(url.hostname) && url.protocol === "https:") return url.href;
  } catch {}
  return "";
}

function normalizeCard(item) {
  // FUT.GG distinguishes the base player id from the individual card's EA id.
  const eaItemId = Number(item?.eaId || item?.playerItemId || item?.itemId) || null;
  const basePlayerId = Number(item?.basePlayerEaId || item?.playerId || item?.eaPlayerId || item?.player?.eaId || item?.player?.id) || null;
  const futggId = Number(item?.resourceId || item?.definitionId || item?.cardId || item?.id) || null;
  const name = cleanText(item?.commonName || item?.cardName || [item?.firstName, item?.lastName].filter(Boolean).join(" ") || item?.name, 100);
  const imageCandidate = item?.imageUrl || item?.imagePath || item?.cardImageUrl || item?.simpleCardImageUrl || item?.cardImagePath || item?.playerImageUrl || item?.image || "";
  const rarityValue = item?.rarityName || item?.rarity?.name || item?.rarity?.shortName || item?.cardType || item?.rarity || "";
  const faceStats = {};
  for (const key of ["pace", "shooting", "passing", "dribbling", "defending", "physicality"]) {
    const value = Number(item?.[key] ?? item?.stats?.[key]);
    if (Number.isFinite(value) && value > 0) faceStats[key] = value;
  }
  const stylesRaw = Array.isArray(item?.playstyles) ? item.playstyles : Array.isArray(item?.playStyles) ? item.playStyles : [];
  const styles = stylesRaw.map(style => typeof style === "string" ? style : cleanText(style?.name || style?.shortName || style?.label || style?.playstyleName, 40)).filter(Boolean);
  return {
    key: `item:${eaItemId || futggId || basePlayerId || name.toLowerCase()}`,
    itemId: eaItemId,
    futggId,
    playerId: basePlayerId,
    assetId: Number(item?.assetId || item?.asset_id) || null,
    name: name || "Unknown player",
    rating: Number(item?.overall || item?.rating || item?.ovr) || null,
    position: cleanText(item?.position || item?.preferredPosition, 8).toUpperCase(),
    rarity: cleanText(rarityValue?.name || rarityValue, 40),
    club: cleanText(item?.club?.name || item?.clubName || item?.club, 60),
    clubId: Number(item?.club?.eaId || item?.club?.id || item?.clubId) || null,
    league: cleanText(item?.league?.name || item?.leagueName || item?.league, 60),
    leagueId: Number(item?.league?.eaId || item?.league?.id || item?.leagueId) || null,
    nation: cleanText(item?.nation?.name || item?.nationName || item?.nation, 60),
    nationId: Number(item?.nation?.eaId || item?.nation?.id || item?.nationId) || null,
    price: Number(item?.price) > 0 ? Number(item.price) : null,
    imageUrl: safeImageUrl(imageCandidate),
    stats: faceStats,
    playstyles: styles,
    skillMoves: Number(item?.skillMoves || item?.skill_moves) || null,
    weakFoot: Number(item?.weakFoot || item?.weak_foot) || null,
    preferredFoot: cleanText(item?.preferredFoot || item?.preferred_foot, 10),
    source: "FUT.GG player catalogue",
    updatedAt: new Date().toISOString()
  };
}

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS, format = "json") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json,text/csv;q=0.9,*/*;q=0.8" },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) {
      const error = new Error(`Provider returned HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    // Consume the response body before clearing the timeout; otherwise a stalled
    // body transfer could outlive the nominal request timeout.
    return format === "text" ? await response.text() : await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function rateLimitedFetch(url, type) {
  const execute = async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_REQUEST_GAP_MS - (now - lastRequestAt));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return fetchWithTimeout(url, type === "dataset" ? 30000 : REQUEST_TIMEOUT_MS, type === "dataset" ? "text" : "json");
  };
  const next = requestTail.then(execute, execute);
  requestTail = next.catch(() => undefined);
  return next;
}

async function searchFutgg(payload) {
  const query = cleanText(payload.query, 60);
  if (query.length < 2) throw new Error("اكتب حرفين على الأقل للبحث.");
  const params = new URLSearchParams();
  params.set("name", query);
  params.set("response_format", "card-image");
  if (payload.minRating) params.set("overall__gte", String(Math.max(1, Math.min(99, Number(payload.minRating)))));
  if (payload.maxRating) params.set("overall__lte", String(Math.max(1, Math.min(99, Number(payload.maxRating)))));
  if (payload.position) {
    params.set("positions", cleanText(payload.position, 8).toUpperCase());
    params.set("alternative_positions", "true");
  }
  const page = Math.max(1, Math.min(50, Math.trunc(Number(payload.page) || 1)));
  params.set("page", String(page));
  const url = `${FUTGG_BASE}?${params.toString()}`;
  const startedAt = Date.now();
  const body = await rateLimitedFetch(url, "players");
  const raw = Array.isArray(body?.data) ? body.data : Array.isArray(body?.players) ? body.players : Array.isArray(body?.results) ? body.results : [];
  return {
    items: raw.map(normalizeCard).filter(card => card.name !== "Unknown player"),
    count: raw.length,
    next: Boolean(body?.next),
    page,
    elapsedMs: Date.now() - startedAt,
    source: "FUT.GG",
    note: "النتائج من كتالوج بطاقات خارجي، وليست عروضًا مباشرة من سوق EA. لا يتم جلب عروض السوق أو تنفيذ عمليات شراء. إذا رفض المصدر الطلب، لن نحاول تجاوز الحماية."
  };
}

async function fetchRatingsDataset() {
  const text = await rateLimitedFetch(DATASET_URL, "dataset");
  if (text.length < 1000 || !/player_id/i.test(text.slice(0, 2000))) {
    throw new Error("ملف البيانات لا يبدو بصيغة اللاعبين المتوقعة.");
  }
  return { csv: text, source: "Community snapshot derived from EA public ratings", snapshotDate: "2026-09-12" };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return;
  if (message.type === "GPTS_SEARCH_FUTGG") {
    searchFutgg(message.payload || {})
      .then(result => sendResponse({ ok: true, result }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || "تعذر البحث"), status: Number(error?.status) || 0 }));
    return true;
  }
  if (message.type === "GPTS_FETCH_RATINGS_DATASET") {
    fetchRatingsDataset()
      .then(result => sendResponse({ ok: true, result }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || "تعذر تحميل قاعدة اللاعبين"), status: Number(error?.status) || 0 }));
    return true;
  }
  if (message.type === "GPTS_OPEN_DASHBOARD") {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }
});
