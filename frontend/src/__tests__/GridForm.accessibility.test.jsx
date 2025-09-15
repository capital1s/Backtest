import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GridForm from '../GridForm';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

const mockProps = {
  setTrades: () => {},
  setHeldShares: () => {},
  setTicker: () => {},
  setTickerBlur: () => {},
  setPerformance: () => {},
  ticker: ''
};

describe('GridForm Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<GridForm {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('allows keyboard navigation and submit', async () => {
    render(<GridForm {...mockProps} />);
    const user = userEvent.setup();
    // Tab through all form fields
  const tickerInput = screen.getByRole('combobox', { name: /ticker/i });
    const sharesInput = screen.getByLabelText(/number of shares/i);
    const gridUpInput = screen.getByLabelText(/grid up value/i);
    const gridDownInput = screen.getByLabelText(/grid down value/i);
    const gridIncrementInput = screen.getByLabelText(/grid increment value/i);
    const timeframeSelect = screen.getByLabelText(/backtest timeframe/i);
    const submitBtn = screen.getByRole('button', { name: /backtest/i });

    await user.tab();
    expect(tickerInput).toHaveFocus();
    await user.tab();
    expect(sharesInput).toHaveFocus();
    await user.tab();
    expect(gridUpInput).toHaveFocus();
    await user.tab();
    expect(gridDownInput).toHaveFocus();
    await user.tab();
    expect(gridIncrementInput).toHaveFocus();
    await user.tab();
    expect(timeframeSelect).toHaveFocus();
    await user.tab();
    expect(submitBtn).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(submitBtn).toHaveFocus();
  });
});

// Boundary value tests

describe('GridForm Boundary Values', () => {
  it('shows error for max ticker length', async () => {
    render(<GridForm {...mockProps} />);
  fireEvent.change(screen.getByRole('combobox', { name: /ticker/i }), { target: { value: 'ABCDEFGHIJK' } });
    fireEvent.change(screen.getByLabelText(/number of shares/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/grid up value/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/grid down value/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), { target: { value: '1 D' } });
    fireEvent.submit(screen.getByRole('form'));
  await waitFor(() => {
    const alerts = screen.queryAllByRole('alert');
    const statuses = screen.queryAllByRole('status');
    const found = [...alerts, ...statuses].some(node => /invalid ticker symbol/i.test(node.textContent));
    if (!found) {
      alerts.forEach((el, idx) => {
        // eslint-disable-next-line no-console
        console.log(`Alert[${idx}]:`, el.textContent);
      });
      statuses.forEach((el, idx) => {
        // eslint-disable-next-line no-console
        console.log(`Status[${idx}]:`, el.textContent);
      });
      screen.debug();
    }
    expect(found).toBe(true);
  });
  });
  it('accepts min and max numeric values', async () => {
    render(<GridForm {...mockProps} />);
  fireEvent.change(screen.getByRole('combobox', { name: /ticker/i }), { target: { value: 'AAPL' } });
    fireEvent.change(screen.getByLabelText(/number of shares/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/grid up value/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/grid down value/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), { target: { value: '0.001' } });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), { target: { value: '1 D' } });
    fireEvent.submit(screen.getByRole('form'));
    // Should not show error for valid min values
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

// Performance/large input tests

describe('GridForm Large Input', () => {
  it('handles very large numbers', async () => {
    render(<GridForm {...mockProps} />);
  fireEvent.change(screen.getByRole('combobox', { name: /ticker/i }), { target: { value: 'AAPL' } });
    fireEvent.change(screen.getByLabelText(/number of shares/i), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText(/grid up value/i), { target: { value: '99999.999' } });
    fireEvent.change(screen.getByLabelText(/grid down value/i), { target: { value: '99999.999' } });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), { target: { value: '99999.999' } });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), { target: { value: '1 D' } });
    fireEvent.submit(screen.getByRole('form'));
    // Should not show error for large valid values
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
