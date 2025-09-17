import React from "react";
import { describe, it, expect, vi } from "vitest";
import GridForm from "../GridForm";
import { render, screen, fireEvent } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
function getMockProps() {
  return {
    setTrades: vi.fn(),
    setHeldShares: vi.fn(),
    setPerformance: vi.fn(),
  };
}

describe("GridForm integration", () => {
  it("shows error when required fields are missing", async () => {
    const mockProps = getMockProps();
    const Wrapper = () => {
      const [errorMessage, setErrorMessage] = React.useState("");
      const [successMessage, setSuccessMessage] = React.useState("");
      return (
        <GridForm
          {...mockProps}
          errorMessage={errorMessage}
          successMessage={successMessage}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      );
    };
    render(<Wrapper />);
    fireEvent.change(screen.getByRole("combobox", { name: /ticker/i }), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText(/number of shares/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid up value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid down value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/grid increment value/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/backtest timeframe/i), {
      target: { value: "" },
    });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      const statuses = screen.queryAllByRole("status");
      expect(alerts.length + statuses.length).toBeGreaterThan(0);
      const found = [...alerts, ...statuses].some((node) =>
        /please fill in all fields|invalid|error/i.test(node.textContent),
      );
      expect(found).toBe(true);
    });
  });
});
