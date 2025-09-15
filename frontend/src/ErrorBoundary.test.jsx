// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function ProblemChild() {
  throw new Error("Test error");
}

describe("ErrorBoundary", () => {
  it("renders fallback UI when child throws", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(getByText(/Something went wrong/i)).toBeTruthy();
  });

  it("renders children when no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Safe Child</div>
      </ErrorBoundary>
    );
    expect(getByText(/Safe Child/i)).toBeTruthy();
  });
});
