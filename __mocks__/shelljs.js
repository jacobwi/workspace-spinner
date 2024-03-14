const shelljs = jest.genMockFromModule("shelljs");
shelljs.exec = jest.fn(() => ({ stdout: "mock stdout", code: 0 }));
shelljs.exit = jest.fn();
export default shelljs;
