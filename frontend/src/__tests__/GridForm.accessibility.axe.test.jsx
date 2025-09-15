import React from "react";
import { render } from "@testing-library/react";
import GridForm from "../GridForm";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";

expect.extend(toHaveNoViolations);

describe("GridForm Accessibility (axe)", () => {
  it("has no accessibility violations on initial render", async () => {
    const { container } = render(<GridForm ticker="AAPL" setTrades={() => {}} setHeldShares={() => {}} setTicker={() => {}} setTickerBlur={() => {}} setPerformance={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations after error", async () => {
    const { container, getAllByLabelText, getAllByRole } = render(<GridForm ticker="" setTrades={() => {}} setHeldShares={() => {}} setTicker={() => {}} setTickerBlur={() => {}} setPerformance={() => {}} />);
    const tickerDropdowns = getAllByLabelText(/ticker/i);
    tickerDropdowns[0].value = "";
    getAllByRole("form")[0].dispatchEvent(new Event("submit", { bubbles: true }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations after success", async () => {
    const { container, getAllByLabelText, getAllByRole } = render(<GridForm ticker="AAPL" setTrades={() => {}} setHeldShares={() => {}} setTicker={() => {}} setTickerBlur={() => {}} setPerformance={() => {}} />);
    const tickerDropdowns = getAllByLabelText(/ticker/i);
    tickerDropdowns[0].value = "AAPL";
    getAllByRole("form")[0].dispatchEvent(new Event("submit", { bubbles: true }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
