import { execSync } from "node:child_process";

const checks = [
  {
    name: "Node.js",
    command: "node --version",
    hint: "brew install node"
  },
  {
    name: "npm",
    command: "npm --version",
    hint: "brew install node"
  },
  {
    name: "Docker",
    command: "docker --version",
    hint: "brew install --cask docker"
  }
];

let failed = false;

for (const check of checks) {
  try {
    const output = execSync(check.command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    console.log(`OK ${check.name}: ${output}`);
  } catch {
    failed = true;
    console.log(`MISSING ${check.name}: ${check.hint}`);
  }
}

if (failed) {
  process.exitCode = 1;
}
