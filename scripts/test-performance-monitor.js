#!/usr/bin/env node

/**
 * Test Performance Monitor
 * Analyzes test execution times and enforces performance thresholds
 */

import fs from "fs";
import path from "path";

const PERFORMANCE_THRESHOLDS = {
  // Maximum acceptable test suite duration (ms)
  maxSuiteDuration: 8000,
  // Maximum acceptable individual test duration (ms)
  maxTestDuration: 2000,
  // Maximum acceptable total test run duration (ms)
  maxTotalDuration: 15000,
  // Slow test threshold for warnings (ms)
  slowTestThreshold: 500,
};

const PERFORMANCE_HISTORY_FILE = "./test-performance-history.json";

function loadPerformanceHistory() {
  try {
    if (fs.existsSync(PERFORMANCE_HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(PERFORMANCE_HISTORY_FILE, "utf8"));
    }
  } catch (error) {
    console.warn("Could not load performance history:", error.message);
  }
  return { runs: [] };
}

function savePerformanceHistory(history) {
  try {
    fs.writeFileSync(
      PERFORMANCE_HISTORY_FILE,
      JSON.stringify(history, null, 2),
    );
  } catch (error) {
    console.warn("Could not save performance history:", error.message);
  }
}

function analyzeTestResults() {
  const testResultsPath = "./test-results.json";

  if (!fs.existsSync(testResultsPath)) {
    console.error(
      "❌ Test results file not found. Run tests with JSON reporter first.",
    );
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(testResultsPath, "utf8"));
  const history = loadPerformanceHistory();

  // Extract timing information
  const currentRun = {
    timestamp: new Date().toISOString(),
    totalDuration:
      results.testResults?.reduce(
        (sum, file) => sum + (file.duration || 0),
        0,
      ) || 0,
    testFiles:
      results.testResults?.map((file) => ({
        name: file.name,
        duration: file.duration,
        numTests: file.assertionResults?.length || 0,
        avgTestDuration: file.duration / (file.assertionResults?.length || 1),
      })) || [],
  };

  // Add to history
  history.runs.push(currentRun);

  // Keep only last 50 runs
  if (history.runs.length > 50) {
    history.runs = history.runs.slice(-50);
  }

  savePerformanceHistory(history);

  // Performance analysis
  let hasPerformanceIssues = false;
  const warnings = [];
  const errors = [];

  console.log("\n🔍 Test Performance Analysis");
  console.log("================================");

  // Check total duration
  if (currentRun.totalDuration > PERFORMANCE_THRESHOLDS.maxTotalDuration) {
    errors.push(
      `Total test duration (${currentRun.totalDuration}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.maxTotalDuration}ms)`,
    );
    hasPerformanceIssues = true;
  } else {
    console.log(
      `✅ Total Duration: ${currentRun.totalDuration}ms (within ${PERFORMANCE_THRESHOLDS.maxTotalDuration}ms threshold)`,
    );
  }

  // Check individual test files
  console.log("\n📁 Test File Performance:");
  currentRun.testFiles.forEach((file) => {
    const fileName = path.basename(file.name);

    if (file.duration > PERFORMANCE_THRESHOLDS.maxSuiteDuration) {
      errors.push(
        `${fileName}: ${file.duration}ms exceeds suite threshold (${PERFORMANCE_THRESHOLDS.maxSuiteDuration}ms)`,
      );
      hasPerformanceIssues = true;
    } else if (file.duration > PERFORMANCE_THRESHOLDS.slowTestThreshold) {
      warnings.push(
        `${fileName}: ${file.duration}ms is slow (>${PERFORMANCE_THRESHOLDS.slowTestThreshold}ms)`,
      );
      console.log(
        `⚠️  ${fileName}: ${file.duration}ms (${file.numTests} tests)`,
      );
    } else {
      console.log(
        `✅ ${fileName}: ${file.duration}ms (${file.numTests} tests)`,
      );
    }
  });

  // Performance trends
  if (history.runs.length >= 3) {
    const recent = history.runs.slice(-3);
    const avgDuration =
      recent.reduce((sum, run) => sum + run.totalDuration, 0) / recent.length;
    const trend = currentRun.totalDuration - avgDuration;

    console.log(
      `\n📈 Performance Trend: ${trend > 0 ? "+" : ""}${Math.round(
        trend,
      )}ms vs recent average`,
    );

    if (trend > 1000) {
      warnings.push(
        `Performance regression detected: +${Math.round(
          trend,
        )}ms slower than recent average`,
      );
    } else if (trend < -500) {
      console.log(
        `🚀 Performance improvement: ${Math.round(
          Math.abs(trend),
        )}ms faster than recent average`,
      );
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log(
    `Total Tests: ${currentRun.testFiles.reduce(
      (sum, file) => sum + file.numTests,
      0,
    )}`,
  );
  console.log(`Test Files: ${currentRun.testFiles.length}`);
  console.log(`Total Duration: ${currentRun.totalDuration}ms`);
  console.log(
    `Average per Test: ${Math.round(
      currentRun.totalDuration /
        currentRun.testFiles.reduce((sum, file) => sum + file.numTests, 0),
    )}ms`,
  );

  // Report warnings and errors
  if (warnings.length > 0) {
    console.log("\n⚠️  Performance Warnings:");
    warnings.forEach((warning) => console.log(`   • ${warning}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ Performance Errors:");
    errors.forEach((error) => console.log(`   • ${error}`));
  }

  if (!hasPerformanceIssues && warnings.length === 0) {
    console.log("\n🎉 All performance thresholds met!");
  }

  // Exit with error code if performance issues found
  if (hasPerformanceIssues) {
    console.log(
      "\n💥 Performance thresholds exceeded. Consider optimizing slow tests.",
    );
    process.exit(1);
  }

  return currentRun;
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeTestResults();
}

export { analyzeTestResults, PERFORMANCE_THRESHOLDS };
