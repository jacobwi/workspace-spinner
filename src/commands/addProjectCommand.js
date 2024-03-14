import {
  executeCommand,
  logSuccess,
  logInfo,
  logError,
  createFile,
} from "../utils.js";
import path from "path";
import fs, { mkdirSync } from "fs";

/**
 * Creates a new app with the specified name and sets it up using Vite and React.
 * @param {string} appName - The name of the app to create.
 * @param {string} workspacePath - The path to the workspace where the app will be created.
 * @returns {Promise<void>} - A promise that resolves when the app is created and set up.
 */
export const createApp = async (appName, workspacePath) => {
  const appsPath = path.join(workspacePath, "apps");

  // Ensure the apps directory exists
  mkdirSync(appsPath, { recursive: true });
  logInfo(`Creating apps directory at ${appsPath}`);

  // Set up the app using Vite and React
  try {
    logInfo(`Setting up ${appName} with Vite and React...`);
    process.chdir(appsPath); // Change directory to the app's path
    const command = `yarn create vite ${appName} --template react-ts`;

    await executeCommand(
      command,
      `Setting up ${appName} with Vite and React...`,
    );
    logSuccess(
      `Successfully executed: Setting up ${appName} with Vite and React...`,
    );
  } catch (error) {
    logError(`An error occurred: ${error.message}`);
  } finally {
    process.chdir(workspacePath); // Always return to the workspace path
  }
};
/**
 * Creates a package with the given name in the specified workspace path.
 * @param {string} packageName - The name of the package to create.
 * @param {string} workspacePath - The path of the workspace where the package will be created.
 */
export async function createPackage(packageName, workspacePath) {
  const packagePath = path.join(workspacePath, "packages", packageName);
  mkdirSync(packagePath, { recursive: true });
  logInfo(`📦 Initializing package: ${packageName}...`);

  try {
    process.chdir(packagePath);
    await executeCommand(
      `yarn init -y`,
      `Initializing package: ${packageName}...`,
      packagePath,
    );
    logSuccess(`🎉 Package initialized successfully: ${packageName}`);
  } catch (error) {
    logError(
      `Failed to execute: Creating package directory: ${packageName}... with exit code ${error.code}\nError executing command: ${error.command}\nError Output: ${error.stderr}`,
    );
  }
}
/**
 * Sets up Vitest by installing the necessary dependencies and creating a Vitest configuration file.
 */
export async function setupVitest() {
  await executeCommand("yarn add -D vitest", "Installing Vitest...");

  // Vitest configuration
  const vitestConfig = `// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});`;
  createFile("vitest.config.js", vitestConfig);
}
export async function setupTailwind() {
  await executeCommand(
    "yarn add -D tailwindcss postcss autoprefixer",
    "Installing TailwindCSS and dependencies...",
  );
  await executeCommand("npx tailwindcss init", "Initializing TailwindCSS...");
}
/**
 * Links a package to an app by updating the app's package.json file.
 *
 * @param {string} packageName - The name of the package to be linked.
 * @param {string} appName - The name of the app to link the package to.
 * @param {string} workspacePath - The path to the workspace.
 */
export function linkPackageToApp(packageName, appName, workspacePath) {
  const appPackageJsonPath = path.join(
    workspacePath,
    "apps",
    appName,
    "package.json",
  );

  try {
    if (fs.existsSync(appPackageJsonPath)) {
      const appPackageJson = JSON.parse(
        fs.readFileSync(appPackageJsonPath, "utf8"),
      );
      appPackageJson.dependencies = appPackageJson.dependencies || {};
      appPackageJson.dependencies[packageName] =
        `file:../../packages/${packageName}`;
      fs.writeFileSync(
        appPackageJsonPath,
        JSON.stringify(appPackageJson, null, 2),
      );
      logSuccess(`Linked "${packageName}" to "${appName}" successfully.`);
    } else {
      throw new Error(
        `App's package.json was not found at ${appPackageJsonPath}`,
      );
    }
  } catch (error) {
    logError(
      `Failed to link "${packageName}" to "${appName}": ${error.message}`,
    );
  }
}
/**
 * Installs the selected dependencies and creates configuration files if necessary.
 * @param {string[]} selections - An array of dependency names to install.
 * @param {string} fullPath - The full path of the project directory.
 * @returns {Promise<void>} - A promise that resolves when all dependencies are installed.
 */
export async function installSelections(selections, fullPath) {
  const dependencies = {
    vitest: {
      dev: true,
      command: "yarn add -D vitest",
      configFile: "vitest.config.js",
      configContent: "export default { /* Vitest config */ };",
    },
    tailwindcss: {
      dev: true,
      command: "yarn add -D tailwindcss postcss autoprefixer",
      configFile: "tailwind.config.js",
      configContent: "// TailwindCSS config",
    },
    axios: { dev: false, command: "yarn add axios" },
  };

  for (const selection of selections) {
    const { dev, command, configFile, configContent } = dependencies[selection];
    try {
      logInfo(`Installing ${selection}...`);
      const result = await executeCommand(
        command,
        `Installing ${selection}...`,
      );
      if (result.code !== 0) throw new Error(result.stderr);

      if (configFile) {
        const configFilePath = resolve(fullPath, configFile);
        createFile(configFilePath, configContent);
        logSuccess(`Created ${configFile}`);
      }
    } catch (error) {
      logError(
        `Failed to execute: Installing ${selection}...\nError executing command: ${command}\nError Code: ${error.code}\nError Output: ${error.output}`,
      );
    }
  }
}
