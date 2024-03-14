import {
  logMessage,
  logSuccess,
  logError,
  logWarning,
  logWarning2,
  logInfo,
} from "../src/utils";
import chalk from "chalk";
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
