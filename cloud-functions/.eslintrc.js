module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
    ".eslintrc.js",
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // Style rules
    quotes: ["error", "double"],
    indent: ["error", 2],
    "object-curly-spacing": "off",
    "quote-props": "off",

    // Firebase / TS sanity
    "require-jsdoc": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    // Imports
    "import/no-unresolved": "off",
  },
};
