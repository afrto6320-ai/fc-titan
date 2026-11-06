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
