#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rootDir = resolve(new URL("..", import.meta.url).pathname);

const runCommand = async (command, options = {}) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, {
      stdio: "inherit",
      shell: true,
      cwd: rootDir,
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Command failed: ${command}`));
      }
    });
  });

const runWeb = async () => {
  await runCommand("npm run dev");
};

const buildApk = async () => {
  await runCommand("npm run android:sync");
  await runCommand("cd android && ./gradlew assembleDebug");
  await runCommand("cp android/app/build/outputs/apk/debug/app-debug.apk ./expense-compass.apk");
};

const runAndroid = async () => {
  await buildApk();
  await runCommand(
    "npx native-run android --app android/app/build/outputs/apk/debug/app-debug.apk"
  );
};

const main = async () => {
  const rl = createInterface({ input, output });
  console.log("\nSelect an action:\n");
  console.log("1) Run website (dev server)");
  console.log("2) Run mobile app (Android)");
  console.log("3) Generate APK (debug)");
  console.log("4) Exit\n");

  const answer = await rl.question("Enter choice (1-4): ");
  rl.close();

  const choice = answer.trim();
  try {
    if (choice === "1") {
      await runWeb();
      return;
    }
    if (choice === "2") {
      await runAndroid();
      return;
    }
    if (choice === "3") {
      await buildApk();
      console.log("\nAPK generated at expense-compass.apk\n");
      return;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  console.log("No action selected. Exiting.");
};

void main();
