import '@testing-library/jest-dom/vitest';
// @vitest-environment jsdom
import React from "react";
import { vi } from "vitest";
vi.mock("react-chartjs-2", () => ({
  Line: () => null,
  Bar: () => null,
  Doughnut: () => null,
  Pie: () => null,
  PolarArea: () => null,
  Radar: () => null,
}));

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TradeTable from "./TradeTable";

describe("TradeTable", () => {
  it("renders no trades message", () => {
    render(<TradeTable trades={[]} type="buy" />);
    expect(screen.getByText(/No buy trades/i)).to.exist;
  });

  it("renders trades table", () => {
    const trades = [
      {
        ticker: "AAPL",
        shares: 10,
        price: 170,
        time: "2025-09-12T09:30:00",
        type: "buy",
      },
      {
        ticker: "MSFT",
        shares: 5,
        price: 300,
        time: "2025-09-12T09:31:00",
        type: "buy",
      },
    ];
    render(<TradeTable trades={trades} type="buy" />);
    expect(screen.getByText("AAPL")).to.exist;
    expect(screen.getByText("MSFT")).to.exist;
    expect(screen.getByText("10")).to.exist;
    expect(screen.getByText("5")).to.exist;
    expect(screen.getByText("170.00")).to.exist;
    expect(screen.getByText("300.00")).to.exist;
  });
});
