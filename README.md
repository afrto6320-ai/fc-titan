# fc-titan
AI-powered EA FC Ultimate Team Trading Platform


## CODEX SNIPE browser extension

Source: `extension/` (Manifest V3, v3.4.2). Load that directory as an unpacked extension, reload the FC Web App, then use **Connect to EA Market**.

See `extension/README_AR.md` for usage and known limitations and `extension/NATIVE_BRIDGE_NOTES.md` for the source contracts and validation evidence.

From `extension/`:

```sh
node --test tests/*.test.cjs
python tests/native_navigation.py
python tests/features_v33.py
FC_EA_SOURCE_DIR=/path/to/captured/web-app/js python tests/page_functions.py
```

Browser checks require Playwright and Chromium. Native contract tests require the separately captured EA source; vendor bundles and account captures are not included. Tests use synthetic pages and do not prove live EA trading or purchases.
