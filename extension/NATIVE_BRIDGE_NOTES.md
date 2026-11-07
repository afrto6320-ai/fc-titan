# v3.10.1 missing isolated helpers and Aurora clock

The uploaded 3.10.0 log has valid extension runtime/version, a successfully prepared SDK price plan and no confirmed market response. It records undefined trade helper and repeated undefined `.get` errors. The earliest matching UI dereference is Modes.get in the dispatch activity log; that can stop both scan and run before Page.request(search). The logs do not establish an EA market rejection or a new provider failure. We do not have a live user DevTools stack proving the underlying browser loading mechanism.

The former manifest listed engine-modes.js, trade-core.js and ea-options.js in both worlds. The new isolated entry ui-helpers.js is deterministically built from these owned pure sources; MAIN retains the individual source files. No script URL is registered in both worlds. This removes reliance on shared URL loading/publication while keeping behavior identical. The manifest and generated-content regression guards against restoring the problematic arrangement or shipping stale helpers. Missing mode exports now produce UI_HELPERS_MISSING before dispatch instead of crashing a log statement; runtime diagnostics expose all helper states.

Browser regressions now evaluate each manifest entry individually in an actual Chromium isolated context rather than injecting a hand-built merged helper list. The normal case checks helper exports before exercising market scans and native purchases. The deliberately omitted entry case must render a reload diagnostic, disable dispatch and send zero market searches. These are manifest-plan/world tests, not an installed-extension test: a new attempt to load the extension through Chrome's Extensions.loadUnpacked protocol was rejected as disabled by the administrator. No administrator policy was changed or bypassed.

Aurora uses a top-pinned counter and a charcoal/copper digital instrument. It retains the same time/phase nodes and calculation source. Its bar shows actual waiting progress and an indeterminate animation during request processing; it does not claim a network completion percentage. Old default panel preferences migrate; custom counter placement is retained but made first within its column. Theme switching and the original native transaction/receipt guards remain unchanged.

---

# v3.10.0 strategies, dependent control settling and live themes

The previous choose handler returned readFilters immediately after setIndex. EA may update criteria and dependent interaction state on later tasks, so that snapshot can still show a locked Club; reopening League fetched a later snapshot. The new league path polls confirmed native criteria/selection and dependent readiness, bounded to two seconds, checks controller ownership and cancellation, and never forces a native lock open. The isolated UI tracks the pending choose operation and disables new searches while it completes. A browser fixture delays league criteria by 250ms and Club readiness by another 60ms; one click now suffices to enable and scope Club.

engine-modes.js implements independent pure profile policies. CODEX keeps existing behavior. Pharaoh and Deep cap automatic snipe collection to the first native page, while all manual scans retain the selected 1–100 count. Deep orders by an available exact-edition quote or native market reference, with price fallback, then waits a cancellable 180–320ms. Enhancer orders the selected native batch by Buy Now. Non-CODEX profiles count their chosen interval after cycle processing; they do not silently reset the user's interval values. The optional Max Bid ladder and Min Bid remain under the existing user settings in every profile.

Pharaoh/Enhancer sessions call services.Item.bid on the exact retained native item. CODEX/Deep call UTItemActionController.bid. Both branches share the existing immutable session identity, edition, rarity, price, wallet, spend/count, attempted-trade, unknown-receipt and isWon checks. Optional native moving follows confirmed accounting in both branches. No raw HTTP fallback, session capture, imported vendor engine, controller prototype modification or automatic sell action was added. MAIN advertises profile capability so the new UI can reject use against an old bridge rather than pretending an ignored profile was applied.

Auction history uses real Trade IDs from the preceding matching response. The UI defensively deduplicates exact IDs, preserves distinct auctions of a single player, and does not fabricate differences on fast repeated scans. Changing native filters clears previous display data; language changes restore caption provenance/time from the retained last response. These checks do not establish whether an identical live response reflects unchanged listings, server indexing or an internal cache.

Themes only reparent existing shadow UI panels and change styles. Classic preserves legacy panel preferences; Cockpit introduces a center column for statistics/engine; Aurora prioritizes the market in a wider center column. Saved arrangements are scoped to each validated theme, with local reset and responsive columns. Native controllers, session ledgers, inputs and ongoing requests are not recreated by a theme change. Header/language rebuilds restore panels by stable keys. The browser regression changes themes during an in-flight request and still confirms one purchase with unchanged session counts.

The corrected Pharaoh Sniper upload is byte-identical to the previously reviewed 1.1.0 archive; Deep and Enhancer also match the previously reviewed files. The initially supplied Pharaoh Scout is a read-only structure inspector and contributes no trading engine. Vendor archives and account logs remain outside the repository. Validation uses synthetic transport and original extracted EA methods in Chromium worlds; live account/provider performance remains unverified.

---

# v3.9.2 extension runtime price transport

Uploaded diagnostics show undefined `chrome.runtime.sendMessage`, null last provider status, an undefined isolated trade helper and a 3.9.0 UI. These support an extension loading/context problem before provider transport; they do not prove a new Futbin/FUT.GG HTTP denial. The SDK market replies in the same log include status 200 and repeated real Trade IDs; they do not prove purchases or a server-cache bypass.

A new ISOLATED-only client captures runtime/storage objects at initialization. It survives replacement of the global runtime property while the captured object remains valid, but does not claim to repair an invalidated Chrome context. Fixed message types, bounded response waits and separate missing-context/invalidated-context/worker errors preserve provider HTTP replies without retries. The UI records failure stage, versions and helper presence; there is no standalone provider fetch fallback from the EA page and no session export.

Node fixtures validate context replacement, invalidation, missing receivers, no response, timeout and a distinct provider 403. Chromium tests exercise the actual UI with a successful same-edition provider reply after global runtime replacement, then a missing API, visible reload guidance and exported failure-stage diagnostics. Existing native world/SDK/purchase tests remain in use. A separate attempt to load the unpacked extension in the provided headless Chromium produced neither an extension service worker nor injected host; it supplies no installed-extension validation. Live provider domains remain excluded by the enforced runtime policy, so provider reachability remains unverified.

The tool comparison is a static review of supplied files, including a safely extracted RAR. Vendor code and user logs remain outside the repository and were not executed. CODEX engine/purchase timing was not changed in this patch.

---

# v3.9.1 dependent clubs and price disclosure

Club options now reject missing/Any league before reading the native option collection. The selector's enabled state includes native EA interaction locks and the league requirement. A club picker token binds the current native league ID and rejects selection after a league change, even if the old collection happens to contain the same rows. Native league changes remain responsible for resetting dependent clubs; the returned snapshot updates the interface. No additional invented club catalogue or cross-league union is introduced.

Price controls use a native details disclosure with persisted open state. Fields remain mounted while closed, so quotes, caps and chosen editions do not change. Panel open states are restored by stable panel keys/IDs after language rebuilds, rather than by DOM index. HTTP 403 retains the provider failure and no-quote outcome, expands the price section, and explains that access denial does not identify an exact cause or guarantee a browser-site workaround. Existing provider code sends no EA cookies, makes no alternate-route retry after 403/429, and performs no silent fallback.

The environment still cannot reach the price-provider hosts under its enforced runtime policy. There is no live-account or live Futbin verification for this patch. Synthetic browser tests exercise native league reset, denied raw club requests, native lock/stale picker behavior, field order and denied-price prevention; Node tests retain provider denial/no-retry coverage.

---

# v3.9.0 native SDK search, view price linkage and compact controls

The supplied Network screenshot shows repeated successful XHR requests with `macr=6900&maxb=7000`. It proves requests were dispatched with identical visible parameters; HTTP 200 and ~70ms latency alone do not establish the source or lifetime of caching. There is no connection from this environment to the user's live DevTools session.

Source correction: `UTMarketSearchFiltersView.eMaxBuyPriceChanged` in captured compiled_3.js applies `UTCurrencyInputControl.getIncrementBelowVal` to reduce a conflicting Max Bid below Max Buy Now. Controller price handlers assign values independently, but later view setter events can rewrite earlier controller values. The previous adapter checked each field immediately; it now rechecks the full final tuple, rejecting a silent rewrite. A regression executes the original view method and reproduces 200000 -> 6900 at Max Buy Now 7000. This is a supported explanation for the screenshot, not a measurement of the user's running browser.

The new default MAIN route constructs `new UTSearchCriteriaDTO()`, calls its native `.update()` on the current confirmed search controller's criteria, clones array members, then assigns and verifies the four independent public price fields. A prepared plan binds the controller/navigation, criteria fingerprint, price tuple and creation time. The isolated UI retains a separate prepared-price record; it does not claim that the native screen fields changed. The screen route remains available and requires final prices to match exactly.

`UTMarketSearchResultsViewController._requestItems(page)` in the captured source establishes `services.Item.searchTransferMarket(criteria,page)` and successful `reply.data.items`. Native `EAConfigurationRepository.KEY_ITEMS_PER_PAGE / ITEMS_PER_PAGE.TRANSFER_MARKET` supplies page size (20 fallback). The SDK route explicitly clears local market cache per page, uses that service and observable contract, trims the overfetch sentinel, deduplicates Trade IDs, preserves original native item objects, and stops on the requested count (1–100), exhaustion, repeated page, cancellation, view/filter change, timeout or service failure. No raw UTAS fetch, auth extraction or global network monkeypatch is used. The native SDK may still normalize or cache a request; recorded prepared DTO values are not independent wire evidence.

SDK batches remain bound to their native filter controller/navigation and exact criteria. A purchase uses the original returned item with `UTItemActionController.bid`, the actual Buy Now price, immutable shared budget/count/identity checks and confirmed `isWon` receipt. Unknown outcomes still stop retries. Cancellation detaches read observers and prevents subsequent actions; a request already sent cannot be unsent. A successful transport does not prove a distinct market listing, purchase success, or a guaranteed race win.

Response comparison is bounded to 32 criteria/price tuples and uses actual Trade IDs and prices; ladder Max Bid is excluded from the comparison key so successive steps can be compared. Identical auctions stay visible and report zero new Trade IDs. Empty/error/cancelled scans clear previous rows/minimum. Pagination may expose more results beyond the chosen display cap. Native 429/challenge failures do not trigger queued retry storms. The separate player-name lookup remains the native local `getEntriesForString` catalogue, not a market request.

UI filters now use fixed-position vertical menus anchored to their own field, preserving form geometry. Menus close on second click, selection, outside interaction, Escape or hidden anchor. Start/Stop/Save/Scan reuse the existing actions in a bottom dock outside the scrolling shell; full-page results and toasts reserve dock space. Language rebuilds dispose the previous dock observer and controls.

Validation uses real Chromium MAIN/ISOLATED worlds, original extracted controller/view/bid methods and synthetic SDK transport. It covers independent increasing Max Bid/fixed Max Buy Now while the linked screen remains unchanged, serialized calls, real repeated/empty listings, 429, pagination, Stop, full UI SDK purchase and one session budget. This is not live-account verification and does not establish any fixed EA server cache duration or bypass.

---

# v3.8.0 fallback clock, bid ladder and navigation serialization

The user screenshot showed MM:SS, a missing phase and a paused activity ring despite native connection. That rendering matches the old early-return fallback when the isolated trade helper was absent. It does not establish why that helper was missing in the live browser. Browser helpers now export explicitly to window even if a CommonJS-shaped module global is present. The interface has independent monotonic clock math and starts/pauses its own Web Animation, with a CSS fallback; a browser regression deletes the isolated helper during a native session and verifies HH:MM:SS, the phase and continuing rotor motion.

The configurable Max Bid ladder operates through existing EA price handlers only. Each query starts at max(effective Max Buy Now, original Min Bid, original Max Bid, 150), rounded upward to a native tick, continues by native ticks to a configurable ceiling (default 200k, maximum 15m), then uses maxBid=0 once before wrapping. A segment-based calculation avoids walking every prior tick. It does not wrap after six requests. Counters are per native criteria and configured price tuple. The original fields, Min Bid, Buy Now cap, spend/count ledger, target identity and receipt checks remain intact. Uncapped bid searches still use all other filters and the requested result count; no claim is made that cache keys force network/server freshness or guarantee every auction.

The page bridge now locks awaited native commands as well as active search/buy, preventing a delayed connect/options operation from overlapping another search. Cancel invalidates pending navigation. Search and purchase ownership follow navigation identity plus the exact underlying results controller, allowing an EA split/list wrapper transition without accepting another controller's results. Real Back/view changes still reject and clear the batch, with bounded visible EA error notices when available. No global network interception or raw UTAS request is introduced.

Saved v2 presets contain native filter IDs and selected target metadata, then restore via original option handlers and exact-ID selection. The introduction visibility is persistent; hidden content reflows the layout. Positions skip invalid sentinel values and are rendered under the rating. Pinned-card enrichment requires the same definition ID or the verified base edition.

New tests use the original native search/price/bid contracts with synthetic transport and real browser worlds. They do not prove an installed extension on the user's live EA account, nor that the same visible live error can never occur for a genuine EA server rejection or navigation change.

---

# v3.7.0 player rotation, local freshness and workspace controls

Local market cache eviction is explicit before native eSearchSelected (which also evicts it) and before native page requests. Rapid manual clicks are coalesced into one trailing request; requests never intentionally overlap, stale generations cannot replace current results, and partial/cancelled responses remain hidden. No bid-price jitter or raw UTAS parameter/cache manipulation was added. A fresh observable event does not prove bypass of EA server caches or indexing delays. The player-name picker is a local catalogue and is expected to return the same matching players.

Native static entries/listings supply preferredPosition/position; numeric positions resolve through the live PlayerPosition enum. Missing metadata remains unavailable. Player IDs and listing Trade IDs are deduplicated separately; distinct auctions of the same player remain visible. Previously attempted Trade IDs are skipped without a second bid, including across completed sessions; uncertain purchases still block starting again.

beginSession snapshots an allowlist of at most 12 player/edition/rarity targets and one immutable spend/count ledger. rotateTarget requires the same session, an allowed target key, a confirmed native player/rarity snapshot, native price agreement and a same-edition/platform fresh quote where configured. It changes target constraints without resetting spent or buys. Filters are restored using native option IDs; stale suggestion tokens are refreshed with exact ID matching, never name-only substitution. Stop invalidates pending selection work and queued manual scans.

Panel ordering moves existing nodes and persists only known panel keys. Player suggestions collapse after selection; saved targets stay visible. Results never enter full-page mode automatically. The activity rotor uses compositor CSS animation with run/stop state in addition to monotonic display calculations, so it does not depend on SVG progress sampling. Confirmed receipts and missed responses produce bounded transient toasts and optional Web Audio tones after user gesture; no notification permission, remote audio or external messaging is used.

Futbin 400 handling can retry the base-player + exact resource-ID query on the same provider route with IDs already confirmed by EA. The parser still requires the exact edition key and requested platform, including known LCPrice/lcPrice/LCPriceMin fields. HTTP 403/429 is not retried through another format. Provider status/format errors are exported without URLs containing price-access signatures. The live route still could not be validated under the restricted environment network policy, and fixture tests do not establish provider availability or live EA trading.

---

# v3.6.0 fresh scans, native pagination, provider references and destinations

The uploaded v3.5 log contains repeated “Native search controller is not current” errors and a lowest-price read of a previous five-item result. The old capture/lowest buttons only read memory; they did not dispatch a search. The unified manual scan now reconnects the current filter controller, applies current prices and invokes native eSearchSelected. Native option pickers also reconnect when invoked from the results screen.

compiled_3.js defines eSearchSelected with services.Item.clearTransferMarketCache before opening results. UTMarketSearchResultsViewController._requestItems(page) calls the game's searchTransferMarket, emits onDataChange, trims an overfetched sentinel to paginationViewModel.getNumItemsPerPage(), updates its page model, and falls back to the previous page when a later page is empty. The adapter observes fresh events, trims the sentinel, defers pagination until EA finishes its page update, deduplicates by Trade ID and stops on exhaustion/repeated page. It never changes Min Bid or manufactures a different result. Fresh event/local cache eviction do not establish that EA's server bypassed all caches. Multiple pages are not an atomic market snapshot.

The batch retains actual EA items from all collected pages and the current controller identity; the purchase wrapper is unchanged. Native move evidence is compiled_2.js UTItemActionController.move(item, ItemPile.CLUB / TRANSFER), returning the observable from services.Item.move. A successful response must include the purchased instance ID in data.itemIds. Purchase receipt accounting precedes optional moving; move errors are returned separately and cannot trigger a second bid. Cancellation prevents a move which has not yet been dispatched.

Public provider routes/formats were reviewed in uploaded Deep Snipe source. The new adapters do not integrate its engine, session extraction, interception or provider/platform fallback. FUT.GG signing is a normal public price-access request, stops on challenges and validates the returned URL against the requested exact IDs/platform and fixed HTTPS route. Futbin prices require the requested platform's LCPrice. An omitted, extinct, malformed or failed quote is not zero and never becomes another edition/platform's quote. Retrieval time is known; provider update time is not. Quotes expire after 90 seconds and are renewed during sessions; the original user-entered Max Buy Now remains the immutable hard ceiling.

Runtime network policy rejected CONNECT to www.fut.gg and www.futbin.com with HTTP 403 in this environment. Price adapters were validated with mocked fetch/browser messages, not live provider responses. Their domains were added only to the environment configuration draft, which was not published. No live EA bid/move was executed. Existing browser-world/source contracts plus new scan/pagination/cancellation/reference/move regressions pass with synthetic transport. The installed extension itself remains unverified in this Chromium.

---

# v3.5.0 native purchase and catalogue contracts

The uploaded 3.4.2 log confirmed a response of nine listings followed by a failed DOM identity bridge. The purchase stage must use original native objects rather than recover them from CSS rows.

Source evidence in compiled_3.js: UTItemDetailsViewController.eBidConfirmed calls itemActionController.bid(currentItem, requestedBid), observes the response, and checks currentItem.getAuctionData().isWon(). compiled_2.js defines UTItemActionController.bid as the wrapper for services.Item.bid; UTTransfersDAO.bid updates the original item from EA's auction response before notifying observers. The extension uses that controller wrapper and preserves the object reference.

The native catalogue contract is services.Item.searchConceptItems(UTSearchCriteriaDTO), observed as an EA observable. Search-view-model setPlayerData uses defId=[player.id] for concept searches. Only returned editions matching the selected native databaseId are used. No raw auth extraction, network interception, or copied Deep Snipe engine is added.

Purchase sessions bind price caps, spend caps, purchase count and criteria. Result batches bind searchId, controller identity and original items. A dispatched bid has one attempt per Trade ID; unknown outcomes stop and prohibit automatic retry. Stop cannot undo a dispatched EA request, so a confirmed late receipt is accounted separately.

Estimated loss uses expected resale net of 5% tax, divided by actual purchase cost. Manual reference is preferred; a positive native per-item market average is an approximate fallback, not guaranteed live resale. No reference means unknown loss, not a claimed zero loss.

Local synthetic tests exercise the original extracted UTItemActionController.bid function in addition to filter/search handlers, with mocked EA transport. This validates contracts and the browser-world boundary, not live-account trading or installed-extension behavior.

---

# v3.4.2 contract corrections

The user report showed that native EA suggestions were present, while the selected target still held catalogue Item ID 50540979. The adapter must resolve and confirm the base Player ID without silently replacing the requested card definition.

EA source evidence:
- UTItemEntity.databaseId returns definitionId & ItemIdMask.DATABASE (compiled_2.js).
- ItemIdMask assigns 0xffffff to its database part in the provided ocompiled.js.
- UTLocalizationUtil.hasLocalizationString compares localize(key) with '*' + key. The previous detector's trailing-only marker handling was incomplete.
- UTPlayerItemView.setPortrait calls AssetLocationUtils.getPortraitImageUri(item.databaseId) for standard portraits.

The player pool protocol preserves the exact entry returned for the original query. Legacy catalogue recovery uses the live EA mask, followed by an exact-ID lookup. No name-only match can confirm a different player. Images remain native URI candidates, not a guarantee of availability.

Deep Snipe review is recorded separately in DEEP_SNIPE_REVIEW_AR.md; its source, session-reading and network hooks were not integrated.

---

# v3.4.1 option provenance

The uploaded user reports show successful MAIN-world connection, native player selection, filter updates, and nine confirmed empty searches in v3.4.0. They do not prove that every club name/logo resolves or that every filter has market listings.

The original UTDataProviderFactory.getNationDP concatenates TOP_NINE_NATIONS with the full nation collection, which can repeat identities. Club entries are constructed from teamConfigRepo.getTeams using native team IDs and localized names; unresolved localization keys can therefore arrive from EA itself. Equal labels can also belong to different IDs.

The new ea-options.js adapter keeps original native indices, removes duplicate ID/value identities, exposes ID/league provenance, and never fabricates a resolved name. Image candidates use only the native icon table and UTItemSearchView.generateFilterImage(enumId, entry.id, entry.value). Failed URLs are reported as unavailable rather than substituted with another team's badge.

The source bundles and uploaded account reports remain outside the repository. The new release has only been exercised in local synthetic browser tests, not on a live account.

---

# Native bridge implementation notes

The supplied archive contains real EA JavaScript and one rendered market-filter page. Vendor bundles, captured account pages, and API responses are deliberately excluded from this extension and its repository.

Verified source contracts:
- compiled_3.js, AUCTION deep-link callback: getAppMain().getRootViewController(), setGameViewTab(UTGameTabBarController.TabTag.TRANSFERS), presented tab controller, current navigation controller, filter-controller initialization and push.
- compiled_2.js: UTNavigationController.getCurrentController, popToViewController, UTDropDownControl.getOptions/setIndex, UTItemSearchViewModel.setPlayerData/updateFromFilterChange, and market eligibility.
- compiled_3.js: native filter-controller price handlers, eFilterChanged, ePlayerNameChanged and eSearchSelected; local player engine getEntriesForString/selectPlayerEntry; onDataChange result event.
- compiled_4.js: Transfers hub respects market access and platform-split settings.

The extension reuses the current Transfers stack when possible. It never patches EA prototypes, extracts authentication, calls raw UTAS endpoints, or loads archived bundles into the user's page. Commands are a fixed allowlist with bounded JSON responses. The existing purchase UI path remains experimental; this release does not add a native purchase-service operation.

Testing: three Node test files passed; seven DOM-navigation regressions passed; the DOM UI integration passed; nine native function test groups passed. Native tests execute seven selected original controller methods extracted at test time from the captured bundle in a synthetic runtime. A real Chromium isolated world exercises the page-message boundary. Runtime/storage APIs are stubs; installed-extension behavior and live EA requests/purchases remain unverified. Earlier attempts to load an unpacked extension in the available Chromium did not activate it, so installation is not counted as passed.

Source fingerprints (SHA-256, provenance only):

```json
{
  "compiled_2.js": "2cc8aec08628ea78c361b16456c93d672e1e80219ed246af0ace61f1b1018f83",
  "compiled_3.js": "2442488651aa9c9fe68f7dd20dd8418e71affa3060f97f49876bbf77f6f9c80a",
  "compiled_4.js": "d5aacfdfe5b3afa9b5122454d5c5fb9876e199035b5c5618dfd3c02b0587d267"
}
```
