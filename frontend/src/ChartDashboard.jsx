import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { API_BASE_URL } from "./apiConfig";

const FREQUENCIES = [
  { value: "1min", label: "1 Minute" },
  { value: "5min", label: "5 Minutes" },
  { value: "15min", label: "15 Minutes" },
  { value: "1H", label: "1 Hour" },
];

function ChartDashboard({ ticker, setTicker, tickers }) {
  const [frequency, setFrequency] = useState("1min");
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchChart() {
      setLoading(true);
      setError("");
      if (!ticker) {
        setError("No ticker selected. Please choose a ticker.");
        setLoading(false);
        return;
      }
      const allowedFrequencies = ["1min", "5min", "15min", "1H"];
      if (!allowedFrequencies.includes(frequency)) {
        setError("Invalid frequency selected.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/minute_chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker,
            frequency,
            duration: "1 D",
            bar_size: "1 min",
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          setError(`API Error: ${res.status} - ${text}`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.chart || !Array.isArray(data.chart)) {
          setError("Malformed API response: missing chart data.");
          setChartData([]);
          setLoading(false);
          return;
        }
        setChartData(data.chart);
        setError("");
      } catch (err) {
        setError(`Network or JSON error: ${err.message || err}`);
        setChartData([]);
      }
      setLoading(false);
    }
    fetchChart();
  }, [ticker, frequency]);

  const data = {
    labels: chartData.map((row) => row.date),
    datasets: [
      {
        label: "Close",
        data: chartData.map((row) => row.close),
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  return (
    <div>
      {loading && <div>Loading chart data...</div>}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }} role="alert">
          {error}
        </div>
      )}
      <label>
        Ticker:
        <select value={ticker} onChange={(e) => setTicker(e.target.value)}>
          {tickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label>
        Frequency:
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      {!loading && !error && (
        <Line data={data} options={{}} data-testid="historical-chart-canvas" />
      )}
    </div>
  );
}

ChartDashboard.propTypes = {
  ticker: PropTypes.string.isRequired,
  setTicker: PropTypes.func.isRequired,
  tickers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(ChartDashboard);
