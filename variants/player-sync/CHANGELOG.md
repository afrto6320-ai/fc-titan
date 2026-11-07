# CODEX SNIPE v3.17.1 — Optional bid ladders

- Keep the supplied v3.17 player-sync build as this separate variant; preserve the existing three-theme extension sources.
- Offer Off, Min Bid, regular Max Bid, or smart Max Bid for both manual scans and the sniping loop, including the existing opt-in Auto Buy path.
- Start smart Max Bid at the first valid EA price strictly above the actual native Max Buy Now (or a higher existing bid limit), advancing through EA price tiers. Preserve Min Bid, Buy Now, filters, identity and purchase budget. At the EA price limit use zero/uncapped, then restart; reject smart searches without a positive Buy Now cap.
- Keep regular Max Bid as a distinct 0/150/200…600 cycle, skipping values below an explicit Min Bid; it is allowed to narrow the market and is labelled accordingly. Retain the existing saved maxBid meaning.
- Cycle Min Bid from the configured floor through 600 within an explicit Max Bid bound; disclose that this can exclude cheap auctions.
- Clone native criteria per request, retain the DTO prototype, and log prepared effective values, selected ladder and cycle step. Reset the sequence after ladder, player or price changes. Save the selected ladder and preserve it across language rebuilds.
- Default fresh settings to Enhancer (local market cache clearing before EA search); retain existing saved route choices. Do not change Pharaoh or Deep adapters or import vendor engines.
- Validate pure price tiers, full cycle invariants, MAIN dispatch and purchase-bound regressions; test the manifest MAIN/ISOLATED plan in Chromium with synthetic native responses. No live EA purchase or installed-extension validation.

# GPT SNIPE v3.17.0 — Player State Sync Fix

- Clearing the selected player now also sends a dedicated clear-player operation to the EA MAIN-world bridge, resetting EA `maskedDefId` and `playerData` and verifying the active search model.
- EA player selection from FUT.GG triggers native auto-confirm automatically; only the exact EA Player ID qualifies. EA-native player rows already confirm on click.
- Manual scans explicitly verify native target vs selection and automatically clear stale native player criteria for zero-player searches.
- START allows zero-player market monitoring with Auto Buy OFF. Auto-buy remains restricted to one EA-verified target.
- Existing search mode comparison, per-call bid ladder logs, and experimental purchase modes remain otherwise unchanged.

The new clear-player API must be validated in the live EA app. No real purchases were performed.
