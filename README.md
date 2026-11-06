# fc-titan
AI-powered EA FC Ultimate Team Trading Platform


## CODEX SNIPE browser extension

Source: `extension/` (Manifest V3, v3.9.4). Load that directory as an unpacked extension, reload the FC Web App, then use **Connect to EA Market**.

Each native scan/snipe dispatch logs its prepared Min/Max Bid and Buy Now values, ladder step or fixed-bid mode. Small interface text is slightly larger and heavier, with existing card, portrait, input and action-bar dimensions preserved. The price bridge retains its initialized extension API and distinguishes an expired/missing extension context from a provider HTTP rejection. See [the uploaded-tool comparison](extension/TOOL_COMPARISON_AR.md) for static search/purchase/timing evidence and limitations.

Download: [CODEX_SNIPE_v3.9.4.zip](downloads/CODEX_SNIPE_v3.9.4.zip). Club choices require a confirmed native league, price reference controls fold away, and edition/rating fields use the revised compact order. MAIN-world EA SDK searches are now the default, using a cloned native criteria DTO; the original screen search remains selectable. This avoids the native view linking Max Bid to Max Buy Now. Anchored vertical filter menus close on a second click or selection, and persistent Start/Stop/Scan controls stay visible while scrolling and in full-page results. Real repeated Trade IDs are disclosed without hiding their listings. Optional Max Bid ladder searches preserve the Buy Now cap and periodically remove the bid ceiling. The clock now has an independent fallback and the header can save native filters and hide its introduction. The workspace pins up to 12 player targets, rotates them in one budgeted native session, and supports persistent panel ordering and optional full-page results. The unified market scan requests EA again, gathers up to 100 listings using native pagination and derives the minimum from that response. Optional exact-edition FUT.GG/Futbin prices are independent references, not EA listings.

See `extension/README_AR.md` for usage and known limitations and `extension/NATIVE_BRIDGE_NOTES.md` for the source contracts and validation evidence.

From `extension/`:

```sh
node --test tests/*.test.cjs
python tests/native_navigation.py
python tests/features_v33.py
FC_EA_SOURCE_DIR=/path/to/captured/web-app/js python tests/page_functions.py
```

Browser checks require Playwright and Chromium. Native contract tests require the separately captured EA source; vendor bundles and account captures are not included. Tests use synthetic pages and do not prove live EA trading or purchases.
