import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  env: core.env,
  extends: [core, react, next, antiSlop],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/skills/**",
    ".claude/skills/**",
  ],
  // Progressive migration: remove rules as their problems are fixed.
  rules: {
    "func-style": "off",
    "prefer-destructuring": "off",
    "require-unicode-regexp": "off",
    "prefer-named-capture-group": "off",
    "jsdoc/check-tag-names": "off",
    "no-plusplus": "off",
    "no-use-before-define": "off",
    "react/set-state-in-effect": "off",
    "react/refs": "off",
    "no-await-in-loop": "off",
    "unicorn/prefer-number-coercion": "off",
    complexity: "off",
    "react/no-object-type-as-default-prop": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "promise/catch-or-return": "off",
    "promise/avoid-new": "off",
    "no-empty-function": "off",
    "no-inline-comments": "off",
    "promise/always-return": "off",
    "require-await": "off",
    "unicorn/consistent-function-scoping": "off",
    "no-shadow": "off",
    "react/todo": "off",
    "react/memo-dependencies": "off",
    "promise/prefer-await-to-callbacks": "off",
    "react/hook-use-state": "off",
    "unicorn/prefer-ternary": "off",

    "anti-slop/require-readable-spacing": "off",
    "anti-slop/no-runtime-typeof": "off",
    "anti-slop/require-safety-comment-for-type-assertion": "off",
    "anti-slop/no-unsafe-dictionary-type": "off",
    "anti-slop/no-known-value-widening": "off",
    "anti-slop/no-shape-in-symbol-names": "off",

    "eslint/class-methods-use-this": "off",
    "eslint/max-classes-per-file": ["error", { max: 2 }],
    "oxc/no-barrel-file": "off",
    "react/globals": "off",
    "react/no-clone-element": "off",
    "react/no-react-children": "off",
    "react/rule-suppression": "off",
  },
});
