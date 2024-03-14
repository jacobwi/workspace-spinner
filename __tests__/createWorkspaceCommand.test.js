import { createWorkspace } from "../src/commands/createWorkspaceCommand";
import * as utils from "../src/utils.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

jest.mock("../src/utils.js");
jest.spyOn(process, "chdir").mockImplementation(() => {});
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
}));
jest.mock("fs/promises");
jest.mock("path", () => ({
  ...jest.requireActual("path"),
  join: jest.fn((...args) => args.join("/")),
  dirname: jest.fn((path) => path.substring(0, path.lastIndexOf("/"))),
}));

describe("createWorkspace", () => {
  beforeEach(() => {
    utils.executeCommand.mockResolvedValue();
    fsp.readFile.mockResolvedValue(JSON.stringify({}));
    fsp.writeFile.mockResolvedValue();
    fs.existsSync.mockReturnValue(false);
    fsp.mkdir.mockResolvedValue();
    path.join.mockImplementation((...args) => args.join("/"));
    path.dirname.mockImplementation((path) =>
      path.substring(0, path.lastIndexOf("/")),
    );
  });

  it("should create a workspace successfully", async () => {
    const workspacePath = "./testWorkspace";
    const packages = ["package1", "package2"];
    const apps = ["app1", "app2"];

    await createWorkspace(workspacePath, packages, apps);

    expect(utils.logSuccess).toHaveBeenCalledWith(
      "Workspace created successfully 🚀",
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
