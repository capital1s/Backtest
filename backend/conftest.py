# pylint: skip-file
"""Pytest configuration for macOS/Python 3.13+.
Avoid pytest-forked and use pytest-xdist for parallel test isolation.
Set multiprocessing start method to 'spawn' for safety."""

import multiprocessing
import platform
import sys


def pytest_configure():
    """Configure pytest multiprocessing start method for macOS/Python 3.13+."""
    if platform.system() == "Darwin" and sys.version_info >= (3, 13):
        try:
            multiprocessing.set_start_method("spawn", force=True)
        except RuntimeError:
            pass  # Already set


def pytest_sessionstart(session):
    """Warn if pytest-forked is used on macOS/Python 3.13+."""
    if platform.system() == "Darwin" and sys.version_info >= (3, 13):
        plugins = session.config.pluginmanager.get_plugins()
        if any(p.__class__.__name__ == "ForkedPlugin" for p in plugins):
            print(
                "WARNING: pytest-forked is unsafe on macOS/Python 3.13+. Use pytest-xdist instead."
            )
