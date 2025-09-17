import React, {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import * as yup from "yup";
import { API_BASE_URL } from "./apiConfig";

export interface GridFormProps {
  setTrades: (trades: any) => void;
  setHeldShares: (shares: any) => void;
  setTicker: (ticker: string) => void;
  setTickerBlur: (blur: boolean) => void;
  setPerformance: (perf: any) => void;
  ticker: string;
  errorMessage?: string;
  successMessage?: string;
  setErrorMessage?: (msg: string) => void;
  setSuccessMessage?: (msg: string) => void;
}

interface FormState {
  ticker: string;
  shares: string;
  grid_up: string;
  grid_down: string;
  grid_increment: string;
  timeframe: string;
  [key: string]: string;
}

const schema = yup.object().shape({
  ticker: yup.string().required("Ticker is required"),
  shares: yup
    .number()
    .typeError("Shares must be a number")
    .required("Shares are required")
    .min(1, "Shares must be at least 1"),
  grid_up: yup
    .number()
    .typeError("Grid Up must be a number")
    .required("Grid Up is required")
    .min(0, "Grid Up must be at least 0"),
  grid_down: yup
    .number()
    .typeError("Grid Down must be a number")
    .required("Grid Down is required")
    .min(0, "Grid Down must be at least 0"),
  grid_increment: yup
    .number()
    .typeError("Grid Increment must be a number")
    .required("Grid Increment is required")
    .min(0.001, "Grid Increment must be at least 0.001"),
  timeframe: yup.string().required("Timeframe is required"),
});

const GridForm: React.FC<GridFormProps> = ({
  setTrades,
  setHeldShares,
  setTicker,
  setTickerBlur,
  setPerformance,
  ticker,
  errorMessage = "",
  successMessage = "",
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [form, setForm] = useState<FormState>({
    ticker: ticker || "",
    shares: "",
    grid_up: "",
    grid_down: "",
    grid_increment: "",
    timeframe: "1 D",
  });
  const [loading, setLoading] = useState(false);
  // Internal message state only used if props not provided
  const [message, setMessage] = useState<{
    type: "error" | "success" | "";
    text: string;
  }>({ type: "", text: "" });
  const tickerRef = useRef<HTMLInputElement>(null);
  const sharesRef = useRef<HTMLInputElement>(null);
  const gridUpRef = useRef<HTMLInputElement>(null);
  const gridDownRef = useRef<HTMLInputElement>(null);
  const gridIncrementRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: name === "timeframe" || name === "ticker" ? value : value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let validationFailed = false;
      try {
        await schema.validate(form, { abortEarly: false });
      } catch (validationError: any) {
        validationFailed = true;
        const errorText =
          validationError.inner && validationError.inner.length > 0
            ? validationError.inner.map((err: any) => err.message).join("; ")
            : validationError.message || "Please fill in all fields";
        if (setErrorMessage) setErrorMessage(errorText);
        else setMessage({ type: "error", text: errorText });
      }
      if (validationFailed) return;
      const payload = {
        ticker: form.ticker,
        shares: Number(form.shares),
        grid_up: Number(Number(form.grid_up).toFixed(3)),
        grid_down: Number(Number(form.grid_down).toFixed(3)),
        grid_increment: Number(Number(form.grid_increment).toFixed(3)),
        timeframe: form.timeframe,
        interval: "1 min",
      };
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          if (setErrorMessage)
            setErrorMessage(`API Error: ${res.status} - ${text}`);
          else
            setMessage({
              type: "error",
              text: `API Error: ${res.status} - ${text}`,
            });
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (setSuccessMessage)
          setSuccessMessage("Backtest completed successfully");
        else
          setMessage({
            type: "success",
            text: "Backtest completed successfully",
          });
        if (data) {
          setPerformance(data.performance ?? null);
          setTrades(data.trades ?? []);
          setHeldShares(data.heldShares ?? []);
        }
      } catch (err: any) {
        if (setErrorMessage)
          setErrorMessage(`Network Error: ${err.message || err}`);
        else
          setMessage({
            type: "error",
            text: `Network Error: ${err.message || err}`,
          });
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      setErrorMessage,
      setSuccessMessage,
      setPerformance,
      setTrades,
      setHeldShares,
    ],
  );

  return (
    <section aria-labelledby="grid-form-title">
      <h2 id="grid-form-title" style={{ display: "none" }}>
        Grid Trading Backtest Form
      </h2>
      {/* Only one visible alert/status node for accessibility and test compliance */}
      <div className="status-container">
        {(errorMessage || message.type === "error") &&
        (errorMessage || message.text) ? (
          <div
            className="status-error"
            style={{ color: "red", marginBottom: "0.5rem" }}
            role="alert"
            aria-live="assertive"
            data-testid="error-node"
          >
            {errorMessage || message.text}
          </div>
        ) : (successMessage || message.type === "success") &&
          (successMessage || message.text) ? (
          <div
            className="status-success"
            style={{ color: "green", marginBottom: "0.5rem" }}
            role="status"
            aria-live="polite"
            data-testid="success-node"
          >
            {successMessage || message.text}
          </div>
        ) : null}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        aria-describedby="grid-form-desc"
      >
        <span id="grid-form-desc" style={{ display: "none" }}>
          Grid trading backtest form. All fields must be completed before
          submitting.
        </span>
        <div role="group" aria-labelledby="ticker-label">
          <label id="ticker-label" htmlFor="ticker-input">
            Ticker
          </label>
          <input
            ref={tickerRef}
            id="ticker-input"
            name="ticker"
            type="text"
            placeholder="Ticker"
            value={form.ticker}
            onChange={handleChange}
            required
            aria-required="true"
            aria-label="Stock ticker symbol"
            aria-invalid={!form.ticker}
          />
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
            aria-invalid={!form.shares}
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
            aria-invalid={!form.grid_up}
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
            aria-invalid={!form.grid_down}
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
            aria-invalid={!form.grid_increment}
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
          disabled={loading}
          aria-busy={loading ? "true" : "false"}
          aria-label="Run backtest"
        >
          {loading ? "Running..." : "Backtest"}
        </button>
      </form>
    </section>
  );
};

export default React.memo(GridForm);
