// testUtils/factories.js
import { faker } from '@faker-js/faker';

export function makeTrade(overrides = {}) {
  return {
    id: faker.datatype.number(),
    ticker: faker.finance.currencyCode(),
    shares: faker.datatype.number({ min: 1, max: 1000 }),
    price: faker.finance.amount(1, 1000, 2),
    side: faker.helpers.arrayElement(['buy', 'sell']),
    timestamp: faker.date.recent().toISOString(),
    ...overrides,
  };
}

// Example usage:
// const trades = Array.from({ length: 1000 }, () => makeTrade());
