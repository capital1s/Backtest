import React, { useState, useRef } from "react";
import { API_BASE_URL } from "./apiConfig";

function GridForm({
  setTrades,
  setHeldShares,
  setPerformance,
  ticker,
  errorMessage = "",
  successMessage = "",
  setErrorMessage,
  setSuccessMessage,
}) {
  const [form, setForm] = useState({
    shares: "",
    grid_up: "",
    grid_down: "",
    grid_increment: "",
    timeframe: "1 D",
  });
  // Remove local error/success state, use parent setters
  // const [errorMessage, setErrorMessage] = useState(null);
  // const [successMessage, setSuccessMessage] = useState(null);
  // Accept parent error/success setters
  // errorMessage and successMessage are now props, not setters
  const [isLoading, setIsLoading] = useState(false);
  const sharesRef = useRef();
  const gridUpRef = useRef();
  const gridDownRef = useRef();
  const gridIncrementRef = useRef();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage && setErrorMessage(null); // Clear only error before submission
    setIsLoading(true);
    console.log("[GridForm.jsx] handleSubmit called. Form:", form);
    // Do NOT clear successMessage here; it should persist until a new success
    // Check for missing required fields
    const requiredFields = [
      "shares",
      "grid_up",
      "grid_down",
      "grid_increment",
      "timeframe",
    ];
    const missing = requiredFields.some(
      (f) => !form[f] || String(form[f]).trim() === "",
    );
    if (missing || !ticker) {
      setErrorMessage &&
        setErrorMessage("Please fill in all fields and select a ticker.");
      setIsLoading(false);
      console.log(
        "[GridForm.jsx] Validation failed: missing fields or ticker",
        form,
        ticker,
      );
      return;
    }
    // Numeric validation with specific error messages
    if (isNaN(Number(form.shares)) || Number(form.shares) <= 0) {
      setErrorMessage &&
        setErrorMessage("Invalid value for shares. Must be a positive number.");
      setIsLoading(false);
      console.log("[GridForm.jsx] Validation failed: invalid shares", form);
      return;
    }
    if (
      isNaN(Number(form.grid_increment)) ||
      Number(form.grid_increment) <= 0
    ) {
      setErrorMessage &&
        setErrorMessage(
          "Invalid value for grid increment. Must be a positive number.",
        );
      setIsLoading(false);
      console.log(
        "[GridForm.jsx] Validation failed: invalid grid increment",
        form,
      );
      return;
    }
    if (isNaN(Number(form.grid_up)) || Number(form.grid_up) < 0) {
      setErrorMessage &&
        setErrorMessage("Invalid value for grid up. Must be zero or positive.");
      setIsLoading(false);
      console.log("[GridForm.jsx] Validation failed: invalid grid up", form);
      return;
    }
    if (isNaN(Number(form.grid_down)) || Number(form.grid_down) < 0) {
      setErrorMessage &&
        setErrorMessage(
          "Invalid value for grid down. Must be zero or positive.",
        );
      setIsLoading(false);
      console.log("[GridForm.jsx] Validation failed: invalid grid down", form);
      return;
    }
    try {
      const validTickers = ["AAPL", "MSFT", "GOOG"];
      if (!validTickers.includes(ticker)) {
        setErrorMessage && setErrorMessage("Ticker: Invalid ticker selected.");
        setIsLoading(false);
        console.log("[GridForm.jsx] Invalid ticker selected:", ticker);
        return;
      }
      let fetchUrl = `${API_BASE_URL}/backtest`;
      // Use absolute URL for tests so undici can parse and MSW can intercept
      if (
        typeof globalThis.process !== "undefined" &&
        (globalThis.process.env.NODE_ENV === "test" ||
          globalThis.process.env.VITEST)
      ) {
        fetchUrl = "http://localhost/backtest";
      }
      const requestBody = JSON.stringify({
        ticker: ticker,
        shares: parseInt(form.shares),
        grid_up: parseFloat(form.grid_up),
        grid_down: parseFloat(form.grid_down),
        grid_increment: parseFloat(form.grid_increment),
        timeframe: form.timeframe,
        interval: "1min", // Add required interval field
      });
      console.log("[GridForm.jsx] Fetching:", fetchUrl, "Body:", requestBody);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      // Handle both real responses and mock responses
      let responseText = "";
      try {
        responseText = response.clone
          ? await response.clone().text()
          : response.body || "";
        console.log(
          "[GridForm.jsx] fetch response status:",
          response.status,
          "body:",
          responseText,
        );
      } catch (cloneErr) {
        console.log("[GridForm.jsx] Clone error:", cloneErr);
        responseText = response.body || response.text || "";
      }

      let data = {};
      try {
        if (response.json && typeof response.json === "function") {
          data = await response.json();
        } else if (typeof responseText === "string" && responseText) {
          data = JSON.parse(responseText);
        } else {
          data = response.data || {};
        }
      } catch (jsonErr) {
        console.log("[GridForm.jsx] JSON parse error:", jsonErr);
      }
      if (!response.ok) {
        setErrorMessage &&
          setErrorMessage(`Server: ${data.error || "Server error!"}`);
        setIsLoading(false);
        // Do NOT clear successMessage here; it should persist after errors
        console.log(
          "[GridForm.jsx] Server error:",
          data.error || "Server error!",
        );
        console.log(
          "[GridForm.jsx] errorMessage after error:",
          data.error || "Server error!",
        );
        return;
      }
      // Clear error message on success
      setErrorMessage(null);
      setIsLoading(false);
      setSuccessMessage && setSuccessMessage("Backtest completed successfully");
      console.log("[GridForm.jsx] Success: Backtest completed successfully");
      console.log("[GridForm.jsx] errorMessage after success:", null);
      console.log(
        "[GridForm.jsx] successMessage after success:",
        "Backtest completed successfully",
      );
      setTrades && setTrades(data.trades || []);
      setHeldShares && setHeldShares(data.heldShares || []);
      setPerformance && setPerformance(data.performance || {});
      console.log(
        "[GridForm.jsx] setPerformance called with:",
        data.performance || {},
      );
    } catch (err) {
      setErrorMessage("Network Error: No response from server.");
      setErrorMessage &&
        setErrorMessage("Network Error: No response from server.");
      setIsLoading(false);
      // Do NOT clear successMessage here; it should persist after errors
      console.log("[GridForm.jsx] Network error:", err);
      console.log(
        "[GridForm.jsx] errorMessage after network error:",
        "Network Error: No response from server.",
      );
    }
  };
  return (
    <div>
      <section aria-labelledby="grid-form-title">
        <h2 id="grid-form-title" style={{ display: "none" }}>
          Grid Trading Backtest Form
        </h2>
        <div className="status-container">
          {isLoading && (
            <div
              aria-live="polite"
              role="status"
              style={{ color: "green", marginBottom: "1rem" }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <span
                  className="spinner"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    border: "3px solid #ccc",
                    borderTop: "3px solid #333",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span style={{ marginLeft: "0.5rem" }}>
                  Running backtest...
                </span>
              </span>
            </div>
          )}
          {/* Error message rendering for tests and accessibility */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              style={{ color: "red", marginBottom: "1rem" }}
            >
              {errorMessage}
            </div>
          )}
          {/* Success message rendering for tests and accessibility */}
          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              style={{ color: "green", marginBottom: "1rem" }}
            >
              {successMessage}
            </div>
          )}
        </div>
        <form
          role="form"
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          aria-describedby="grid-form-desc"
        >
          <span id="grid-form-desc" style={{ display: "none" }}>
            Enter grid trading parameters and run a backtest. All fields are
            required.
          </span>
          {/* ...existing code for form fields and button... */}
          <div role="group" aria-labelledby="ticker-display">
            <label
              id="ticker-display"
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Selected Ticker:{" "}
              {ticker ? (
                <strong style={{ color: "green" }}>{ticker}</strong>
              ) : (
                <em style={{ color: "#999" }}>None selected</em>
              )}
            </label>
            {!ticker && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#e74c3c",
                  margin: "0.5rem 0",
                  padding: "0.5rem",
                  backgroundColor: "#fdf2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "4px",
                }}
              >
                ⚠️ Please select a ticker using the dropdown in the Chart
                section above before running a backtest.
              </p>
            )}
            {ticker && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#27ae60",
                  margin: "0.5rem 0",
                  padding: "0.5rem",
                  backgroundColor: "#f0f9f4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "4px",
                }}
              >
                ✅ Ready to backtest with {ticker}
              </p>
            )}
          </div>
          <div role="group" aria-labelledby="shares-label">
            <label id="shares-label" htmlFor="shares-input">
              Shares
            </label>
            <input
              ref={sharesRef}
              id="shares-input"
              name="shares"
              type="number"
              placeholder="Shares"
              value={form.shares}
              onChange={handleChange}
              required
              min={1}
              aria-required="true"
              aria-label="Number of shares"
              aria-invalid={form.shares === "" || Number(form.shares) <= 0}
            />
          </div>
          <div role="group" aria-labelledby="grid-up-label">
            <label id="grid-up-label" htmlFor="grid-up-input">
              Grid Up
            </label>
            <input
              ref={gridUpRef}
              id="grid-up-input"
              name="grid_up"
              type="number"
              step={0.001}
              placeholder="Grid Up"
              value={form.grid_up}
              onChange={handleChange}
              required
              min={0}
              aria-required="true"
              aria-label="Grid up value"
              aria-invalid={form.grid_up === "" || Number(form.grid_up) < 0}
            />
          </div>
          <div role="group" aria-labelledby="grid-down-label">
            <label id="grid-down-label" htmlFor="grid-down-input">
              Grid Down
            </label>
            <input
              ref={gridDownRef}
              id="grid-down-input"
              name="grid_down"
              type="number"
              step={0.001}
              placeholder="Grid Down"
              value={form.grid_down}
              onChange={handleChange}
              required
              min={0}
              aria-required="true"
              aria-label="Grid down value"
              aria-invalid={form.grid_down === "" || Number(form.grid_down) < 0}
            />
          </div>
          <div role="group" aria-labelledby="grid-increment-label">
            <label id="grid-increment-label" htmlFor="grid-increment-input">
              Grid Increment
            </label>
            <input
              ref={gridIncrementRef}
              id="grid-increment-input"
              name="grid_increment"
              type="number"
              step={0.001}
              placeholder="Grid Increment"
              value={form.grid_increment}
              onChange={handleChange}
              required
              min={0.001}
              aria-required="true"
              aria-label="Grid increment value"
              aria-invalid={
                form.grid_increment === "" || Number(form.grid_increment) <= 0
              }
            />
          </div>
          <div role="group" aria-labelledby="timeframe-label">
            <label id="timeframe-label" htmlFor="timeframe-select">
              Timeframe
            </label>
            <select
              id="timeframe-select"
              name="timeframe"
              value={form.timeframe}
              onChange={handleChange}
              required
              aria-required="true"
              aria-label="Backtest timeframe"
            >
              <option value="1 D">1 Day</option>
              <option value="5 D">5 Days</option>
              <option value="1 W">1 Week</option>
              <option value="1 M">1 Month</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading ? "true" : "false"}
            aria-label="Run backtest"
          >
            {isLoading ? "Running..." : "Backtest"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default GridForm;
