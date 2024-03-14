import {
  executeCommand,
  createFile,
  logInfo,
  logSuccess,
  logError,
  logWarning,
  directoryExists,
} from "../utils.js";
import path from "path";
import fs from "fs"; // Use 'fs' for synchronous functions
import fsp from "fs/promises"; // Use 'fsp' for promise-based functions

/**
 * Creates a new workspace with the specified workspace path, packages, and apps.
 * @param {string} workspacePath - The path where the workspace will be created.
 * @param {Array} packages - An array of packages to be included in the workspace.
 * @param {Array} apps - An array of apps to be included in the workspace.
 * @returns {Promise<void>} - A promise that resolves when the workspace is created successfully.
 */
export async function createWorkspace(workspacePath, packages = [], apps = []) {
  let fullPath = workspacePath;

  if (!directoryExists(fullPath)) {
    logInfo(`Creating workspace at ${fullPath}...`);
    await fsp.mkdir(fullPath, { recursive: true });
  } else {
    logWarning(`Workspace already exists at ${fullPath}.`);
  }

  process.chdir(fullPath);
  await executeCommand("yarn init -y", "Creating package.json...");
  // Define workspace packages and apps in package.json
  await updateWorkspacePackageJson(fullPath, packages, apps);

  await createEditorConfig();
  await setupESLintAndPrettier();
  await setupHusky(fullPath);
  await setupDocker();
  await setupGit();
  await setupCICD();

  logSuccess("Workspace created successfully 🚀");
}

async function readPackageJson(packageJsonPath) {
  try {
    const data = await fsp.readFile(packageJsonPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    logError(`Error reading package.json: ${error}`);
    return {}; // Return an empty object as a fallback
  }
}

function updateWorkspaces(packageJson, packages = [], apps = []) {
  // Ensure 'workspaces' is an array in packageJson
  if (!Array.isArray(packageJson.workspaces)) {
    logWarning(
      "The 'workspaces' field in package.json is not an array. Initializing as an empty array.",
    );
    packageJson.workspaces = [];
  }

  // Validate inputs to be arrays
  const validPackages = Array.isArray(packages) ? packages : [];
  const validApps = Array.isArray(apps) ? apps : [];

  // Update 'workspaces' only if there are valid packages or apps
  if (validPackages.length > 0 || validApps.length > 0) {
    packageJson.workspaces = [
      ...validPackages.map((p) => `packages/${p}`),
      ...validApps.map((a) => `apps/${a}`),
    ];
  } else {
    logWarning(
      "No packages or apps provided. No updates made to 'workspaces'.",
    );
  }

  return packageJson;
}

async function writePackageJson(packageJsonPath, packageJson) {
  await fsp.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function initializeYarn(fullPath) {
  // Create empty yarn.lock file if it doesn't exist
  await fsp.writeFile(path.join(fullPath, "yarn.lock"), "");
  // Install dependencies
  await executeCommand("yarn install", "Executing yarn install...");
}

async function updateWorkspacePackageJson(fullPath, packages = [], apps = []) {
  const packageJsonPath = path.join(fullPath, "package.json");

  let packageJson = await readPackageJson(packageJsonPath);
  packageJson = await updateWorkspaces(packageJson, packages, apps);

  await writePackageJson(packageJsonPath, packageJson);

  process.chdir(fullPath);

  await initializeYarn(fullPath);

  logSuccess("Updated workspace package.json successfully.");
}

/**
 * Creates an editor configuration file (.editorconfig) with the specified content.
 */
export function createEditorConfig() {
  const configContent = `
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
    `;
  createFile(".editorconfig", configContent.trim());
}

/**
 * Sets up ESLint and Prettier for the workspace.
 * @returns {Promise<void>} A promise that resolves when the setup is complete.
 */
async function setupESLintAndPrettier() {
  await executeCommand(
    "yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier",
    "Setting up ESLint and Prettier...",
  );

  const eslintConfig = {
    extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "error",
    },
    env: {
      browser: true,
      es6: true,
      node: true,
    },
  };

  await fsp.writeFile(".eslintrc.json", JSON.stringify(eslintConfig, null, 2));
  await fsp.writeFile(
    ".prettierrc",
    JSON.stringify({ semi: true, singleQuote: true }, null, 2),
  );
}

/**
 * Sets up Husky for the workspace.
 *
 * @param {string} fullPath - The full path of the workspace.
 * @returns {Promise<void>} - A promise that resolves when Husky setup is complete.
 */
async function setupHusky(fullPath) {
  logInfo("Setting up Husky 🐶");
  process.chdir(fullPath);

  await executeCommand("yarn add -D husky", "Installing Husky...");
  await executeCommand("npx husky install", "Initializing Husky...");

  const huskyPreCommitPath = path.join(fullPath, ".husky", "pre-commit");

  // Create the pre-commit hook
  if (!fs.existsSync(huskyPreCommitPath)) {
    await fsp.mkdir(path.dirname(huskyPreCommitPath), { recursive: true });
  }

  const huskyPreCommitContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

yarn lint && yarn test`;

  await fsp.writeFile(huskyPreCommitPath, huskyPreCommitContent);

  if (process.platform !== "win32") {
    await executeCommand(
      `chmod +x ${huskyPreCommitPath}`,
      "Setting pre-commit hook executable...",
    );
  } else {
    logWarning("Skipped setting pre-commit hook executable on Windows.");
  }
}

/**
 * Sets up Docker for the workspace.
 * @returns {Promise<void>} A promise that resolves when Docker setup is complete.
 */
async function setupDocker() {
  logInfo("Setting up Docker 🐳");

  const dockerfileContent = `
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
  `.trim();

  const dockerComposeContent = `
version: '3'
services:
  web:
    build: .
    ports:
    - "3000:3000"
    volumes:
    - .:/usr/src/app
    - /usr/src/app/node_modules
  `.trim();

  await fsp.writeFile("Dockerfile", dockerfileContent);
  await fsp.writeFile("docker-compose.yml", dockerComposeContent);
}

/**
 * Sets up Git for the workspace.
 * @returns {Promise<void>} A promise that resolves when Git setup is complete.
 */
async function setupGit() {
  logInfo("Setting up Git 🐙");

  await executeCommand("git init", "Initializing Git repository...");

  logSuccess("Git repository initialized successfully.");
}

/**
 * Sets up Continuous Integration and Continuous Deployment (CICD) for the project.
 * This function creates a Node.js CI workflow file in the .github/workflows directory,
 * which runs the specified steps on push and pull request events for the 'main' branch.
 * The workflow uses the latest version of Ubuntu and Node.js 14.
 * It checks out the repository, sets up Node.js, installs dependencies, builds the project,
 * and runs tests.
 *
 * @returns {Promise<void>} A promise that resolves when the CICD setup is complete.
 */
async function setupCICD() {
  const ciConfigContent = `
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: '14'
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
  `.trim();

  // Check if the .github directory exists
  if (!fs.existsSync(".github")) {
    await fsp.mkdir(".github");
  }

  // Change directory to .github
  process.chdir(".github");

  // Create the workflows directory
  if (!fs.existsSync("workflows")) {
    await fsp.mkdir("workflows");
  }

  // Change directory to workflows
  process.chdir("workflows");

  await fsp.writeFile("node.js.yml", ciConfigContent);
}
