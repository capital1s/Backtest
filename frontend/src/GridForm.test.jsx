// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GridForm from "./GridForm";

// Mock props for basic unit tests
const mockProps = {
  setTrades: vi.fn(),
  setHeldShares: vi.fn(),
  setTicker: vi.fn(),
  setTickerBlur: vi.fn(),
  setPerformance: vi.fn(),
  ticker: "AAPL",
  errorMessage: "",
  successMessage: "",
  setErrorMessage: vi.fn(),
  setSuccessMessage: vi.fn(),
};

describe("GridForm", () => {
  it("renders without crashing", () => {
    render(<GridForm {...mockProps} />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  it("displays all required form fields", () => {
    render(<GridForm {...mockProps} />);

    expect(
      screen.getByRole("combobox", { name: /ticker/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /shares/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /grid up/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /grid down/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /grid increment/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /timeframe/i }),
    ).toBeInTheDocument();
  });

  it("displays submit button", () => {
    render(<GridForm {...mockProps} />);
    expect(
      screen.getByRole("button", { name: /run backtest/i }),
    ).toBeInTheDocument();
  });

  it("displays error message when provided", () => {
    render(<GridForm {...mockProps} errorMessage="Test error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Test error");
  });

  it("displays success message when provided", () => {
    render(<GridForm {...mockProps} successMessage="Test success" />);
    expect(screen.getByRole("status")).toHaveTextContent("Test success");
  });

  it("shows current ticker value", () => {
    render(<GridForm {...mockProps} ticker="MSFT" />);
    const tickerSelect = screen.getByRole("combobox", { name: /ticker/i });
    expect(tickerSelect).toHaveValue("MSFT");
  });
});
