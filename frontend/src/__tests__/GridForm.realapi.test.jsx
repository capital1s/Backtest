import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GridForm from "../GridForm";

const realApiUrl = process.env.API_BASE_URL || "http://localhost:8000";

const mockProps = {
  setTrades: vi.fn(),
  setHeldShares: vi.fn(),
  setTicker: vi.fn(),
  setTickerBlur: vi.fn(),
  setPerformance: vi.fn(),
  ticker: "",
};

// Patch global.fetch for Node.js if not present
try {
  if (typeof global.fetch === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    global.fetch = require("node-fetch");
  }
} catch (e) {
  // Ignore if already set or not available
}

describe("GridForm Real API Integration", () => {
  it("submits form and receives real API response or error", async () => {
    render(<GridForm {...mockProps} />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "1.0" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "0.5" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "0.1" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    // Wait for either success or error message
    await waitFor(
      () => {
        const status = screen.queryByRole("status");
        const alert = screen.queryByRole("alert");
        expect(status || alert).not.toBeNull();
        if (alert) {
          expect(alert.textContent).toMatch(/api error|network error/i);
        }
      },
      { timeout: 15000 },
    );
  }, 20000);
});
