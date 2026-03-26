import type { Rule } from "./types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
  getJsxAttribute,
  getJsxAttributeValue,
} from "./helpers.js";

export const decorativeAlt: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "img") return;

      const altAttr = getJsxAttribute(node, "alt");
      if (!altAttr) return;

      const altValue = getJsxAttributeValue(altAttr);
      if (altValue !== "") return;

      if (!hasJsxAttribute(node, "role")) {
        context.report({
          node,
          message: "Decorative image with alt=\"\" should also have role=\"presentation\" or role=\"none\"",
        });
      }
    },
  }),
};

export const svgAccessible: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "svg") return;

      const hasLabel =
        hasJsxAttribute(node, "aria-label") ||
        hasJsxAttribute(node, "aria-labelledby") ||
        hasJsxAttribute(node, "role");

      if (!hasLabel) {
        context.report({
          node,
          message: "<svg> missing accessible name — add aria-label, aria-labelledby, or a <title> child element",
        });
      }
    },
  }),
};

export const videoCaptions: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "video") return;

      // HACK: can't check children easily through oxlint visitor, report as warning
      context.report({
        node,
        message: "Verify <video> has <track kind=\"captions\"> for hearing-impaired users",
      });
    },
  }),
};

export const noAutoplay: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "video" && name !== "audio") return;

      if (!hasJsxAttribute(node, "autoPlay") && !hasJsxAttribute(node, "autoplay")) return;

      if (!hasJsxAttribute(node, "muted")) {
        context.report({
          node,
          message: `<${name}> has autoplay without muted — this can be disruptive for users`,
        });
      }
    },
  }),
};
