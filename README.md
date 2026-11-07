# fc-titan
AI-powered EA FC Ultimate Team Trading Platform


## CODEX SNIPE browser extension

The uploaded **player-sync variant v3.17.1** is in `variants/player-sync/`: [download CODEX_SNIPE_v3.17.1.zip](downloads/CODEX_SNIPE_v3.17.1.zip). It keeps the supplied v3.17 player-sync interface and adds optional Off / Min Bid / regular Max Bid / smart Max Bid ladders for scans and sniping, with Enhancer as the default search route for fresh settings. Smart Max Bid starts above the current native Buy Now cap without raising the purchase price. See its [usage and verification notes](variants/player-sync/README_AR.md). This is a separate source variant from the earlier three-theme build below.

Source: `extension/` (Manifest V3, v3.10.1). Load the complete directory as an unpacked extension and reload the FC Web App.

Download: [CODEX_SNIPE_v3.10.1.zip](downloads/CODEX_SNIPE_v3.10.1.zip). Choose Classic, Cockpit or Aurora from the top bar: each combines a different palette and panel arrangement, with independent saved panel ordering. Cockpit places players/filters left, session statistics and engine controls in the center, and results/logs right. Aurora now uses charcoal/copper colors, a digital clock and a top-pinned counter; the new default places counters/engine left, players center, and results/logs right. Themes move existing controls and retain live session state.

CODEX remains the default strategy. Three additional EA-native profiles offer Pharaoh first-page/first-match sniping, Deep reference ranking with a cancellable pre-buy delay, and Enhancer paginated/cheapest-first selection. All manual scans respect the chosen result count and never buy; all purchase routes retain original item identity, hard limits and confirmed EA receipts. See [the comparison](extension/TOOL_COMPARISON_AR.md) for the distinction between these independent profiles and the original uploaded tools.

The isolated UI helpers ship in a dedicated generated entry, with distinct script URLs from MAIN and explicit missing-helper diagnostics. League changes now wait for native dependent-control updates. Auction rows deduplicate Trade IDs and label IDs already returned in the preceding matching response; different auctions of the same player remain visible. Every search logs its prepared bid ladder and Buy Now values. The initialized extension API client separates local runtime failures from provider HTTP denials. Live provider availability and live-account performance are unverified.

See `extension/README_AR.md` for usage and known limitations and `extension/NATIVE_BRIDGE_NOTES.md` for the source contracts and validation evidence.

From `extension/`:

```sh
python build_helpers.py --check
node --test tests/*.test.cjs
python tests/native_navigation.py
python tests/features_v33.py
FC_EA_SOURCE_DIR=/path/to/captured/web-app/js python tests/page_functions.py
```

After editing engine-modes.js, trade-core.js or ea-options.js, regenerate the shipped UI entry with `python extension/build_helpers.py` from the repository root. The downloadable ZIP already includes it.

Browser checks require Playwright and Chromium. Native contract tests require the separately captured EA source; vendor bundles and account captures are not included. Tests use synthetic pages and do not prove live EA trading or purchases.
