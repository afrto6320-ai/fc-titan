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
