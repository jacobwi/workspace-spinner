import {
  logMessage,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  directoryExists,
} from "../src/utils";
import chalk from "chalk";
import shell from "shelljs";
describe("Utility Log Functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("logMessage calls console.log with a green message", () => {
    const message = "This is a test message";
    logMessage(message);
    expect(global.console.log).toHaveBeenCalledWith(chalk.green(`${message}`));
  });

  test("logSuccess calls console.log with a greenBright success message", () => {
    const message = "Success message";
    logSuccess(message);
    expect(console.log).toHaveBeenCalledWith(
      chalk.greenBright(`✅ ${message}`),
    );
  });

  test("logError calls console.error with a redBright error message", () => {
    const message = "Error message";
    logError(message);
    expect(global.console.error).toHaveBeenCalledWith(
      chalk.redBright(`❌ ${message}`),
    );
  });

  test("logError calls console.error with a redBright but incorrect message", () => {
    const message = "Error message";
    logError(message);
    expect(global.console.error).not.toHaveBeenCalledWith(
      chalk.redBright(`X ${message}`),
    );
  });

  test("logWarning calls console.warn with a yellowBright warning message", () => {
    const message = "Warning message";

    logWarning(message);

    expect(global.console.warn).toHaveBeenCalledWith(
      chalk.yellowBright(`⚠️ ${message}`),
    );
  });

  test("logInfo calls console.log with a blueBright info message", () => {
    const message = "Info message";
    logInfo(message);
    expect(global.console.log).toHaveBeenCalledWith(
      chalk.blueBright(`ℹ️ ${message}`),
    );
  });
});

// Other utility functions

describe("Utility Directory Functions", () => {
  test("directoryExists returns true if the directory exists", () => {
    // Create fake environment for fs
    jest.mock("fs");
    const fs = require("fs");
    fs.existsSync = jest.fn(() => true);

    const result = directoryExists("existing-directory");
    expect(result).toBe(true);
  });

  test("directoryExists returns false if the directory does not exist", () => {
    // Create fake environment for fs, create directory then check for different directory
    jest.mock("fs");
    const fs = require("fs");

    // Mock the fs.existsSync function to return false
    fs.existsSync = jest.fn(() => false);

    const result = directoryExists("non-existing-directory");

    expect(result).toBe(false);
  });
});

// Execute command function
describe("Utility Execute Command Function", () => {
  test("executeCommand calls child_process.execSync with the correct command", () => {
    // Mock
  });
});
