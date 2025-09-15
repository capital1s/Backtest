// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  it("matches snapshot with children", () => {
    const { asFragment } = render(
      <ErrorBoundary>
        <div>Safe Child</div>
      </ErrorBoundary>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot with error fallback", () => {
    const ProblemChild = () => { throw new Error("Test error"); };
    const { asFragment } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
