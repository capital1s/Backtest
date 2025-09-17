console.log('[MSW-DEBUG] /msw-test-setup.js PROJECT-ROOT EXECUTED');
// MSW setup for Vitest: loaded via vite.config.js setupFiles
import 'whatwg-fetch';
import { setupServer } from 'msw/node';
import { http } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

const handlers = [
  http.post('/backtest', async (req, res, ctx) => {
    console.log('[MSW-SETUP] /backtest handler triggered (setup file)', req.method, req.url.href, await req.json());
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        message: 'Backtest completed successfully',
        trades: [{ id: 1, type: 'buy', price: 100, shares: 10 }],
        heldShares: [{ ticker: 'AAPL', shares: 10 }],
        performance: {
          total_trades: 1,
          pnl: 50,
          win_rate: 100,
          wins: 1,
          losses: 0,
        },
      })
    );
  }),
  http.post('http://localhost:8000/backtest', async (req, res, ctx) => {
    console.log('[MSW-SETUP] ABSOLUTE /backtest handler triggered', req.method, req.url.href, await req.json());
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        message: 'Backtest completed successfully',
        trades: [{ id: 1, type: 'buy', price: 100, shares: 10 }],
        heldShares: [{ ticker: 'AAPL', shares: 10 }],
        performance: {
          total_trades: 1,
          pnl: 50,
          win_rate: 100,
          wins: 1,
          losses: 0,
        },
      })
    );
  })
];
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
