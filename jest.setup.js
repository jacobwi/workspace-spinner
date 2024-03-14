// Mock console.log and console.error
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// // Mock all log methods from utils
// jest.mock('./src/utils.js', () => ({
//   logMessage: jest.fn(),
//   logSuccess: jest.fn(),
//   logError: jest.fn(),
//   logWarning: jest.fn(),
//   logWarning2: jest.fn(),
//   logInfo: jest.fn(),
// }));

// Mock shelljs globally
jest.mock("shelljs", () => ({
  exec: jest.fn().mockReturnValue({ code: 0, stdout: "", stderr: "" }),
  which: jest.fn(),
  exit: jest.fn(),
}));

// Mock inquirer globally
jest.mock("inquirer", () => ({
  prompt: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ projectName: "TestProject" })),
}));
// Mock chalk globally
jest.mock("chalk", () => ({
  redBright: jest.fn((text) => `[redBright] ${text}`),
  blueBright: jest.fn((text) => `[blueBright] ${text}`),
  green: jest.fn((text) => `[green] ${text}`),
  greenBright: jest.fn((text) => `[greenBright] ${text}`),
  yellowBright: jest.fn((text) => `[yellowBright] ${text}`),
}));
jest.mock("fs", () => ({
  ...jest.requireActual("fs"), // Use actual for all non-overridden methods
  writeFileSync: jest.fn(), // Mock writeFileSync method
  existsSync: jest.fn(), // Mock existsSync method
  mkdirSync: jest.fn(), // Mock mkdirSync method
  readFileSync: jest.fn(), // Mock readFileSync method
}));

jest.mock("./src/commands/addProjectCommand.js", () => ({
  createPackage: jest.fn(),
  linkPackageToApp: jest.fn(),
}));
