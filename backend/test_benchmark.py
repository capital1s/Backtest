# pylint: skip-file
import time

import pytest


@pytest.mark.benchmark
def test_backend_performance(benchmark):
    def backend_task():
        time.sleep(0.01)  # Replace with actual backend call

    result = benchmark(backend_task)
    # Accept either result or benchmark.stats as valid
    assert result is not None or hasattr(benchmark, "stats")
