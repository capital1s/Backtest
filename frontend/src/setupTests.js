import "@testing-library/jest-dom";
import ResizeObserver from "@juggle/resize-observer";
globalThis.ResizeObserver = ResizeObserver;

import { vi, beforeAll, afterEach, afterAll } from "vitest";

// Mock Chart.js and react-chartjs-2 to prevent canvas warnings
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn().mockImplementation(() => {
    // Create a proper canvas mock element
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-testid", "historical-chart-canvas");
    canvas.setAttribute("role", "img");
    canvas.width = 300;
    canvas.height = 150;
    return canvas;
  }),
  Bar: vi.fn(() => null),
  Doughnut: vi.fn(() => null),
  Pie: vi.fn(() => null),
  PolarArea: vi.fn(() => null),
  Radar: vi.fn(() => null),
}));

// MSW global setup
import { http } from "msw";
import { setupServer } from "msw/node";
// Define a default handler for /backtest
const server = setupServer(
  http.post(/.*\/backtest$/, async ({ request }) => {
    console.log(
      "MSW handler: intercepted backtest POST (global)",
      request.url || "unknown URL",
    );
    let reqBody = {};
    try {
      reqBody = await request.json();
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
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
);
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
  } catch {
    // Silently ignore MSW reset errors - they don't affect test results
    // This prevents "Object.defineProperty called on non-object" warnings
  }
});
afterAll(() => {
  try {
    server.close();
  } catch {
    // Silently ignore MSW cleanup errors - they don't affect test results
  }
});
