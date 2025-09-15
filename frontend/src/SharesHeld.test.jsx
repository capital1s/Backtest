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
import SharesHeld from "./SharesHeld";

describe("SharesHeld", () => {
  it("renders no shares held message", () => {
    render(<SharesHeld heldShares={[]} />);
    expect(screen.getByText(/No shares held/i)).to.exist;
  });

  it("renders held shares table", () => {
    const heldShares = [
      { ticker: "AAPL", shares: 10 },
      { ticker: "MSFT", shares: 5 },
    ];
    render(<SharesHeld heldShares={heldShares} />);
    expect(screen.getByText("AAPL")).to.exist;
    expect(screen.getByText("MSFT")).to.exist;
    expect(screen.getByText("10")).to.exist;
    expect(screen.getByText("5")).to.exist;
  });
});
