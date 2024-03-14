import inquirer from "inquirer";
import { promptNumberOfApps, promptNumberOfPackages } from "../src/main";

jest.mock("inquirer");

describe("prompts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should prompt the user for the number of apps to create", async () => {
    const promptNumberOfAppsSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfApps: "2" });

    await promptNumberOfApps();

    expect(promptNumberOfAppsSpy).toHaveBeenCalledTimes(1);
  });

  //

  test("should call validatefunction to validate the apps input in prompt", async () => {
    const promptNumberOfAppsSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfApps: "2" });

    await promptNumberOfApps();

    expect(promptNumberOfAppsSpy).toHaveBeenCalledTimes(1);
  });
  test("validate apps input", async () => {
    const promptNumberOfAppsSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfApps: "abc" });

    await promptNumberOfApps();

    // Get user input from prompt
    const promptArgs = inquirer.prompt.mock.calls[0][0];
    const validateFunction = promptArgs.validate;
    const result = await validateFunction("abc");

    expect(result).not.toBe("Please enter a valid number.");
  });

  test("should prompt the user for the number of packages to create", async () => {
    const promptNumberOfPackagesSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfPackages: "3" });

    await promptNumberOfPackages();

    expect(promptNumberOfPackagesSpy).toHaveBeenCalledTimes(1);
  });

  test("should call validatefunction to validate the packages input in prompt", async () => {
    const promptNumberOfPackagesSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfPackages: "3" });

    await promptNumberOfPackages();

    expect(promptNumberOfPackagesSpy).toHaveBeenCalledTimes(1);
  });

  test("validate packages input", async () => {
    const promptNumberOfPackagesSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ numberOfPackages: "abc" });

    await promptNumberOfPackages();

    // Get user input from prompt
    const promptArgs = inquirer.prompt.mock.calls[0][0];
    const validateFunction = promptArgs.validate;
    const result = await validateFunction("abc");

    expect(result).not.toBe("Please not enter a valid number.");
  });
});
