#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import { createWorkspace } from "./commands/createWorkspaceCommand.js";
import {
  createApp,
  createPackage,
  installSelections,
  linkPackageToApp,
} from "./commands/addProjectCommand.js";
import {
  logSuccess,
  logError,
  checkPrerequisites,
  logInfo,
  validateNumber,
} from "./utils.js";

async function main() {
  try {
    await checkPrerequisites();
    const { workspaceName, pathChoice } = await promptWorkspaceDetails();
    const fullPath = await setupWorkspacePath(pathChoice, workspaceName);

    logInfo(`Workspace will be created at ${fullPath}`);

    const selections = await promptToolsAndLibraries();
    const apps = await handleApps(fullPath);
    const packages = await handlePackages(fullPath, apps);

    await createWorkspace(fullPath, packages, apps);
    await installSelections(selections, fullPath);

    logSuccess("Workspace setup complete!");
  } catch (error) {
    logError(`An error occurred: ${error.message} ${error.stack}`);
  }
}

/**
 * Prompts the user for workspace details.
 * @returns {Promise<{ workspaceName: string, pathChoice: string }>} A promise that resolves to an object containing the workspace name and path choice.
 */
async function promptWorkspaceDetails() {
  const { workspaceName } = await inquirer.prompt({
    type: "input",
    name: "workspaceName",
    message: "Enter the name of your workspace:",
    validate: (input) => {
      if (input === "") {
        return "Workspace name cannot be empty";
      }
      return true;
    },
  });
  const { pathChoice } = await inquirer.prompt({
    type: "list",
    name: "pathChoice",
    message: "Where would you like to create the workspace?",
    choices: [
      { name: "Current directory", value: "current" },
      { name: "Custom path", value: "custom" },
    ],
  });
  return { workspaceName, pathChoice };
}
/**
 * Prompts the user to select tools and libraries to install.
 * @returns {Promise<Array<string>>} The selected tools and libraries.
 */
async function promptToolsAndLibraries() {
  const { selections } = await inquirer.prompt({
    type: "checkbox",
    name: "selections",
    message: "Select tools and libraries to install:",
    choices: [
      { name: "Vitest", value: "vitest" },
      { name: "TailwindCSS", value: "tailwindcss" },
      { name: "Axios", value: "axios" },
      { name: "MobX", value: "mobx" },
      { name: "React Query", value: "react-query" },
      { name: "React Router DOM", value: "react-router-dom" },
      { name: "Chakra UI", value: "chakra-ui" },
      { name: "Jest", value: "jest" },
      { name: "Cypress", value: "cypress" },
    ],
  });
  return selections;
}
/**
 * Sets up the workspace path based on the path choice and workspace name.
 * @param {string} pathChoice - The choice of path ('custom' or any other value).
 * @param {string} workspaceName - The name of the workspace.
 * @returns {Promise<string>} The resolved workspace path.
 */
async function setupWorkspacePath(pathChoice, workspaceName) {
  if (pathChoice === "custom") {
    const customPath = await getCustomPath();
    return path.resolve(customPath, workspaceName);
  } else {
    return path.resolve(process.cwd(), workspaceName);
  }
}

/**
 * Retrieves the custom path for the workspace.
 * @returns {Promise<string>} A promise that resolves to the custom path entered by the user.
 */
async function getCustomPath() {
  const { customPath } = await inquirer.prompt({
    type: "input",
    name: "customPath",
    message: "Enter the custom path for your workspace:",
  });
  return customPath;
}

// Prompt the user for the number of apps to create
export const promptNumberOfApps = async () => {
  const { numberOfApps } = await inquirer.prompt({
    type: "input",
    name: "numberOfApps",
    message: "How many apps do you want to create?",
    default: "0",
    validate: validateNumber,
  });
  return numberOfApps;
};

/**
 * Handles the creation of multiple apps.
 *
 * @param {string} fullPath - The full path where the apps will be created.
 * @returns {Array<string>} - An array of app names that were created.
 */
export async function handleApps(fullPath) {
  try {
    const numberOfApps = await promptNumberOfApps();
    const apps = [];
    for (let i = 0; i < numberOfApps; i++) {
      const { appName } = await inquirer.prompt({
        type: "input",
        name: "appName",
        message: `Enter the name for app #${i + 1}:`,
      });
      await createApp(appName, fullPath);
      apps.push(appName);
    }
    return apps;
  } catch (error) {
    throw error;
  }
}

// Prompt the user for the number of packages to create
export const promptNumberOfPackages = async () => {
  const { numberOfPackages } = await inquirer.prompt({
    type: "input",
    name: "numberOfPackages",
    message: "How many packages do you want to create?",
    default: "0",
    validate: validateNumber,
  });
  return numberOfPackages;
};

/**
 * Handles the creation of packages based on user input.
 *
 * @param {string} fullPath - The full path of the directory where the packages will be created.
 * @param {string[]} apps - An array of app names.
 * @returns {Promise<string[]>} - A promise that resolves to an array of package names.
 */
export async function handlePackages(fullPath, apps) {
  try {
    const numberOfPackages = await promptNumberOfPackages();
    const packages = [];
    for (let i = 0; i < numberOfPackages; i++) {
      const { packageName } = await inquirer.prompt({
        type: "input",
        name: "packageName",
        message: `Enter the name for package #${i + 1}:`,
      });
      await createPackage(packageName, fullPath);
      packages.push(packageName);

      const { isShared } = await inquirer.prompt({
        type: "confirm",
        name: "isShared",
        message: `Is "${packageName}" a shared package?`,
      });
      if (isShared) {
        const { linkedApps } = await inquirer.prompt({
          type: "checkbox",
          name: "linkedApps",
          message: `Which app(s) should "${packageName}" be linked to?`,
          choices: apps.map((appName) => ({ name: appName, value: appName })),
        });
        linkedApps.forEach((appName) =>
          linkPackageToApp(packageName, appName, fullPath),
        );
      }
    }
    return packages;
  } catch (error) {
    throw error;
  }
}

main();
