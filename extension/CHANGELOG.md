# 3.9.4
- Log the confirmed prepared Min/Max Bid and Min/Max Buy Now immediately before each native manual scan or snipe search dispatch.
- Include the target, 1-based ladder step and cycle length; label zero Max Bid as uncapped and fixed-bid mode without reusing an old ladder step.
- Preserve ladder computation, price caps, bid fields and existing activity-log export/retention. Skip dispatch/logging when a target rotation was cancelled.
- Extend browser coverage to match activity entries against SDK arguments, including uncapped/fixed rounds and automatic searches.

# 3.9.3
- Increase small dashboard copy by roughly one pixel and use heavier body/field text, while retaining existing card, portrait, input and action-bar geometry.
- Keep prominent clocks, counters, icons, spacing and control dimensions. Preserve existing title/metadata line boxes in pinned cards.
- Manually compare before/after dimensions at 1500px and 600px widths in Chromium: sampled cards, portraits, fields, buttons, dock, panel headers and folded pricing retain their sizes with no horizontal overflow. Search, purchase and pricing logic are unchanged.

# 3.9.2
- Diagnose the uploaded price failure before the provider stage: missing runtime.sendMessage, null provider status and an older 3.9.0 UI were present in the log; they do not establish a new provider HTTP denial.
- Add an isolated extension API client that retains the initialized runtime/storage objects, detects invalidated contexts, bounds worker response time, and separates worker/messaging failures from provider replies without fallback requests.
- Record manifest/UI versions, helper availability and price failure stage in technical diagnostics; show a reload instruction and prevent a price-dependent search when extension messaging fails.
- Add independent static comparison of Pharaoh 1.1.0, Deep Snipe 0.9.39 and FC27 Enhancer 27.0.1.5. No vendor engines, authentication capture or raw market request fallback were incorporated.
- Add runtime replacement/invalidation/worker failure/timeout tests and browser coverage for successful prices after global runtime replacement and explicit missing-runtime diagnostics.

# 3.9.1
- Require a confirmed selected EA league before opening Club, in both the interface and MAIN command boundary. Respect native Club locks and reject a stale club picker after its league changes.
- Move rarity/event beside quality, place the full-width Item ID below league/club, and move rating limits below Item ID.
- Make price references an initially collapsed details section; persist its open state and preserve input values and panel states across language changes.
- Explain Futbin HTTP 403 denial without claiming a known cause or successful workaround; expand pricing on failure and keep provider-priced search blocked without a verified quote.
- Extend browser regressions for league dependency/reset, revised field geometry, price disclosure and denied-price search prevention; retain no-retry 403 provider tests.

# 3.9.0
- Default to MAIN-world `services.Item.searchTransferMarket` using a cloned native DTO, keeping original category/player/rarity filters and independent bid/BIN prices. Retain the native screen route as an explicit option.
- Correct the previous ladder assumption: the original EA view links Max Bid to Max Buy Now. Validate all final screen prices together to detect later field rewrites; use prepared SDK plans for independent ladder values.
- Preserve serialized pagination, original item objects, Stop/cancel behavior, exact identity checks, confirmed purchase receipts and one shared session budget across targets in the SDK route.
- Disclose transport, prepared SDK prices, native status, request duration, additional-page availability and new Trade IDs relative to the previous matching response. Keep real repeated auctions visible and clear empty/failed results.
- Replace the detached option grid with an anchored vertical, searchable filter menu; close on repeat click, selection, outside interaction or Escape without resetting the selected value.
- Keep Start/Stop/Save/Scan in a persistent bottom bar, including full-page results; adapt its spacing on small screens and language changes.
- Extend source-derived browser regressions for view price coupling, direct SDK queries/pagination/purchase/cancellation, unchanged repeats/empty responses/429, menu geometry and persistent controls. Tests use synthetic transport; live EA execution and server freshness remain unverified.

# 3.8.0
- Add optional default-on Max Bid ladder: start at or above the effective Buy Now ceiling, advance native price ticks, continue to a user-selected ceiling (default 200k, maximum 15m), then run one uncapped bid query and restart. Preserve configured bid fields, fixed Min Bid, purchase limits and per-target counters.
- Fix browser helper exports in CommonJS-shaped contexts. Remove the frozen legacy clock path; use independent monotonic clock calculation and Web Animations/CSS activity even when the helper is missing.
- Place native positions directly under ratings, fall back past invalid preferred-position values, and enrich pinned cards only from matching native editions.
- Add persistent intro visibility, header filter save, native-ID/player-aware preset loading, and a floating scroll-to-top action.
- Lock pending native operations to prevent delayed navigation from overlapping searches. Match the same underlying results controller across wrapper changes while continuing to reject genuine view/navigation changes; report available EA notices.
- Add ladder, export, missing-helper, wrapper-transition, navigation-cancel, native preset and compact-layout regressions.

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
