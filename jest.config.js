// jest.config.js
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!ora)"],
  moduleNameMapper: {
    "^ora$": "<rootDir>/__mocks__/oraMock.js",
    "#(.*)": "<rootDir>/node_modules/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
