// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/react";
import ChartDashboard from "./ChartDashboard";

// Prevent network calls during tests
beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ chart: [] }),
    text: () => Promise.resolve("")
  }));
});

afterAll(() => {
  
});

describe("ChartDashboard", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <ChartDashboard ticker="AAPL" setTicker={() => {}} tickers={["AAPL", "MSFT"]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
