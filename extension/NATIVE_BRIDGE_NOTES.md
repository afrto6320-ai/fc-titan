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
