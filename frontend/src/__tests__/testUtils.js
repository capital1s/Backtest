// Shared test utilities for frontend tests
// Use this file to define expensive setup/teardown logic, global mocks, or reusable fixtures

import { vi } from 'vitest';

// Example: Global fetch mock
export const mockGlobalFetch = (mockImpl) => {
  beforeEach(() => {
    global.fetch = mockImpl || vi.fn();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
};

// Example: UserEvent setup helper
import userEvent from '@testing-library/user-event';
export const setupUser = () => userEvent.setup();

// Add more shared utilities as needed
