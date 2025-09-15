# Backtest Frontend

## Overview

This is the React/Vite frontend for the Backtest project. It provides a dashboard for grid trading backtests, real-time charts, and performance metrics.

## Usage

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Run tests:
   ```sh
   npm run test
   ```

## API Endpoints

- `POST /backtest`: Run a grid trading backtest
- `GET /api/historical`: Fetch historical data
- `GET /api/realtime`: Fetch real-time data
- `GET /api/login`: Login endpoint
- `GET /us_stock_tickers`: List US stock tickers

## Main Components

- `GridForm`: Form for grid trading parameters and backtest submission
- `ChartDashboard`: Displays historical and real-time charts
- `TradeChart`: Visualizes trade data
- `SharesHeld`: Shows held shares
- `TradeTable`: Lists buy/sell trades

## Props

See each component's file for detailed prop types and usage.

## Accessibility

All forms and interactive elements use ARIA attributes and labels for best practices.

## Performance

Major components use `React.memo` to optimize rendering.

## Code Quality

Code is linted with ESLint and formatted with Prettier. All tests pass with Vitest.

## Contributing

Please ensure all new code includes tests and follows the established code style.

## TypeScript Migration

All major components are being migrated to TypeScript for improved reliability and maintainability. See `src/GridForm.tsx` for a fully typed example.

## Advanced Usage

- Code splitting is enabled via React.lazy and Suspense for optimal performance.
- All event handlers and expensive calculations are memoized with useCallback and useMemo.
- Accessibility is enforced with ARIA roles, labels, and focus management.

## Testing

- Comprehensive test coverage for all components, including edge cases, error boundaries, and accessibility assertions using Vitest and React Testing Library.

## Troubleshooting

- If you encounter type errors, ensure your IDE is using the workspace TypeScript version and check `tsconfig.json`.
- For API/network errors, see the error messages displayed in the UI and check backend connectivity.

## Architecture Notes

- Components are function-based and use React hooks for state and side effects.
- Performance is optimized with memoization and code splitting.
- All forms and interactive elements are accessible and keyboard-navigable.

---

For backend usage and API details, see the backend README.
