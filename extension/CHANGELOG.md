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
