// Suppress act() environment warnings for cleaner test output
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes(
      "The current testing environment is not configured to support act",
    )
  ) {
    return;
  }
  originalError(...args);
};
import "@testing-library/jest-dom";
import "@testing-library/jest-dom";
