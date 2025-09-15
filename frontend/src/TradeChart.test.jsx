import '@testing-library/jest-dom/vitest';
// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TradeChart from "./TradeChart.jsx";

describe("TradeChart", () => {
  it("renders no trades message when trades is empty", () => {
    render(<TradeChart trades={[]} />);
     const noTrades = screen.getAllByText(/No trades to display/i);
     expect(noTrades.length).toBeGreaterThan(0);
  });

  it("renders no trades message when trades is undefined", () => {
    render(<TradeChart trades={undefined} />);
     const noTrades = screen.getAllByText(/No trades to display/i);
     expect(noTrades.length).toBeGreaterThan(0);
  });

  it("renders chart title and trade data when trades are provided", () => {
    const trades = [
      { ticker: "AAPL", shares: 10, price: 170 },
      { ticker: "MSFT", shares: 5, price: 300 },
    ];
    render(<TradeChart trades={trades} />);
  expect(screen.getByText(/Trade Chart/i)).to.exist;
  expect(screen.getByText(/AAPL/)).to.exist;
  expect(screen.getByText(/MSFT/)).to.exist;
  expect(screen.getByText(/170/)).to.exist;
  expect(screen.getByText(/300/)).to.exist;
  });
});
