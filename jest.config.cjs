module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.ts"
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { tsconfig: "tsconfig.json" }
    ]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
