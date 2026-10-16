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
For CAD holdings, enter purchase-time CAD per USD FX in Settings. Original USD
purchase basis and the rollover strike floor use historical FX; current CAD
proceeds and break-even use the current conversion assumption. Missing historical
FX blocks rollover calculations instead of substituting today’s rate.
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

## FX sample entry

Expand **FX model · add transaction samples** in the dashboard. Paste a PNG/JPEG
confirmation (up to 8 MB), or select a file. Local Tesseract OCR proposes fields;
review and correct every field, select the account and confirm before saving.
Manual entry works if OCR is unavailable. USD converted means the confirmation
subtotal after commission, not gross security value. CAD totals must reconcile
with the applied CAD/USD rate. Exact duplicate entries are rejected.

Structured data is stored locally in `data/fx-samples.sqlite3`, excluded from Git.
Images are used in a temporary OCR directory that is removed after extraction;
they are not stored in the database or sent to an external image service. Yahoo
receives only a historical date query. Missing Yahoo observations remain missing;
there is no fallback to a different date. JSON export and sample deletion are
available in the entry panel. The dataset does not modify portfolio holdings.
No prediction model or 1% accuracy claim is included at this stage.

Install Tesseract with English language data on a new machine. The current local
setup uses isolated Ubuntu packages under `.tools/ocr` without requiring sudo.
Restart `dashboard_server.py` after updating its source. Existing browser profile
and holding settings remain separate from the SQLite dataset.

## Financial models

New model projects live under [`../models/financials/`](../models/financials/README.md).
The CIBC FX model workspace is [`cibc_fx/`](../models/financials/cibc_fx/README.md).
Reviewed transaction data stays in `data/fx-samples.sqlite3`; model training must
read it without modifying the saved samples.

## Opening option premiums

Expand **Option premiums · record opening sale** to record an opening call sale.
Enter account, ticker, expiry, strike, contracts, settlement date, USD premium per
share, total USD fees, applied FX and actual net CAD received. Review before saving.
The `option_premiums` table in `data/fx-samples.sqlite3` persists confirmations
separately from FX model training samples. Exact duplicate confirmations are
rejected. A single exact match on account/ticker/expiry/strike/contract quantity
supplies the holding's net premium for dashboard calculations. Multiple matching
opening lots require explicit aggregation; the dashboard does not choose a lot.
This form supports standard calls with a 100-share multiplier. It does not execute
trades or refresh the FX model.

## Closing simulator and AI assessments

The application owns OpenAI integration; statistical models stay independent.
See [setup and usage](CLOSING_SIMULATOR.md). From the repository root, run
`python3 investment/setup_openai.py` for server-side key setup and
`python3 investment/close_simulator_server.py` to serve the simulator on port 8766.

## Shared stock cost basis

Stock purchase basis is stored in `stock_cost_basis` in `data/fx-samples.sqlite3`,
keyed by account, ticker and account currency. Profile → Settings saves it through
`/api/stock-cost-basis`. Average cost is calculated from total cost and quantity.
The closing simulator and assessment service read this same table. Reload the
simulator or refresh its quotes after saving changes. Old browser-only basis
records are backed up locally and can be imported with the settings import button;
that explicit import replaces matching database bases. Profile names, bid thresholds
and option entry overrides remain browser preferences. The old seed JSON has been
archived; it is not a runtime source. Migration can be rerun without replacing
later database edits.
