import React, { useState } from "react";
import "./App.css";
import GridForm from "./GridForm";
import ErrorBoundary from "./ErrorBoundary";
import { Suspense, lazy } from "react";
const ChartDashboard = lazy(() => import("./ChartDashboard"));
const TradeChart = lazy(() => import("./TradeChart"));
const TradeTable = lazy(() => import("./TradeTable"));
const SharesHeld = lazy(() => import("./SharesHeld"));

import PropTypes from "prop-types";

function App() {
  const [trades, setTrades] = useState([]);
  const [heldShares, setHeldShares] = useState([]);
  const [ticker, setTicker] = useState("");
  const [tickerBlur, setTickerBlur] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [theme, setTheme] = useState("light");
  // Always provide a valid tickers array for ChartDashboard
  const tickers = ticker ? [ticker] : ["AAPL", "MSFT", "GOOG"];

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ErrorBoundary
      fallback={
        <div role="alert" style={{ color: "red", padding: "2rem" }}>
          Something went wrong. Please refresh or contact support.
        </div>
      }
    >
      <main style={{ padding: "2rem" }}>
        <div className="theme-switcher">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
        <h1>Grid Trading Bot Dashboard</h1>
        {/* Always render GridForm for robust error/success container */}
        <GridForm
          setTrades={setTrades}
          setHeldShares={setHeldShares}
          setTicker={setTicker}
          setTickerBlur={setTickerBlur}
          setPerformance={setPerformance}
          ticker={ticker}
        />
        <Suspense fallback={<div>Loading charts...</div>}>
          <ChartDashboard
            ticker={tickerBlur ? ticker : ""}
            tickers={tickers}
            setTicker={setTicker}
          />
          <TradeChart trades={trades} />
          <div style={{ display: "flex", gap: "2rem" }}>
            <TradeTable trades={trades} type="buy" />
            <TradeTable trades={trades} type="sell" />
          </div>
          <SharesHeld heldShares={heldShares} />
        </Suspense>
        {performance && (
          <>
            <div
              aria-live="polite"
              role="status"
              style={{ color: "green", marginBottom: "1rem" }}
            >
              Backtest completed successfully!
            </div>
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h3>Performance Metrics</h3>
              <ul>
                <li>Total Trades: {performance.total_trades}</li>
                <li>PnL: {performance.pnl}</li>
                <li>Win Rate: {performance.win_rate}</li>
                <li>Wins: {performance.wins}</li>
                <li>Losses: {performance.losses}</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </ErrorBoundary>
  );
}

export default App;
