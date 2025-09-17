console.log(
  "[MSW-DEBUG] /frontend/src/__tests__/msw-test-setup.js TOP-LEVEL EXECUTED",
);
// MSW setup for Vitest: loaded via vite.config.js setupFilesAfterEnv
import "whatwg-fetch";
import { setupServer } from "msw/node";
import { http } from "msw";
import { beforeAll, afterEach, afterAll } from "vitest";

const handlers = [
  http.post("/backtest", async () => {
    console.log("[MSW-SETUP] /backtest handler triggered (setup file)");
    return new Response(
      JSON.stringify({
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
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }),
];
const server = setupServer(...handlers);

beforeAll(() => {
  try {
    server.listen({ onUnhandledRequest: "warn" });
  } catch (error) {
    console.warn("MSW server start warning:", error.message);
  }
});
afterEach(() => {
  try {
    server.resetHandlers();
  } catch (error) {
    console.warn("MSW reset warning (ignored):", error.message);
  }
});
afterAll(() => {
  try {
    server.close();
  } catch (error) {
    console.warn("MSW cleanup warning (ignored):", error.message);
  }
});
console.log("[MSW-SETUP] msw-test-setup.js loaded (setupFilesAfterEnv)");
