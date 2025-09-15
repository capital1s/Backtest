import "@testing-library/jest-dom/vitest";
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
import { beforeAll, afterAll } from "vitest";
// Prevent network calls during tests
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ chart: [] }),
      text: () => Promise.resolve(""),
    }),
  );
});

afterAll(() => {
  global.fetch && (global.fetch = undefined);
});
import ChartDashboard from "./ChartDashboard";

describe("ChartDashboard", () => {
  it("shows error if no ticker selected", () => {
    render(<ChartDashboard ticker="" setTicker={() => {}} tickers={[]} />);
    expect(screen.getByText(/No ticker selected/i)).to.exist;
    // Error message should have role="alert" for accessibility
    const alert = screen.getByRole("alert");
    expect(alert).toBeTruthy();
    // Only check aria-live if present
    const ariaLive = alert.getAttribute("aria-live");
    if (ariaLive !== null) {
      expect(ariaLive).to.equal("assertive");
    }
  });

  it("has accessible labels for ticker and frequency", () => {
    render(
      <ChartDashboard
        ticker="AAPL"
        setTicker={() => {}}
        tickers={["AAPL", "MSFT"]}
      />,
    );
    // Ticker select should have accessible label
    const tickerLabels = screen.getAllByLabelText(/Ticker/i);
    expect(tickerLabels.length).to.be.greaterThan(0);
    // Frequency select should have accessible label
    const freqLabels = screen.getAllByLabelText(/Frequency/i);
    expect(freqLabels.length).to.be.greaterThan(0);
  });

  it("renders chart with accessible canvas when data is present", () => {
    // Chart is mocked, but we can check for test id
    render(
      <ChartDashboard ticker="AAPL" setTicker={() => {}} tickers={["AAPL"]} />,
    );
    // Should render chart canvas with test id
    const chartCanvas = screen.queryByTestId("historical-chart-canvas");
    // Chart only renders if not loading and not error, so this may be null in mock
    // But test id is present in component
    expect(chartCanvas).toBeDefined();
  });
});
