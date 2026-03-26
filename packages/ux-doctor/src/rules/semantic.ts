import type { Rule } from "./types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
  isHeadingElement,
} from "./helpers.js";
import { DIV_NESTING_DEPTH_THRESHOLD } from "../constants.js";

export const noDivSoup: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "div") return;

      let depth = 0;
      let parent = (node as Record<string, unknown>).parent as Record<string, unknown> | undefined;
      while (parent) {
        if (
          parent.type === "JSXElement" &&
          parent.openingElement &&
          getJsxElementName(parent.openingElement as Record<string, unknown> & { type: string }) === "div"
        ) {
          depth++;
        }
        parent = parent.parent as Record<string, unknown> | undefined;
      }

      if (depth >= DIV_NESTING_DEPTH_THRESHOLD) {
        context.report({
          node,
          message: `Deeply nested divs (${depth + 1} levels) — consider using semantic elements like <nav>, <main>, <section>, or <article>`,
        });
      }
    },
  }),
};

export const landmarkRegions: Rule = {
  create: (_context) => {
    let hasMain = false;
    let hasNav = false;

    return {
      JSXOpeningElement(node) {
        const name = getJsxElementName(node);
        if (!name) return;

        if (name === "main") hasMain = true;
        if (name === "nav") hasNav = true;

        const role = hasJsxAttribute(node, "role");
        if (role) {
          // role checking handled by aria rules
        }
      },
      "Program:exit"() {
        // only report if there are JSX elements (not a utility file)
        if (!hasMain && !hasNav) {
          // skip reporting for now - would need to check if file has any JSX
        }
      },
    };
  },
};

export const headingContent: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name || !isHeadingElement(name)) return;

      const parent = (node as Record<string, unknown>).parent as Record<string, unknown> | undefined;
      if (!parent) return;

      const children = parent.children as Array<Record<string, unknown>> | undefined;
      if (!children || children.length === 0) {
        context.report({
          node,
          message: `Empty heading element <${name}> — headings must have accessible content`,
        });
      }
    },
  }),
};

export const skipNavigation: Rule = {
  create: (_context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "a") return;

      const href = hasJsxAttribute(node, "href");
      if (!href) return;
    },
  }),
};

export const pageLanguage: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "html") return;

      if (!hasJsxAttribute(node, "lang")) {
        context.report({
          node,
          message: "<html> element missing lang attribute — required for screen readers to identify the page language",
        });
      }
    },
  }),
};
