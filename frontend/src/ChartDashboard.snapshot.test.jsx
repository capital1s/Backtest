// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { beforeAll, afterAll } from "vitest";
import { render, act } from "@testing-library/react";
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
  global.fetch && (global.fetch = undefined);
});

describe("ChartDashboard", () => {
  it("matches snapshot", async () => {
    let asFragment;
    await act(async () => {
      const renderResult = render(
        <ChartDashboard ticker="AAPL" setTicker={() => {}} tickers={["AAPL", "MSFT"]} />
      );
      asFragment = renderResult.asFragment;
      // Wait for any async state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
