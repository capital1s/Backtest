import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import GridForm from "../GridForm";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

const mockProps = {
  setTrades: () => {},
  setHeldShares: () => {},
  setTicker: () => {},
  setTickerBlur: () => {},
  setPerformance: () => {},
  ticker: "",
};

describe("GridForm Accessibility", () => {
  it("has no accessibility violations", async () => {
    let _errorMessage = "";
    let _successMessage = "";
    const setErrorMessage = (msg) => {
      _errorMessage = msg;
    };
    const setSuccessMessage = (msg) => {
      _successMessage = msg;
    };
    const { container } = render(
      <GridForm
        {...mockProps}
        errorMessage={""}
        successMessage={""}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("allows keyboard navigation and submit", async () => {
    let errorMessage = "";
    let successMessage = "";
    const setErrorMessage = (msg) => {
      errorMessage = msg;
    };
    const setSuccessMessage = (msg) => {
      successMessage = msg;
    };
    render(
      <GridForm
        {...mockProps}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );
    const user = userEvent.setup();
    // Tab through all form fields
    const tickerInput = screen.getByRole("combobox", { name: /ticker/i });
    const sharesInput = screen.getByLabelText(/number of shares/i);
    const gridUpInput = screen.getByLabelText(/grid up value/i);
    const gridDownInput = screen.getByLabelText(/grid down value/i);
    const gridIncrementInput = screen.getByLabelText(/grid increment value/i);
    const timeframeSelect = screen.getByLabelText(/backtest timeframe/i);
    const submitBtn = screen.getByRole("button", { name: /backtest/i });

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
    await user.keyboard("{Enter}");
    expect(submitBtn).toHaveFocus();
  });
});

// Boundary value tests

describe("GridForm Boundary Values", () => {
  it("shows error for missing ticker selection", async () => {
    let errorMessage = "";
    let successMessage = "";
    const setErrorMessage = (msg) => {
      errorMessage = msg;
    };
    const setSuccessMessage = (msg) => {
      successMessage = msg;
    };

    const { rerender } = render(
      <GridForm
        {...mockProps}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );

    // Leave ticker empty but fill other fields
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });

    fireEvent.submit(screen.getByRole("form"));

    // Wait a bit for the state change then re-render
    await new Promise((resolve) => setTimeout(resolve, 100));

    rerender(
      <GridForm
        {...mockProps}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );

    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      const found = alerts.some((node) =>
        /please fill in all fields/i.test(node.textContent),
      );
      expect(found).toBe(true);
    });
  });
  it("accepts min and max numeric values", async () => {
    let errorMessage = "";
    let successMessage = "";
    const setErrorMessage = (msg) => {
      errorMessage = msg;
    };
    const setSuccessMessage = (msg) => {
      successMessage = msg;
    };
    render(
      <GridForm
        {...mockProps}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "0.001" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    // Should not show error for valid min values
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

// Performance/large input tests

describe("GridForm Large Input", () => {
  it("handles very large numbers", async () => {
    let errorMessage = "";
    let successMessage = "";
    const setErrorMessage = (msg) => {
      errorMessage = msg;
    };
    const setSuccessMessage = (msg) => {
      successMessage = msg;
    };
    render(
      <GridForm
        {...mockProps}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "99999.999" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "99999.999" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "99999.999" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "1 D" },
    });
    fireEvent.submit(screen.getByRole("form"));
    // Should not show error for large valid values
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("has no accessibility violations after error state", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GridForm
        {...mockProps}
        ticker=""
        errorMessage={""}
        successMessage={""}
        setErrorMessage={() => {}}
        setSuccessMessage={() => {}}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /run backtest/i });
    await user.click(submitButton);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations after success state", async () => {
    const { container } = render(
      <GridForm
        {...mockProps}
        ticker="AAPL"
        errorMessage={""}
        successMessage={"Backtest completed successfully"}
        setErrorMessage={() => {}}
        setSuccessMessage={() => {}}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
