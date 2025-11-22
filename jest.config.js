export default {
  preset: "ts-jest/presets/default-esm", // ESM support
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};
