const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "import/order": "error",
      "import/no-named-as-default": "off",
      "@typescript-eslint/no-namespace": "off",
    },
  },
];
