#!/usr/bin/env node
const { spawn } = require("child_process");

const start = Date.now();

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const proc = spawn("npm", ["run", "start"], { cwd: "frontend", shell: true });
const timeout = setTimeout(() => {
  console.error(
    '\n[Startup Timer] Timeout: "Compiled successfully" not detected within 5 minutes.',
  );
  proc.kill();
  process.exit(1);
}, TIMEOUT_MS);

proc.stdout.on("data", (data) => {
  process.stdout.write(data);
  if (data.toString().includes("Compiled successfully")) {
    clearTimeout(timeout);
    const end = Date.now();
    const seconds = ((end - start) / 1000).toFixed(2);
    console.log(
      `\n[Startup Time] Compiled successfully in ${seconds} seconds.`,
    );
    proc.kill();
  }
});

proc.stderr.on("data", (data) => {
  process.stderr.write(data);
});

proc.on("close", (code) => {
  if (code !== 0) {
    console.log(`Process exited with code ${code}`);
  }
});
