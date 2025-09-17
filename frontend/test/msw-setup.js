// Polyfill fetch for jsdom/Vitest
console.log("[MSW-SETUP] msw-setup.js loaded");
import "whatwg-fetch";
import { setupServer } from "msw/node";
import { http } from "msw";
import { beforeAll, afterEach, afterAll } from "vitest";

export const handlers = [
  http.post("/backtest", async (req, res, ctx) => {
    console.log("[MSW] Intercepted /backtest request");
    return res(
      ctx.status(200),
      ctx.json({
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
      }),
    );
  }),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
