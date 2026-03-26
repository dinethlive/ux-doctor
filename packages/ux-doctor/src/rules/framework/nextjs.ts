import type { Rule } from "../types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
} from "../helpers.js";

export const nextImageAlt: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "Image") return;

      // check if it's from next/image (heuristic: capitalized Image component)
      if (!hasJsxAttribute(node, "alt")) {
        context.report({
          node,
          message: "Next.js <Image> component missing alt attribute",
        });
      }
    },
  }),
};

export const nextLinkAccessibility: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "Link") return;

      // Next.js Link wraps an <a> tag internally, but check for content
      const parent = (node as Record<string, unknown>).parent as Record<string, unknown> | undefined;
      const children = parent?.children as Array<Record<string, unknown>> | undefined;

      if (!children || children.length === 0) {
        if (!hasJsxAttribute(node, "aria-label")) {
          context.report({
            node,
            message: "Next.js <Link> without visible content or aria-label — link has no accessible name",
          });
        }
      }
    },
  }),
};

export const nextHeadMetadata: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "Head") return;

      // check for title inside Head
      const parent = (node as Record<string, unknown>).parent as Record<string, unknown> | undefined;
      const children = parent?.children as Array<Record<string, unknown>> | undefined;

      let hasTitle = false;
      if (children) {
        for (const child of children) {
          if (child.type === "JSXElement") {
            const opening = child.openingElement as Record<string, unknown> & { type: string } | undefined;
            if (opening && getJsxElementName(opening) === "title") {
              hasTitle = true;
            }
          }
        }
      }

      if (!hasTitle) {
        context.report({
          node,
          message: "Next.js <Head> missing <title> element — pages must have a document title for accessibility",
        });
      }
    },
  }),
};
