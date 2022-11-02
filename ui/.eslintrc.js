module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: ["tsconfig.json", "extension/tsconfig.json"],
  },
  ignorePatterns: [
    ".git/",
    ".vscode/",
    "node_modules/",
    "*.test.tsx", // TODO
    "*.test.ts", // TODO
    "cypress/**/*",
  ],
  plugins: ["@typescript-eslint", "import", "react", "security", "material-ui"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:security/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/prefer-regexp-exec": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/restrict-template-expressions": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unsafe-argument": 0,
    "@typescript-eslint/unbound-method": 1,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "react/display-name": 1,
    "arrow-body-style": [2, "as-needed"],
    "import/first": 2,
    "import/no-duplicates": 2,
    "import/no-named-as-default": 1,
    "no-prototype-builtins": 2,
    "import/order": [2, { alphabetize: { order: "asc" } }],
    "no-case-declarations": 0,
    "no-useless-escape": 2,
    "object-shorthand": 2,
    "sort-imports": [2, { ignoreDeclarationSort: true }],
    "security/detect-object-injection": 0,
    // https://stackoverflow.com/questions/64052318/how-to-disable-warn-about-some-unused-params-but-keep-typescript-eslint-no-un
    "@typescript-eslint/no-unused-vars": [
      2,
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "import/default": 2,
    // TODO: Enable below rules
    "@typescript-eslint/no-misused-promises": 1,
    "@typescript-eslint/naming-convention": [
      1,
      // Enforce that boolean variables are prefixed with an allowed verb
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase"],
        prefix: ["is", "should", "has", "can", "did", "will", "does", "was", "were"],
      },
    ],
    "react/no-unescaped-entities": 1,
    "@typescript-eslint/no-var-requires": 1,
    "@typescript-eslint/ban-ts-comment": 2,
    "react/prop-types": 1,
    "no-prototype-builtins": 1,
    "@typescript-eslint/no-empty-function": 1,
    "@typescript-eslint/restrict-plus-operands": 1,
    "react/no-find-dom-node": 1,
    "import/no-unresolved": 1,
    // https://github.com/yannickcr/eslint-plugin-react/issues/718
    "react/no-unknown-property": 0,
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"],
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".d.ts"],
    },
    react: { version: "detect" },
  },
};
