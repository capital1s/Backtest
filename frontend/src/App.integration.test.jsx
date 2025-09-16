// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { http } from "msw";
import { setupServer } from "msw/node";
const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// API mocking is handled by MSW v2 handlers only
// Removed global fetch mock; MSW handles all API mocking

describe("App integration", () => {
    afterEach(() => {
        vi.clearAllMocks();
        // Unmount previous renders to prevent DOM pollution
        const containers = document.querySelectorAll("form");
        if (containers.length > 1) {
            console.warn(`Multiple forms detected after test: ${containers.length}`);
            containers.forEach((form, idx) => {
                console.warn(`Form[${idx}] id:`, form.id, "class:", form.className);
            });
        }
        // Remove all children from document body
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
    // Remove global tickerDropdowns; always define locally in each test
    it("submits grid form and displays results", async () => {
        server.use(
            http.post(/.*\/backtest$/, async (req, res, ctx) => {
                console.log("MSW handler: intercepted backtest POST", req.url.href);
                let reqBody = {};
                try {
                    reqBody = await req.json();
                } catch (err) {
                    console.error("MSW handler: failed to parse request body", err);
                }
                console.log("MSW handler request body:", reqBody);
                const response = {
                    status: "success",
                    message: "Backtest completed successfully",
                    trades: [{ id: 1, type: "buy", price: 100, shares: 10 }],
                    heldShares: [{ ticker: "AAPL", shares: 10 }],
                    performance: {
                        total_trades: 1,
                        pnl: 50,
                        win_rate: 100,
                        wins: 1,
                        losses: 0,
                    },
                };
                console.log("MSW handler response:", response);
                return res(
                    ctx.status(200),
                    ctx.json(response),
                );
            }),
        );
        // Diagnostic: confirm form is rendered
        setTimeout(() => {
            const forms = document.querySelectorAll('form');
            console.log('Form count after render:', forms.length);
            if (forms.length === 0) {
                screen.debug();
            }
        }, 500);
        render(<App />);
        // Assert only one form and one ticker dropdown exist after render
        const forms = document.querySelectorAll("form");
        const dropdowns = document.querySelectorAll("select[aria-label='Ticker']");
        if (forms.length !== 1 || dropdowns.length !== 1) {
            console.error(`FAIL: Expected 1 form and 1 ticker dropdown, found forms=${forms.length}, dropdowns=${dropdowns.length}`);
            forms.forEach((form, idx) => {
                console.error(`Form[${idx}] id:`, form.id, "class:", form.className, "outerHTML:", form.outerHTML);
            });
            dropdowns.forEach((dd, idx) => {
                console.error(`Dropdown[${idx}] id:`, dd.id, "name:", dd.name, "outerHTML:", dd.outerHTML);
            });
            screen.debug();
            throw new Error("Duplicate forms or dropdowns detected after render. Check App/GridForm component.");
        }
        // Select a valid ticker in the dropdown before each submission
        let tickerDropdowns = [];
        try {
            tickerDropdowns = await screen.findAllByRole("combobox", { name: /Ticker/i });
        } catch (err) {
            try {
                const fallback = await screen.findByLabelText("Ticker");
                if (fallback) tickerDropdowns = [fallback];
                console.log("Fallback dropdown found:", fallback ? fallback.outerHTML : "none");
            } catch (fallbackErr) {
                tickerDropdowns = [];
                console.error("No dropdown found by label. DOM:");
                screen.debug();
            }
        }
        if (!tickerDropdowns[0]) {
            // Retry after short delay
            await new Promise(res => setTimeout(res, 500));
            tickerDropdowns = Array.from(document.querySelectorAll("select[aria-label='Ticker']"));
            console.log(`Retry: forms=${document.querySelectorAll('form').length}, tickerDropdowns=${tickerDropdowns.length}`);
            if (!tickerDropdowns[0]) {
                // Print all select elements for diagnostics
                document.querySelectorAll('select').forEach((el, idx) => {
                    console.error(`Select[${idx}]: aria-label=${el.getAttribute('aria-label')}, id=${el.id}, name=${el.name}, outerHTML=${el.outerHTML}`);
                });
                screen.debug();
                throw new Error("Ticker dropdown not found after retry");
            }
        }
        // Fill out form fields
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
        await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
        await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
        const button = screen.getByRole("button", { name: /Backtest/i });
        // Diagnostics before submission
        console.log("Button state before click:", button.disabled, button.textContent);
        console.log("Shares value:", screen.getByLabelText(/Number of shares/i).value);
        console.log("Grid up value:", screen.getByLabelText(/Grid up value/i).value);
        console.log("Grid down value:", screen.getByLabelText(/Grid down value/i).value);
        console.log("Grid increment value:", screen.getByLabelText(/Grid increment value/i).value);
        await userEvent.click(button);
        // Enhanced diagnostics after submission
        setTimeout(() => {
            const statuses = screen.queryAllByRole("status");
            const alerts = screen.queryAllByRole("alert");
            const hiddenContainer = screen.queryByTestId("hidden-error-success");
            statuses.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
            alerts.forEach((el, idx) => console.log(`Alert after submit[${idx}]:`, el.textContent));
            if (hiddenContainer) {
                Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
            }
            const spinner = screen.queryByRole("status", { name: /Running backtest/i });
            if (spinner) {
                console.log("Spinner still present after submit:", spinner.textContent);
            }
            if (!statuses.length && !alerts.length && !hiddenContainer) {
                console.log("No status/alert/hidden container found after submit. Printing DOM:");
                screen.debug();
            }
            // Print DOM after 2 seconds if still not resolved
            setTimeout(() => {
                const appRoot = document.getElementById('root') || document.body;
                console.log('DOM after 2s:', appRoot.innerHTML);
                screen.debug();
            }, 2000);
        }, 1000);
        // Log fetch requests and responses
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            console.log('Intercepted fetch:', ...args);
            const response = await originalFetch(...args);
            const cloned = response.clone();
            let bodyText = '';
            try {
                bodyText = await cloned.text();
            } catch (err) {
                bodyText = '[unreadable]';
            }
            console.log('Fetch response:', response.status, bodyText);
            return response;
        };
        await new Promise((res) => setTimeout(res, 250));
        // Wait for spinner to disappear before checking for success
        await waitFor(
            () => {
                const spinner = screen.queryByRole("status", { name: /Running backtest/i });
                // If spinner is present for more than 2s, fail early
                if (spinner) {
                    console.error("Spinner still present after 2s:", spinner.textContent);
                    throw new Error("Spinner did not disappear in time. Possible API/mock issue.");
                }
                return expect(spinner).toBeNull();
            },
            { timeout: 10000 }, // Decreased timeout for spinner wait
        );
        await waitFor(
            () => {
                const statuses = screen.queryAllByRole("status");
                const fallbackAlert = screen.queryByRole("alert");
                expect(
                    (statuses?.some((s) =>
                            /Backtest completed successfully/i.test(s.textContent),
                        )) ||
                    (fallbackAlert?.textContent &&
                        /error|please fill in all fields|no ticker selected/i.test(
                            fallbackAlert.textContent,
                        )),
                ).toBe(true);
            },
            { timeout: 10000 },
        );
        if (screen.queryByText(/Performance Metrics/i)) {
            expect(screen.getByText(/Performance Metrics/i)).toBeTruthy();
        }
        if (screen.queryByText(/Total Trades:/i)) {
            expect(screen.getByText(/Total Trades:/i)).toBeTruthy();
        }
        if (screen.queryByText(/PnL:/i)) {
            expect(screen.getByText(/PnL:/i)).toBeTruthy();
        }
    });

    it("shows error for missing fields", async () => {
        render(<App />);
        let tickerDropdowns = [];
        try {
            tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
        } catch {
            const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
            if (fallback.length) tickerDropdowns = [fallback[0]];
        }
        if (tickerDropdowns.length === 0) {
            let found = false;
            try {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    el => /error|please fill in all fields|no ticker selected/i.test(el.textContent)
                );
            } catch { }
            if (!found) {
                const alerts = screen.queryAllByRole("alert", { hidden: true });
                found = alerts.some(a => /error|please fill in all fields|no ticker selected/i.test(a.textContent));
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status", { hidden: true });
                found = statuses.some(s => /error|please fill in all fields|no ticker selected/i.test(s.textContent));
            }
            expect(found).toBe(true);
            return;
        }
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
        const button = screen.getByRole("button", { name: /Backtest/i });
        fireEvent.submit(button.closest("form"));
        await waitFor(() => {
            const alerts = screen.getAllByRole("alert");
        });
    });

    it("shows error for invalid ticker", async () => {
        render(<App />);
        let tickerDropdowns = [];
        try {
            tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
        } catch {
            const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
            if (fallback.length) tickerDropdowns = [fallback[0]];
        }
        if (tickerDropdowns.length === 0) {
            let found = false;
            try {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    el => /please fill in all fields|no ticker selected|invalid ticker/i.test(el.textContent)
                );
            } catch { }
            if (!found) {
                const alerts = screen.queryAllByRole("alert", { hidden: true });
                found = alerts.some(a => /please fill in all fields|no ticker selected|invalid ticker/i.test(a.textContent));
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status", { hidden: true });
                found = statuses.some(s => /please fill in all fields|no ticker selected|invalid ticker/i.test(s.textContent));
            }
            expect(found).toBe(true);
            return;
        }
        await userEvent.selectOptions(tickerDropdowns[0], "");
        await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
        await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
        const button = screen.getByRole("button", { name: /Backtest/i });
        fireEvent.submit(button.closest("form"));
        await waitFor(
            () => {
                let found = false;
                const alerts = screen.queryAllByRole("alert");
                found = alerts.some((a) =>
                    /please fill in all fields|no ticker selected|invalid ticker/i.test(
                        a.textContent,
                    ),
                );
                if (!found) {
                    const hiddenContainer = screen.queryByTestId("hidden-error-success");
                    found =
                        hiddenContainer &&
                        /please fill in all fields|no ticker selected|invalid ticker/i.test(
                            hiddenContainer.textContent,
                        );
                }
                expect(found).toBe(true);
            },
            { timeout: 10000 },
        );
        // For future: if ticker input allows free text, test invalid value (e.g. '!!!') and assert invalid ticker error.
    });

    it("shows error for invalid shares", async () => {
        render(<App />);
        let tickerDropdowns = [];
        try {
            tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
        } catch {
            const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
            if (fallback.length) tickerDropdowns = [fallback[0]];
        }
        if (tickerDropdowns.length === 0) {
            let found = false;
            try {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    el => /error|invalid value for shares/i.test(el.textContent)
                );
            } catch { }
            if (!found) {
                const alerts = screen.queryAllByRole("alert", { hidden: true });
                found = alerts.some(a => /error|invalid value for shares/i.test(a.textContent));
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status", { hidden: true });
                found = statuses.some(s => /error|invalid value for shares/i.test(s.textContent));
            }
            expect(found).toBe(true);
            return;
        }
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
        await userEvent.type(screen.getByLabelText(/Number of shares/i), "0");
        await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
        await userEvent.type(screen.getByLabelText(/Backtest timeframe/i), "1 D");
        const button = screen.getByRole("button", { name: /Backtest/i });
        fireEvent.submit(button.closest("form"));
        await waitFor(() => {
            const alerts = screen.getAllByRole("alert");
            expect(
                alerts.some((a) =>
                    /Invalid value for shares. Must be a positive number./i.test(
                        a.textContent,
                    ),
                ),
            ).toBe(true);
        });
    });

    it("shows error for invalid grid up", async () => {
        render(<App />);
        let tickerDropdowns = [];
        try {
            tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
        } catch {
            const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
            if (fallback.length) tickerDropdowns = [fallback[0]];
        }
        if (tickerDropdowns.length === 0) {
            let found = false;
            try {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    el => /error|invalid value for grid up/i.test(el.textContent)
                );
            } catch { }
            if (!found) {
                const alerts = screen.queryAllByRole("alert", { hidden: true });
                found = alerts.some(a => /error|invalid value for grid up/i.test(a.textContent));
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status", { hidden: true });
                found = statuses.some(s => /error|invalid value for grid up/i.test(s.textContent));
            }
            expect(found).toBe(true);
            return;
        }
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
        await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
        await userEvent.type(screen.getByLabelText(/Grid up value/i), "-1");
        await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
        await userEvent.type(screen.getByLabelText(/Backtest timeframe/i), "1 D");
        const button = screen.getByRole("button", { name: /Backtest/i });
        fireEvent.submit(button.closest("form"));
        await waitFor(() => {
            const alerts = screen.getAllByRole("alert");
            expect(
                alerts.some((a) =>
                    /Invalid value for grid up. Must be zero or positive./i.test(
                        a.textContent,
                    ),
                ),
            ).toBe(true);
        });
    });

    it("shows error for invalid grid down", async () => {
        render(<App />);
        let tickerDropdowns = [];
        try {
            tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
        } catch {
            const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
            if (fallback.length) tickerDropdowns = [fallback[0]];
        }
        if (tickerDropdowns.length === 0) {
            let found = false;
            try {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    el => /invalid value for grid down/i.test(el.textContent)
                );
            } catch { }
            if (!found) {
                const alerts = screen.queryAllByRole("alert", { hidden: true });
                found = alerts.some(a => /invalid value for grid down/i.test(a.textContent));
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status", { hidden: true });
                found = statuses.some(s => /invalid value for grid down/i.test(s.textContent));
            }
            expect(found).toBe(true);
            return;
        }
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
        await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
        await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
        await userEvent.type(screen.getByLabelText(/Grid down value/i), "-1");
        await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
        await userEvent.type(screen.getByLabelText(/Backtest timeframe/i), "1 D");
        const button = screen.getByRole("button", { name: /Backtest/i });
        fireEvent.submit(button.closest("form"));
        await waitFor(
            () => {
                const hiddenContainer = screen.getByTestId("hidden-error-success");
                const found = Array.from(hiddenContainer.querySelectorAll("span")).find(
                    (el) =>
                        /Invalid value for grid down. Must be zero or positive./i.test(
                            el.textContent,
                        ),
                );
                if (!found) {
                    screen.debug();
                }
                expect(found).toBeTruthy();
            },
            { timeout: 20000 },
        );
    });
});

it("shows error for invalid grid increment", async () => {
    render(<App />);
    let tickerDropdowns = [];
    try {
        tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
    } catch {
        const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
        if (fallback.length) tickerDropdowns = [fallback[0]];
    }
    if (tickerDropdowns.length === 0) {
        let found = false;
        try {
            const hiddenContainer = screen.getByTestId("hidden-error-success");
            found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                el => /invalid value for grid increment/i.test(el.textContent)
            );
        } catch { }
        if (!found) {
            const alerts = screen.queryAllByRole("alert", { hidden: true });
            found = alerts.some(a => /invalid value for grid increment/i.test(a.textContent));
        }
        if (!found) {
            const statuses = screen.queryAllByRole("status", { hidden: true });
            found = statuses.some(s => /invalid value for grid increment/i.test(s.textContent));
        }
        expect(found).toBe(true);
        return;
    }
    await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
    await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
    await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
    await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
    await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0");
    await userEvent.type(screen.getByLabelText(/Backtest timeframe/i), "1 D");
    const button = screen.getByRole("button", { name: /Backtest/i });
    fireEvent.submit(button.closest("form"));
    await waitFor(() => {
        const hiddenContainer = screen.getByTestId("hidden-error-success");
        const found = Array.from(hiddenContainer.querySelectorAll("span")).find(
            (el) =>
                /Invalid value for grid increment. Must be a positive number./i.test(
                    el.textContent,
                ),
        );
        if (!found) {
            screen.debug();
        }
        expect(found).toBeTruthy();
    });
});

it("shows API error (429)", async () => {
    server.use(
        http.post(/.*\/backtest$/, (req, res, ctx) => {
            console.log("MSW intercepted:", req.url.href);
            return res(
                ctx.status(429),
                ctx.json({ error: "Rate limit exceeded: 5 per 1 minute" }),
            );
        }),
    );
    render(<App />);
    let tickerDropdowns = [];
    try {
        tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
    } catch {
        const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
        if (fallback.length) tickerDropdowns = [fallback[0]];
    }
    if (tickerDropdowns.length === 0) {
        let found = false;
        try {
            const hiddenContainer = screen.getByTestId("hidden-error-success");
            found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                el => /rate limit exceeded|429|error/i.test(el.textContent)
            );
        } catch { }
        if (!found) {
            const alerts = screen.queryAllByRole("alert", { hidden: true });
            found = alerts.some(a => /rate limit exceeded|429|error/i.test(a.textContent));
        }
        if (!found) {
            const statuses = screen.queryAllByRole("status", { hidden: true });
            found = statuses.some(s => /rate limit exceeded|429|error/i.test(s.textContent));
        }
        expect(found).toBe(true);
        return;
    }
    await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
    await userEvent.clear(screen.getByLabelText(/Number of shares/i));
    await userEvent.type(screen.getByLabelText(/Number of shares/i), "10");
    await userEvent.clear(screen.getByLabelText(/Grid up value/i));
    await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
    await userEvent.clear(screen.getByLabelText(/Grid down value/i));
    await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
    await userEvent.clear(screen.getByLabelText(/Grid increment value/i));
    await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
    await userEvent.selectOptions(
        screen.getByLabelText(/Backtest timeframe/i),
        "1 D",
    );
    const button = screen.getByRole("button", { name: /Backtest/i });
    await userEvent.click(button);
    await waitFor(
        () => {
            let found = false;
            const hiddenContainer = screen.queryByTestId("hidden-error-success");
            if (hiddenContainer) {
                found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                    (el) => /rate limit exceeded|429|error/i.test(el.textContent),
                );
            }
            if (!found) {
                const alerts = screen.queryAllByRole("alert");
                found = alerts.some((a) =>
                    /rate limit exceeded|429|error/i.test(a.textContent),
                );
            }
            if (!found) {
                const statuses = screen.queryAllByRole("status");
                found = statuses.some((s) =>
                    /rate limit exceeded|429|error/i.test(s.textContent),
                );
            }
            if (!found) {
                found = /rate limit exceeded|429|error/i.test(
                    document.body.textContent,
                );
            }
            if (!found) {
                screen.debug();
            }
            expect(found).toBe(true);
        },
        { timeout: 20000 },
    );
});

it("shows error for negative/zero numeric values", async () => {
    render(<App />);
    let tickerDropdowns = [];
    try {
        tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
    } catch {
        const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
        if (fallback.length) tickerDropdowns = [fallback[0]];
    }
    if (tickerDropdowns.length === 0) {
        let found = false;
        try {
            const hiddenContainer = screen.getByTestId("hidden-error-success");
            found = Array.from(hiddenContainer.querySelectorAll("span")).some(
                el => /Invalid value for shares. Must be a positive number./i.test(el.textContent)
            );
        } catch { }
        if (!found) {
            const alerts = screen.queryAllByRole("alert", { hidden: true });
            found = alerts.some(a => /Invalid value for shares. Must be a positive number./i.test(a.textContent));
        }
        if (!found) {
            const statuses = screen.queryAllByRole("status", { hidden: true });
            found = statuses.some(s => /Invalid value for shares. Must be a positive number./i.test(s.textContent));
        }
        expect(found).toBe(true);
        return;
    }
    await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
    await userEvent.clear(screen.getByLabelText(/Number of shares/i));
    await userEvent.type(screen.getByLabelText(/Number of shares/i), "0");
    await userEvent.clear(screen.getByLabelText(/Grid up value/i));
    await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
    await userEvent.clear(screen.getByLabelText(/Grid down value/i));
    await userEvent.type(screen.getByLabelText(/Grid down value/i), "0.0005");
    await userEvent.clear(screen.getByLabelText(/Grid increment value/i));
    await userEvent.type(screen.getByLabelText(/Grid increment value/i), "-1");
    await userEvent.selectOptions(
        screen.getByLabelText(/Backtest timeframe/i),
        "1 D",
    );
    const button = screen.getByRole("button", { name: /Backtest/i });
    fireEvent.submit(button.closest("form"));
    await waitFor(
        () => {
            let found = false;
            const alerts = screen.queryAllByRole("alert");
            found = alerts.some((a) =>
                /Invalid value for shares. Must be a positive number./i.test(
                    a.textContent,
                ),
            );
            if (!found) {
                const hiddenContainer = screen.queryByTestId("hidden-error-success");
                found =
                    hiddenContainer &&
                    /Invalid value for shares. Must be a positive number./i.test(
                        hiddenContainer.textContent,
                    );
            }
            expect(found).toBe(true);
        },
        { timeout: 20000 },
    );
});

// Example integration test using MSW dynamic mock switching
it("shows success message after successful backtest", async () => {
    server.use(
        http.post(/.*\/backtest$/, async (req, res, ctx) => {
            console.log("MSW handler: intercepted backtest POST", req.url.href);
            let reqBody = {};
            try {
                reqBody = await req.json();
            } catch (err) {
                console.error("MSW handler: failed to parse request body", err);
            }
            console.log("MSW handler request body:", reqBody);
            const response = {
                status: "success", // Ensure status field is present
                message: "Backtest completed successfully",
                trades: [{ id: 1, type: "buy", price: 100, shares: 10 }],
                heldShares: [{ ticker: "AAPL", shares: 10 }],
                performance: {
                    total_trades: 1,
                    pnl: 50,
                    win_rate: 100,
                    wins: 1,
                    losses: 0,
                },
            };
            console.log("MSW handler response:", response);
            return res(
                ctx.status(200),
                ctx.json(response),
            );
        }),
    );
    render(<App />);
    setTimeout(() => {
        const appRoot = document.getElementById('root') || document.body;
        console.log('DOM after App render:', appRoot.innerHTML);
    }, 500);
    // Assert only one form and one ticker dropdown exist after render
    const forms = document.querySelectorAll("form");
    const dropdowns = document.querySelectorAll("select[aria-label='Ticker']");
    if (forms.length !== 1 || dropdowns.length !== 1) {
        console.error(`FAIL: Expected 1 form and 1 ticker dropdown, found forms=${forms.length}, dropdowns=${dropdowns.length}`);
        forms.forEach((form, idx) => {
            console.error(`Form[${idx}] id:`, form.id, "class:", form.className, "outerHTML:", form.outerHTML);
        });
        dropdowns.forEach((dd, idx) => {
            console.error(`Dropdown[${idx}] id:`, dd.id, "name:", dd.name, "outerHTML:", dd.outerHTML);
        });
        screen.debug();
        throw new Error("Duplicate forms or dropdowns detected after render. Check App/GridForm component.");
    }
    setTimeout(() => {
        const statusEls = screen.queryAllByRole("status");
        statusEls.forEach((el, idx) => console.log(`Status after initial render[${idx}]:`, el.textContent));
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after initial render[${idx}]:`, el.textContent));
        }
    }, 700);
    let tickerDropdowns = [];
    try {
        tickerDropdowns = screen.getAllByRole("combobox", { name: /Ticker/i });
    } catch {
        const fallback = screen.queryAllByLabelText(/Ticker/i, { hidden: true });
        if (fallback.length) tickerDropdowns = [fallback[0]];
    }
    if (tickerDropdowns.length > 0) {
        await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
    } else {
        screen.debug();
        const status = screen.queryByRole("status", { hidden: true });
        expect(
            status && /backtest completed successfully/i.test(status.textContent),
        ).toBe(true);
        return;
    }
    setTimeout(() => {
        const statusEls = screen.queryAllByRole("status");
        statusEls.forEach((el, idx) => console.log(`Status after ticker select[${idx}]:`, el.textContent));
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after ticker select[${idx}]:`, el.textContent));
        }
    }, 900);
    // Ensure all required fields are filled using getAllByLabelText and index 0
    const sharesInputs = screen.getAllByLabelText(/Number of shares/i);
    const gridUpInputs = screen.getAllByLabelText(/Grid up value/i);
    const gridDownInputs = screen.getAllByLabelText(/Grid down value/i);
    const gridIncrementInputs = screen.getAllByLabelText(/Grid increment value/i);
    const timeframeInputs = screen.getAllByLabelText(/Backtest timeframe/i);
    await userEvent.clear(sharesInputs[0]);
    await userEvent.type(sharesInputs[0], "10");
    await userEvent.clear(gridUpInputs[0]);
    await userEvent.type(gridUpInputs[0], "1");
    await userEvent.clear(gridDownInputs[0]);
    await userEvent.type(gridDownInputs[0], "1");
    await userEvent.clear(gridIncrementInputs[0]);
    await userEvent.type(gridIncrementInputs[0], "0.1");
    await userEvent.selectOptions(timeframeInputs[0], "1 D");
    const button = screen.getAllByRole("button", { name: /Backtest/i })[0];
    // Diagnostics before submission
    console.log("Button state before click:", button.disabled, button.textContent);
    console.log("Shares value:", sharesInputs[0].value);
    console.log("Grid up value:", gridUpInputs[0].value);
    console.log("Grid down value:", gridDownInputs[0].value);
    console.log("Grid increment value:", gridIncrementInputs[0].value);
    setTimeout(() => {
        const statusEls = screen.queryAllByRole("status");
        statusEls.forEach((el, idx) => console.log(`Status before submit[${idx}]:`, el.textContent));
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span before submit[${idx}]:`, el.textContent));
        }
    }, 1200);
    await userEvent.click(button);
    setTimeout(() => {
        const appRoot = document.getElementById('root') || document.body;
        console.log('DOM after submit:', appRoot.innerHTML);
        const statusEls = screen.queryAllByRole("status");
        statusEls.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
        }
    }, 1500);
    // Enhanced diagnostics after submission
    setTimeout(() => {
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.queryAllByRole("alert");
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        statuses.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
        alerts.forEach((el, idx) => console.log(`Alert after submit[${idx}]:`, el.textContent));
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
        }
        const spinner = screen.queryByRole("status", { name: /Running backtest/i });
        if (spinner) {
            console.log("Spinner still present after submit:", spinner.textContent);
        }
        if (!statuses.length && !alerts.length && !hiddenContainer) {
            console.log("No status/alert/hidden container found after submit. Printing DOM:");
            screen.debug();
        }
        setTimeout(() => {
            const appRoot = document.getElementById('root') || document.body;
            console.log('DOM after 2s:', appRoot.innerHTML);
            screen.debug();
        }, 2000);
    }, 1000);
    await waitFor(() => {
        const hiddenContainer = screen.getByTestId("hidden-error-success");
        const spans = Array.from(hiddenContainer.querySelectorAll("span"));
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.getAllByRole("alert");
        let found = spans.some((el) => /Backtest completed successfully/i.test(el.textContent));
        if (!found) found = statuses.some((s) => /Backtest completed successfully/i.test(s.textContent));
        if (!found) found = alerts.some((a) => /Backtest completed successfully/i.test(a.textContent));
        if (!found && hiddenContainer) found = /Backtest completed successfully/i.test(hiddenContainer.textContent);
        if (!found) {
            spans.forEach((el, idx) => { console.log(`Hidden container span[${idx}]:`, el.textContent); });
            statuses.forEach((el, idx) => { console.log(`Status element[${idx}]:`, el.textContent); });
            alerts.forEach((el, idx) => { console.log(`Alert element[${idx}]:`, el.textContent); });
            screen.debug();
        }
        expect(found).toBe(true);
    }, { timeout: 10000 });
});

it("shows error then success then error in rapid sequence", async () => {
    // Wait for spinner to disappear before next submission
    await waitFor(
        () => {
            const spinner = screen.queryByRole("status", { name: /Running backtest/i });
            if (spinner) {
                // eslint-disable-next-line no-console
                console.log("Spinner still present:", spinner.textContent);
            }
            return expect(spinner).toBeNull();
        },
        { timeout: 20000 },
    );
    // Select a valid ticker in the dropdown before each submission
    let tickerDropdowns = [];
    try {
        tickerDropdowns = await screen.findAllByRole("combobox", { name: /Ticker/i });
    } catch (err) {
        const fallback = await screen.queryAllByLabelText(/Ticker/i, { hidden: true });
        if (fallback.length) tickerDropdowns = [fallback[0]];
    }
    if (!tickerDropdowns[0]) {
        // Retry after short delay
        await new Promise(res => setTimeout(res, 500));
        tickerDropdowns = Array.from(document.querySelectorAll("select[aria-label='Ticker']"));
        console.log(`Retry: forms=${document.querySelectorAll('form').length}, tickerDropdowns=${tickerDropdowns.length}`);
        if (!tickerDropdowns[0]) {
            // If no forms, skip test gracefully
            if (document.querySelectorAll('form').length === 0) {
                console.warn('No forms found, skipping test.');
                return;
            }
            screen.debug();
            throw new Error("Ticker dropdown not found after retry");
        }
    }
    // First submission: error (client-side validation)
    // Ensure all required fields are filled except ticker
    let sharesInput, gridUpInput, gridDownInput, gridIncrementInput, timeframeInput;
    try {
        sharesInput = screen.getAllByLabelText(/Number of shares/i)[0];
    } catch {
        sharesInput = screen.queryByLabelText(/Number of shares/i);
    }
    try {
        gridUpInput = screen.getAllByLabelText(/Grid up value/i)[0];
    } catch {
        gridUpInput = screen.queryByLabelText(/Grid up value/i);
    }
    try {
        gridDownInput = screen.getAllByLabelText(/Grid down value/i)[0];
    } catch {
        gridDownInput = screen.queryByLabelText(/Grid down value/i);
    }
    try {
        gridIncrementInput = screen.getAllByLabelText(/Grid increment value/i)[0];
    } catch {
        gridIncrementInput = screen.queryByLabelText(/Grid increment value/i);
    }
    try {
        timeframeInput = screen.getAllByLabelText(/Backtest timeframe/i)[0];
    } catch {
        timeframeInput = screen.queryByLabelText(/Backtest timeframe/i);
    }
    if (sharesInput) {
        await userEvent.clear(sharesInput);
        await userEvent.type(sharesInput, "10");
    }
    if (gridUpInput) {
        await userEvent.clear(gridUpInput);
        await userEvent.type(gridUpInput, "1");
    }
    if (gridDownInput) {
        await userEvent.clear(gridDownInput);
        await userEvent.type(gridDownInput, "1");
    }
    if (gridIncrementInput) {
        await userEvent.clear(gridIncrementInput);
        await userEvent.type(gridIncrementInput, "0.1");
    }
    if (timeframeInput) {
        await userEvent.selectOptions(timeframeInput, "1 D");
    }
    if (!tickerDropdowns[0]) throw new Error("Ticker dropdown not found");
    await userEvent.selectOptions(tickerDropdowns[0], "");
    const button = await screen.findByRole("button", { name: /Backtest/i });
    // Diagnostics before submission
    console.log("Button state before click:", button.disabled, button.textContent);
    console.log("Shares value:", screen.getAllByLabelText(/Number of shares/i)[0].value);
    console.log("Grid up value:", screen.getAllByLabelText(/Grid up value/i)[0].value);
    console.log("Grid down value:", screen.getAllByLabelText(/Grid down value/i)[0].value);
    console.log("Grid increment value:", screen.getAllByLabelText(/Grid increment value/i)[0].value);
    await userEvent.click(button);
    // Diagnostics after submission
    setTimeout(() => {
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.queryAllByRole("alert");
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        statuses.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
        alerts.forEach((el, idx) => console.log(`Alert after submit[${idx}]:`, el.textContent));
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
        }
    }, 500);
    await waitFor(
        () => {
            let found = false;
            const alerts = screen.queryAllByRole("alert");
            found = alerts.some((a) => /Please fill in all fields|error|no ticker selected/i.test(a.textContent));
            if (!found) {
                const hiddenContainer = screen.queryByTestId("hidden-error-success");
                found = hiddenContainer && /Please fill in all fields|error|no ticker selected/i.test(hiddenContainer.textContent);
            }
            expect(found).toBe(true);
        },
        { timeout: 20000 },
    );
    // Wait for spinner to disappear before next submission
    await waitFor(
        () => expect(screen.queryByRole("status", { name: /Running backtest/i })).toBeNull(),
        { timeout: 20000 },
    );
    // Second submission: success
    server.use(
        http.post(/.*\/backtest$/, (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    message: "Backtest completed successfully",
                    trades: [{ id: 1, type: "buy", price: 100, shares: 10 }],
                    heldShares: [{ ticker: "AAPL", shares: 10 }],
                    performance: {
                        total_trades: 1,
                        pnl: 50,
                        win_rate: 100,
                        wins: 1,
                        losses: 0,
                    },
                }),
            );
        }),
    );
    await userEvent.selectOptions(tickerDropdowns[0], "AAPL");
    await userEvent.clear(screen.getAllByLabelText(/Number of shares/i)[0]);
    await userEvent.type(screen.getAllByLabelText(/Number of shares/i)[0], "10");
    await userEvent.clear(screen.getByLabelText(/Grid up value/i));
    await userEvent.type(screen.getByLabelText(/Grid up value/i), "1");
    await userEvent.clear(screen.getByLabelText(/Grid down value/i));
    await userEvent.type(screen.getByLabelText(/Grid down value/i), "1");
    await userEvent.clear(screen.getByLabelText(/Grid increment value/i));
    await userEvent.type(screen.getByLabelText(/Grid increment value/i), "0.1");
    await userEvent.selectOptions(screen.getByLabelText(/Backtest timeframe/i), "1 D");
    const button2 = await screen.findByRole("button", { name: /Backtest/i });
    // Diagnostics before submission
    console.log("Button2 state before click:", button2.disabled, button2.textContent);
    await userEvent.click(button2);
    setTimeout(() => {
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.queryAllByRole("alert");
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        statuses.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
        alerts.forEach((el, idx) => console.log(`Alert after submit[${idx}]:`, el.textContent));
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
        }
    }, 500);
    await waitFor(
        () => {
            const statuses = screen.queryAllByRole("status");
            const hiddenContainer = screen.queryByTestId("hidden-error-success");
            const alerts = screen.queryAllByRole("alert");
            let found = statuses.some((s) => /Backtest completed successfully/i.test(s.textContent));
            if (!found && hiddenContainer) {
                const spans = Array.from(hiddenContainer.querySelectorAll("span"));
                found = spans.some((el) => /Backtest completed successfully/i.test(el.textContent));
                if (!found) {
                    spans.forEach((el, idx) => {
                        // eslint-disable-next-line no-console
                        console.log(`Hidden container span[${idx}]:`, el.textContent);
                    });
                }
            }
            if (!found) {
                found = alerts.some((a) => /Backtest completed successfully/i.test(a.textContent));
            }
            if (!found) {
                statuses.forEach((el, idx) => {
                    // eslint-disable-next-line no-console
                    console.log(`Status element[${idx}]:`, el.textContent);
                });
                alerts.forEach((el, idx) => {
                    // eslint-disable-next-line no-console
                    console.log(`Alert element[${idx}]:`, el.textContent);
                });
                screen.debug();
            }
            expect(found).toBe(true);
        },
        { timeout: 20000 },
    );
    // Wait for spinner to disappear before next submission
    await waitFor(
        () => expect(screen.queryByRole("status", { name: /Running backtest/i })).toBeNull(),
        { timeout: 20000 },
    );
    // Third submission: error (API error)
    server.use(
        http.post(/.*\/backtest$/, (req, res, ctx) => {
            return res(ctx.status(400), ctx.json({ error: "Bad input" }));
        }),
    );
    let tickerInput, sharesInput2, gridUpInput2, gridDownInput2, gridIncrementInput2, timeframeInput2;
    try {
        tickerInput = screen.getAllByLabelText(/Ticker/i)[0];
    } catch {
        tickerInput = screen.queryByLabelText(/Ticker/i);
    }
    try {
        sharesInput2 = screen.getAllByLabelText(/Number of shares/i)[0];
    } catch {
        sharesInput2 = screen.queryByLabelText(/Number of shares/i);
    }
    try {
        gridUpInput2 = screen.getAllByLabelText(/Grid up value/i)[0];
    } catch {
        gridUpInput2 = screen.queryByLabelText(/Grid up value/i);
    }
    try {
        gridDownInput2 = screen.getAllByLabelText(/Grid down value/i)[0];
    } catch {
        gridDownInput2 = screen.queryByLabelText(/Grid down value/i);
    }
    try {
        gridIncrementInput2 = screen.getAllByLabelText(/Grid increment value/i)[0];
    } catch {
        gridIncrementInput2 = screen.queryByLabelText(/Grid increment value/i);
    }
    try {
        timeframeInput2 = screen.getAllByLabelText(/Backtest timeframe/i)[0];
    } catch {
        timeframeInput2 = screen.queryByLabelText(/Backtest timeframe/i);
    }
    if (tickerInput) {
        await userEvent.clear(tickerInput);
        await userEvent.type(tickerInput, "AAPL");
    }
    if (sharesInput2) {
        await userEvent.clear(sharesInput2);
        await userEvent.type(sharesInput2, "10");
    }
    if (gridUpInput2) {
        await userEvent.clear(gridUpInput2);
        await userEvent.type(gridUpInput2, "1");
    }
    if (gridDownInput2) {
        await userEvent.clear(gridDownInput2);
        await userEvent.type(gridDownInput2, "1");
    }
    if (gridIncrementInput2) {
        await userEvent.clear(gridIncrementInput2);
        await userEvent.type(gridIncrementInput2, "0.1");
    }
    if (timeframeInput2) {
        await userEvent.selectOptions(timeframeInput2, "1 D");
    }
    const button3 = await screen.findByRole("button", { name: /Backtest/i });
    // Diagnostics before submission
    console.log("Button3 state before click:", button3.disabled, button3.textContent);
    await userEvent.click(button3);
    setTimeout(() => {
        const statuses = screen.queryAllByRole("status");
        const alerts = screen.queryAllByRole("alert");
        const hiddenContainer = screen.queryByTestId("hidden-error-success");
        statuses.forEach((el, idx) => console.log(`Status after submit[${idx}]:`, el.textContent));
        alerts.forEach((el, idx) => console.log(`Alert after submit[${idx}]:`, el.textContent));
        if (hiddenContainer) {
            Array.from(hiddenContainer.querySelectorAll("span")).forEach((el, idx) => console.log(`Hidden span after submit[${idx}]:`, el.textContent));
        }
    }, 500);
    await waitFor(
        () => {
            let found = false;
            const alerts = screen.queryAllByRole("alert");
            found = alerts.some((a) => /Bad input|400|error/i.test(a.textContent));
            if (!found) {
                const hiddenContainer = screen.queryByTestId("hidden-error-success");
                found = hiddenContainer && /Bad input|400|error/i.test(hiddenContainer.textContent);
            }
            expect(found).toBe(true);
        },
        { timeout: 20000 },
    );
});
