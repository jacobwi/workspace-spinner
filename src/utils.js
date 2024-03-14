import shell from "shelljs";
import ora from "ora";
import fs from "fs";
import path from "path";
import chalk from "chalk";
/**
 * Executes a command using shell.exec and returns a promise that resolves with the command's output.
 * @param {string} command - The command to execute.
 * @param {string} [message="Processing..."] - The message to display while the command is being executed.
 * @returns {Promise<{stdout: string, stderr: string}>} - A promise that resolves with the command's output (stdout and stderr).
 */
export async function executeCommand(command, message = "Processing...") {
  const spinner = ora(message).start();

  try {
    const result = await new Promise((resolve, reject) => {
      shell.exec(
        command,
        { silent: true, async: true },
        (code, stdout, stderr) => {
          const fullOutput = `Stdout:\n${stdout}\nStderr:\n${stderr}`;

          if (code === 0) {
            spinner.succeed(`Successfully executed: ${message}\n${stdout}`);
            resolve({ stdout, stderr });
          } else {
            spinner.fail(
              `Failed to execute: ${message} with exit code ${code}`,
            );
            console.error(
              `Error executing command: "${command}"\nError Code: ${code}\n${fullOutput}`,
            );
            reject(
              new Error(
                `Command "${command}" failed with exit code ${code}\n${fullOutput}`,
              ),
            );
          }
        },
      );
    });
    return result;
  } catch (error) {
    throw error; // This ensures that errors are propagated correctly
  }
}

export function logMessage(message) {
  console.log(chalk.green(message)); // Use green for general messages
}

export function logSuccess(message) {
  console.log(chalk.greenBright(`✅ ${message}`)); // Green with a checkmark for success messages
}

export function logError(message) {
  console.error(chalk.redBright(`❌ ${message}`)); // Red with a cross for error messages
}

export function logWarning(message) {
  console.warn(chalk.yellowBright(`⚠️ ${message}`)); // Yellow with a warning emoji for warning messages
}

export function logInfo(message) {
  console.log(chalk.blueBright(`ℹ️ ${message}`)); // Blue with an info emoji for info messages
}

/**
 * Creates a file with the specified file path and content.
 * @param {string} filePath - The path of the file to be created.
 * @param {string} content - The content to be written to the file.
 */
export function createFile(filePath, content) {
  const spinner = ora(`Creating ${filePath}...`).start();
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the content to the file
    fs.writeFileSync(filePath, content, { mode: 0o755 }); // Set executable permissions
    spinner.succeed(`Created ${filePath}`);
  } catch (error) {
    spinner.fail(`Failed to create ${filePath}`);
    console.error(error);
  }
}

/**
 * Checks the prerequisites for the script.
 * @returns {void}
 */
export function checkPrerequisites() {
  // Check Node.js
  if (!shell.which("node")) {
    logError("Node.js is not installed. Please install Node.js to continue.");
    logInfo("Visit https://nodejs.org/ for installation instructions.");
    shell.exit(1);
  }

  // Check Yarn
  if (!shell.which("yarn")) {
    logInfo("Yarn is not installed. Attempting to install Yarn...");
    const result = shell.exec("npm install --global yarn", { silent: false });

    if (result.code !== 0) {
      logError("Failed to install Yarn via npm. Please install Yarn manually.");
      logInfo(
        "Visit https://yarnpkg.com/getting-started/install for installation instructions.",
      );
      shell.exit(1);
    }

    logMessage("Yarn has been successfully installed.");
  }

  // Check Yarn version for Berry or higher
  const yarnVersion = shell
    .exec("yarn --version", { silent: true })
    .stdout.trim();
  const majorVersion = parseInt(yarnVersion.split(".")[0], 10);

  if (majorVersion < 2) {
    logInfo("Updating Yarn to use Berry...");
    const berryUpdateResult = shell.exec("yarn set version berry", {
      silent: true,
    });

    if (berryUpdateResult.code !== 0) {
      logError(
        'Failed to update Yarn to Berry via the command "yarn set version berry".',
      );
      shell.exit(1);
    }

    const updatedYarnVersion = shell
      .exec("yarn --version", { silent: true })
      .stdout.trim();
    const updatedMajorVersion = parseInt(updatedYarnVersion.split(".")[0], 10);

    if (updatedMajorVersion >= 2) {
      logMessage(
        "Yarn has been successfully updated to Berry. Continuing with the script...",
      );
    } else {
      logError(
        "Failed to update Yarn to Berry. Please update Yarn manually and rerun the script.",
      );
      shell.exit(1);
    }
  } else {
    logMessage("Yarn is already using Berry or higher.");
  }
}
