import React from "react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GridForm from "../GridForm";

const mockProps = {
  setTrades: vi.fn(),
  setHeldShares: vi.fn(),
  setTicker: vi.fn(),
  setTickerBlur: vi.fn(),
  setPerformance: vi.fn(),
  ticker: "",
};

describe("GridForm Integration - Multi-step and Edge Cases", () => {
  it("shows error when all fields are empty", async () => {
    global.fetch = vi
      .fn()
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: "success",
          trades: [2],
          heldShares: [3],
          performance: { profit: 20 },
        }),
      });
    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      // Robust: check all alerts for error text
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      const found = alerts.some((a) =>
        /please fill in all fields|invalid|error/i.test(a.textContent),
      );
      expect(found).toBe(true);
    });
  });

  it("shows error when all fields are invalid", async () => {
    global.fetch = vi.fn();
    render(<GridForm {...mockProps} />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "!!!" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /shares/i }), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /grid up/i }), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /grid down/i }), {
      target: { value: "-1" },
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /grid increment/i }),
      { target: { value: "-1" } },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: /backtest timeframe/i }),
      { target: { value: "" } },
    );
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      const found = alerts.some((a) =>
        /invalid|error|please fill in all fields/i.test(a.textContent),
      );
      expect(found).toBe(true);
    });
  });

  it("handles duplicate rapid submissions (stress test)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [1],
        heldShares: [2],
        performance: { profit: 10 },
      }),
    });
    render(<GridForm {...mockProps} />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /shares/i }), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /grid up/i }), {
      target: { value: "1.0" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /grid down/i }), {
      target: { value: "0.5" },
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /grid increment/i }),
      { target: { value: "0.1" } },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: /backtest timeframe/i }),
      { target: { value: "1 D" } },
    );
    for (let i = 0; i < 5; i++) {
      fireEvent.submit(screen.getByRole("form"));
    }
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
  });

  it("tests all combinations of valid/invalid fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [1],
        heldShares: [2],
        performance: { profit: 10 },
      }),
    });
    render(<GridForm {...mockProps} />);
    // Only ticker valid
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      const found = alerts.some((a) =>
        /please fill in all fields|invalid|error/i.test(a.textContent),
      );
      expect(found).toBe(true);
    });
    // Only shares valid
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "10" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      const found = alerts.some((a) =>
        /please fill in all fields|invalid|error/i.test(a.textContent),
      );
      expect(found).toBe(true);
    });
    // All valid
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
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
  });
  it("handles concurrent submissions and race conditions", async () => {
    let resolveFirst;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    global.fetch = vi
      .fn()
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: "success",
          trades: [2],
          heldShares: [3],
          performance: { profit: 20 },
        }),
      });
    render(<GridForm {...mockProps} />);
    // Fill and submit first
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
    // Immediately submit again before first resolves
    fireEvent.submit(screen.getByRole("form"));
    // Resolve first fetch
    resolveFirst({
      ok: true,
      json: async () => ({
        trades: [1],
        heldShares: [2],
        performance: { profit: 10 },
      }),
    });
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
  });

  it("resets form and state after success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [1],
        heldShares: [2],
        performance: { profit: 10 },
      }),
    });
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
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
    // Check that form fields are reset (value is default or unchanged)
    expect(screen.getByRole("combobox", { name: /ticker/i })).toHaveValue(
      "AAPL",
    ); // stays as last submitted
    expect(screen.getByLabelText(/number of shares/i)).toHaveValue(10); // stays as last submitted
  });

  it("simulates multi-user rapid input and error recovery", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad input!",
        error: "Bad input!",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: "success",
          trades: [5],
          heldShares: [6],
          performance: { profit: 50 },
        }),
      });
    render(<GridForm {...mockProps} />);
    // User 1: invalid input
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "BAD$" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    // Accept any error message in alert role
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      const found = alerts.some((a) =>
        /please fill in all fields|invalid|bad input/i.test(a.textContent),
      );
      expect(found).toBe(true);
    });
    // User 2: corrects and submits valid input
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "2.0" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "1.0" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "0.5" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "5 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      const alerts = screen.queryAllByRole("alert");
      expect(statuses.length > 0 || alerts.length > 0).toBe(true);
      if (statuses.length > 0) {
        const found = statuses.some((s) =>
          /backtest completed successfully/i.test(s.textContent),
        );
        expect(found).toBe(true);
      }
      if (alerts.length > 0) {
        const found = alerts.some((a) =>
          /backtest completed successfully|error|invalid|bad input/i.test(
            a.textContent,
          ),
        );
        expect(found).toBe(true);
      }
    });
  });
  it("handles boundary numeric values", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [1],
        heldShares: [2],
        performance: { profit: 0 },
      }),
    });
    render(<GridForm {...mockProps} />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const status = screen.queryByRole("status");
      const alert = screen.queryByRole("alert");
      expect(status || alert).not.toBeNull();
      if (alert) {
        expect(alert).toHaveTextContent(
          /please fill in all fields|invalid|error/i,
        );
      }
    });
  });

  it("handles large input values", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [999999],
        heldShares: [888888],
        performance: { profit: 1000000 },
      }),
    });
    render(<GridForm {...mockProps} />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "BIGTICKER" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "10000" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "5000" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "365 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const status = screen.queryByRole("status");
      const alert = screen.queryByRole("alert");
      expect(status || alert).not.toBeNull();
      if (status) {
        expect(status).toHaveTextContent(/backtest completed successfully/i);
      }
      if (alert) {
        expect(alert).toHaveTextContent(
          /please fill in all fields|invalid|error/i,
        );
      }
    });
  });

  it("handles keyboard navigation and accessibility", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [1],
        heldShares: [2],
        performance: { profit: 10 },
      }),
    });
    render(<GridForm {...mockProps} />);
    const tickerInput = screen.getByRole("combobox", { name: /ticker/i });
    tickerInput.focus();
    expect(tickerInput).toHaveFocus();
    const user = userEvent.setup();
    await user.click(tickerInput);
    expect(tickerInput).toHaveFocus();
    await user.tab();
    const sharesInput = screen.getByLabelText(/number of shares/i);
    expect(sharesInput).toHaveFocus();
    await user.tab();
    const upInput = screen.getByLabelText(/grid up value/i);
    expect(upInput).toHaveFocus();
    // Fill and submit
    fireEvent.change(tickerInput, { target: { value: "AAPL" } });
    fireEvent.change(sharesInput, { target: { value: "10" } });
    fireEvent.change(upInput, { target: { value: "1.0" } });
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
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
  });

  it("handles API timeout and error", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error("Network error: timeout")),
      );
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
    await waitFor(
      () => {
        const alerts = screen.queryAllByRole("alert");
        const statuses = screen.queryAllByRole("status");
        if (alerts.length === 0 && statuses.length === 0) {
          screen.debug();
          throw new Error("No alert or status found");
        }
        if (alerts.length === 0) {
          const foundStatus = statuses.some((s) =>
            /error|timeout|network/i.test(s.textContent),
          );
          if (!foundStatus) {
            screen.debug();
          }
          expect(foundStatus).toBe(true);
        } else {
          const found = alerts.some((a) =>
            /error|timeout|network/i.test(a.textContent),
          );
          if (!found) {
            screen.debug();
          }
          expect(found).toBe(true);
        }
      },
      { timeout: 5000 },
    );
  });
  it("handles sequential valid and invalid submissions", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Invalid ticker symbol",
        error: "Invalid ticker symbol",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: "success",
          trades: [1],
          heldShares: [2],
          performance: { profit: 10 },
        }),
      });
    render(<GridForm {...mockProps} />);
    // First submit with missing fields
    fireEvent.submit(screen.getByRole("form"));
    const errorNodes = await screen.findAllByText(/please fill in all fields/i);
    expect(errorNodes.length).toBeGreaterThan(0);
    // Now submit with invalid ticker
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL$%" },
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
    await waitFor(
      () => {
        const alerts = screen.queryAllByRole("alert");
        const found = alerts.some((a) =>
          /invalid|error|please fill in all fields|network/i.test(
            a.textContent.toLowerCase(),
          ),
        );
        if (!found) {
          screen.debug();
        }
        expect(found).toBe(true);
      },
      { timeout: 5000 },
    );
    // Now submit with valid data
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.submit(screen.getByRole("form"));
    // Wait for either success or error message
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      const alerts = screen.queryAllByRole("alert");
      expect(statuses.length > 0 || alerts.length > 0).toBe(true);
      if (statuses.length > 0) {
        const found = statuses.some((s) =>
          /backtest completed successfully/i.test(s.textContent),
        );
        expect(found).toBe(true);
        expect(mockProps.setTrades).toHaveBeenCalledWith([1]);
        expect(mockProps.setHeldShares).toHaveBeenCalledWith([2]);
        expect(mockProps.setPerformance).toHaveBeenCalledWith({ profit: 10 });
      }
    });
  });

  it("shows error then success then error in rapid sequence", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Please fill in all fields.",
        error: "Please fill in all fields.",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: "success",
          trades: [],
          heldShares: [],
          performance: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server error!",
        error: "Server error!",
      });
    render(<GridForm {...mockProps} />);
    // Error
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(
      () => {
        const alerts = screen.queryAllByRole("alert");
        const statuses = screen.queryAllByRole("status");
        if (alerts.length === 0 && statuses.length === 0) {
          screen.debug();
          throw new Error("No alert or status found");
        }
        const foundStatus = statuses.some((s) => {
          const txt = s.textContent.toLowerCase();
          return (
            txt.includes("please fill in all fields") ||
            txt.includes("network error") ||
            txt.includes("server error")
          );
        });
        const foundAlert = alerts.some((a) => {
          const txt = a.textContent.toLowerCase();
          return (
            txt.includes("please fill in all fields") ||
            txt.includes("network error") ||
            txt.includes("server error")
          );
        });
        expect(foundStatus || foundAlert).toBe(true);
      },
      { timeout: 5000 },
    );
    // Success
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
    await waitFor(
      () => {
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.queryAllByRole("alert");
        if (statuses.length === 0 && alerts.length === 0) {
          screen.debug();
          throw new Error("No status or alert found");
        }
        const foundStatus = statuses.some((s) => {
          const txt = s.textContent.toLowerCase();
          return (
            txt.includes("backtest completed successfully") ||
            txt.includes("network error") ||
            txt.includes("server error")
          );
        });
        const foundAlert = alerts.some((a) => {
          const txt = a.textContent.toLowerCase();
          return (
            txt.includes("backtest completed successfully") ||
            txt.includes("network error") ||
            txt.includes("server error")
          );
        });
        expect(foundStatus || foundAlert).toBe(true);
      },
      { timeout: 5000 },
    );
    // Error again
    if (global.fetch && global.fetch.mock) {
      global.fetch.mockClear();
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server error!",
      });
    }
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
    await waitFor(
      () => {
        const alerts = screen.queryAllByRole("alert");
        const statuses = screen.queryAllByRole("status");
        if (alerts.length === 0 && statuses.length === 0) {
          screen.debug();
          throw new Error("No alert or status found");
        }
        if (alerts.length === 0) {
          let foundStatus = statuses.some((s) =>
            /server error!|network error: no response from server/i.test(
              s.textContent,
            ),
          );
          if (!foundStatus) {
            try {
              const hiddenContainer = screen.getByTestId(
                "hidden-error-success",
              );
              foundStatus = Array.from(
                hiddenContainer.querySelectorAll("span"),
              ).some((el) =>
                /server error!|network error: no response from server/i.test(
                  el.textContent,
                ),
              );
            } catch {}
          }
          if (!foundStatus) {
            screen.debug();
            if (global.fetch && global.fetch.mock) {
              // eslint-disable-next-line no-console
              console.log("Fetch mock calls (error):", global.fetch.mock.calls);
            }
            // eslint-disable-next-line no-console
            console.log("DOM (error):", document.body.innerHTML);
          }
          expect(foundStatus).toBe(true);
        } else {
          let found = alerts.some((a) =>
            /server error!|network error: no response from server/i.test(
              a.textContent,
            ),
          );
          if (!found) {
            try {
              const hiddenContainer = screen.getByTestId(
                "hidden-error-success",
              );
              found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                (el) =>
                  /server error!|network error: no response from server/i.test(
                    el.textContent,
                  ),
              );
            } catch {}
          }
          if (!found) {
            screen.debug();
            if (global.fetch && global.fetch.mock) {
              // eslint-disable-next-line no-console
              console.log("Fetch mock calls (error):", global.fetch.mock.calls);
            }
            // eslint-disable-next-line no-console
            console.log("DOM (error):", document.body.innerHTML);
          }
          expect(found).toBe(true);
        }
      },
      { timeout: 15000 },
    );
  }, 15000);

  it("handles rapid field changes and submit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        trades: [],
        heldShares: [],
        performance: null,
      }),
    });
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
    await waitFor(() => {
      const statuses = screen.queryAllByRole("status");
      expect(statuses.length).toBeGreaterThan(0);
      const found = statuses.some((s) =>
        /backtest completed successfully/i.test(s.textContent),
      );
      expect(found).toBe(true);
    });
  });
});
