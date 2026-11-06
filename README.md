# fc-titan
AI-powered EA FC Ultimate Team Trading Platform


## CODEX SNIPE browser extension

Source: `extension/` (Manifest V3, v3.7.0). Load that directory as an unpacked extension, reload the FC Web App, then use **Connect to EA Market**.

Download: [CODEX_SNIPE_v3.7.0.zip](downloads/CODEX_SNIPE_v3.7.0.zip). The workspace pins up to 12 player targets, rotates them in one budgeted native session, and supports persistent panel ordering and optional full-page results. The unified market scan requests EA again, gathers up to 100 listings using native pagination and derives the minimum from that response. Optional exact-edition FUT.GG/Futbin prices are independent references, not EA listings.

See `extension/README_AR.md` for usage and known limitations and `extension/NATIVE_BRIDGE_NOTES.md` for the source contracts and validation evidence.

From `extension/`:

```sh
node --test tests/*.test.cjs
python tests/native_navigation.py
python tests/features_v33.py
FC_EA_SOURCE_DIR=/path/to/captured/web-app/js python tests/page_functions.py
```

Browser checks require Playwright and Chromium. Native contract tests require the separately captured EA source; vendor bundles and account captures are not included. Tests use synthetic pages and do not prove live EA trading or purchases.
