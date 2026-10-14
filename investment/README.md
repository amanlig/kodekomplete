# Covered-call investment dashboard

A local Python/JavaScript dashboard for covered-call holdings. It includes account
and stock filters, Questrade bid/ask quotes and Greeks, editable purchase prices,
minimum acceptable bids, stock-loss indicators and rollover payoff comparisons.
LIRA defaults to USD; RRSP/TFSA default to CAD. Yahoo provides a USD/CAD macro
reference with a past-month chart. The previous forecast exit model is retired.

## Run with synthetic examples

Requires Python 3.10+; Node is used only for calculation checks. No Python packages
are required. D3 and technology icons are bundled with their licenses.

```sh
cd investment
mkdir -p data reports
cp examples/rrsp.json data/book-values-unassigned.json
cp examples/tfsa.json data/tfsa-closing.json
cp examples/lira.json data/lira-closing.json
python3 chart.py
python3 dashboard_server.py
```

Open http://localhost:8765/equity-chart.html. Examples are fictional; do not
interpret their strikes, prices or quantities as market data or recommendations.
Replace the local inputs with your own snapshots before using the calculations.
The server binds to loopback. No deployment, order execution or cloud storage is
included. Generated reports, local financial inputs, tokens, archived research
and session handoffs are excluded from Git.

## Sources and refresh

Questrade supplies stock/option quotes, sizes, Greeks and listed contracts. Yahoo
supplies FX macro data only; its reference is separate from actual brokerage FX
spread/charges. The local service refreshes FX every 60 seconds. Broker captures
refresh explicitly using these commands or the candidate refresh button:

```sh
python3 questrade_positions.py
python3 market_details.py
python3 roll_candidates.py --all
python3 chart.py
```

Configure Questrade authorization locally; see [setup](QUESTRADE.md). Position
sync currently supports a uniquely identified active LIRA. RRSP/TFSA snapshots
are entered locally; market quotes can still be sourced from Questrade.

Profile → Settings configures purchase prices and minimum stock bid per holding.
Settings are stored in your browser, separately by account and stock. The rollover
rule chooses purchase + USD 5 rounded up to the next listed strike, with editable
expiry range and minimum worthwhile net credit. Quote freshness and displayed
size are checked. Payoffs are conditional scenarios, not forecasts or guaranteed
fills. See [rollover details](ROLLOVER.md) and [physical architecture](ARCHITECTURE.md).

## Public checks

```sh
python3 -m unittest discover -s tests -p 'test_public_*.py'
node tests/test_public_calculations.js
```

These checks use synthetic fixtures and do not require account credentials or
private portfolio files.
