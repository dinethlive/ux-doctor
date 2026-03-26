import type { Rule } from "./types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
} from "./helpers.js";

export const prefersReducedMotionJsx: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "marquee") return;

      context.report({
        node,
        message: "<marquee> is deprecated and inaccessible — use CSS animations with prefers-reduced-motion support instead",
      });
    },
  }),
};

export const noAutoplayAnimation: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "video" && name !== "audio") return;

      if (hasJsxAttribute(node, "autoPlay") || hasJsxAttribute(node, "autoplay")) {
        if (hasJsxAttribute(node, "loop")) {
          context.report({
            node,
            message: `<${name}> autoplays with loop — provide a visible pause/stop control`,
          });
        }
      }
    },
  }),
};
