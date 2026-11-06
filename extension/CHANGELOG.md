# 3.7.0
- Keep market results embedded by default; full-page display is explicitly toggled.
- Combine player search and transfer controls, move pricing into transfer filters and native connection below activity logs, and persist reversible panel ordering without rebuilding controls.
- Pin native portraits/positions in compact target cards; collapse suggestions on selection and add up to 12 distinct players.
- Rotate native player/rarity filters through one MAIN session ledger. Preserve total spending and purchase caps and revalidate target identity/quote after every switch.
- Coalesce rapid manual clicks into one trailing fresh scan, explicitly evict local market cache before searches/pages, deduplicate native player IDs/Trade IDs, and skip previously attempted trades without rebidding.
- Add an independent CSS activity rotor, transient confirmed/missed toasts, and optional gesture-unlocked Web Audio tones.
- Add Futbin 400 base-player/resource-ID query formatting, same-platform price-field aliases, structured HTTP/HTML errors and sanitized provider diagnostics. Live provider access remains unverified.
- Extend native/browser regressions for shared multi-player budgets, fast-click serialization, pinned cards, positions, layout controls, visible rotor animation, toast/audio and duplicate attempts.

# 3.6.0
- Merge results and minimum into a full-page vertical market view; manual Scan dispatches a fresh native search using current filters instead of reading the previous batch.
- Add user-selected 1–100 results with native pagination, sentinel trimming, Trade ID deduplication, response provenance and repeated-response disclosure. Clear listings and minimum on empty/error/cancelled scans.
- Animate the cycle indicator independently during pending search/purchase; retain real countdowns and the stopped monotonic clock. Rename interval inputs to Speed from / to and explain total budget versus per-card price.
- Add isolated public FUT.GG/Futbin price adapters with exact edition/platform binding, bounded caching/renewal, provider errors and a percentage-based search ceiling capped by manual Max Buy Now. Live provider access remains unverified due to environment network denial.
- Replace expected resale input with leave / Club / Transfer List destinations using the original native move action after confirmed purchase. Move failures preserve the purchase receipt and never retry a bid.
- Extend source-contract/browser tests for paginated manual scans, cancellation, fresh identical/empty responses, quote binding/caps and successful/failed native moves; add provider fixture tests.

# 3.5.0
- Scope events to verified selected-player concept editions intersected with supported native filters; disclose catalogue failures instead of substituting a general list.
- Replace native-search/DOM-purchase linking with a MAIN-world session and UTItemActionController.bid on the exact returned item object.
- Recheck identity, live price, wallet, auction state and immutable session caps before dispatch.
- Count purchases/spend only on native success plus isWon; handle misses, uncertain outcomes, duplicate attempts and Stop receipts separately.
- Remove the extension's general Auto Buy confirmation. Confirm only known estimated after-tax loss above 10%, bound to the exact trade/price/reference.
- Add optional expected resale and native per-item market-average reference, clearly marking unknown loss.
- Replace the interval needle with an actual phase/countdown SVG ring and monotonic HH:MM:SS clock. Stop freezes time; session limits stop immediately.
- Add source-derived native bid tests, edition scoping, price/identity/budget rejection, loss approval, in-flight Stop and uncertain-receipt coverage.

# 3.4.2
- Default player lookup connects to EA; share in-flight connection work across callers.
- Select from cached native suggestions by their exact IDs and issued pool tokens, avoiding full-name requery failures.
- Resolve legacy catalogue definition IDs through EA ItemIdMask.DATABASE and confirm native identity before Start.
- Replace the single active target on selection and reset stale confirmation labels immediately.
- Render base-player portraits via EA getPortraitImageUri.
- Recognize EA's leading missing-translation marker and RTL controls.
- Group equal club names visually while keeping every original native ID and league choice.
- Add native badge/flag/league image-function candidates and disclose unavailable assets.
- Add regression coverage for catalogue 50540979 -> native 209331, prefix-only search, native portraits, Start handoff and grouped club selections.
- Include an independent static Deep Snipe audit with a reproduced array-index/ID normalization defect. Third-party source and session/network interception are not included in this extension.

# 3.4.1 — CODEX SNIPE
- Rename the product and export filenames, preserving existing settings and internal protocol IDs.
- Deduplicate exact native option identities while preserving same-name entries with different IDs and original selection indices.
- Distinguish native labels, reference-data labels and unresolved translation keys; hide unresolved names by default with an explicit reveal control.
- Show EA IDs and native league names, support ID/league search, and disclose data provenance.
- Reuse EA icon URLs and generateFilterImage fallback; replace failed assets with an explicit neutral state and image-load counts.
- Keep option signatures immutable for stale-list detection, including in-place ID/value changes.
- Add option-source summaries to technical/connection reports and fix the results-container check on the filter view.
- Add pure option tests and browser regressions for duplicate identities, unavailable names, original asset fallback and correct post-deduplication selection.

# 3.4.0
- Add MAIN-world EA controller adapter and ISOLATED-world message client.
- Use native navigation, player engine, dropdown option collections and price/search actions.
- Validate EA access, selected player, price, criterion fingerprint and stale dropdown lists.
- Await fresh native result events; cancel observations on Stop, error, timeout or navigation changes.
- Read authoritative item/rarity/price fields for alerts; preserve conservative legacy purchase checks.
- Add exportable native connection errors and controller-level diagnostics.
- Freeze stopped runtime and guard concurrent/cancelled Start operations.
- Add source-contract and actual isolated-world browser tests; live EA use remains unverified.

# 3.3.1
- Improve DOM tile-label matching and wait for actual view readiness.
- Add connection-report JSON export and navigation regression tests.
