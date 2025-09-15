// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { beforeAll, afterAll, vi } from "vitest";
import { render } from "@testing-library/react";
// Prevent network calls during tests
beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("")
  } as Response));
});

afterAll(() => {
  // @ts-ignore
  global.fetch = undefined;
});
import GridForm from "./GridForm";

describe("GridForm", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <GridForm
        setTrades={() => {}}
        setHeldShares={() => {}}
        setTicker={() => {}}
        setTickerBlur={() => {}}
        setPerformance={() => {}}
        ticker="AAPL"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
