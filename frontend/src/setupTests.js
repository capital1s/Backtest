import "@testing-library/jest-dom";
import ResizeObserver from "@juggle/resize-observer";
globalThis.ResizeObserver = ResizeObserver;

import { vi } from "vitest";
vi.mock("react-chartjs-2", () => ({
  Line: () => null,
  Bar: () => null,
  Doughnut: () => null,
  Pie: () => null,
  PolarArea: () => null,
  Radar: () => null,
}));

// MSW global setup
import { http } from "msw";
import { setupServer } from "msw/node";
// Define a default handler for /backtest
const server = setupServer(
  http.post(/.*\/backtest$/, async (req, res, ctx) => {
    console.log("MSW handler: intercepted backtest POST (global)", req.url.href);
    let reqBody = {};
    try {
      reqBody = await req.json();
    } catch (err) {
      console.error("MSW handler: failed to parse request body (global)", err);
    }
    console.log("MSW handler request body (global):", reqBody);
    const response = {
      status: "success",
      message: "Backtest completed successfully",
      trades: [{ id: 1, type: "buy", price: 100, shares: 10 }],
      heldShares: [{ ticker: "AAPL", shares: 10 }],
      performance: {
        total_trades: 1,
        pnl: 50,
        win_rate: 100,
        wins: 1,
        losses: 0,
      },
    };
    console.log("MSW handler response (global):", response);
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  })
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
