import type { Rule } from "../types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
} from "../helpers.js";

export const dialogAccessibility: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      const dialogNames = new Set([
        "Dialog",
        "Modal",
        "AlertDialog",
        "Drawer",
        "Sheet",
        "DialogContent",
        "ModalContent",
      ]);

      if (!dialogNames.has(name)) return;

      if (
        !hasJsxAttribute(node, "aria-label") &&
        !hasJsxAttribute(node, "aria-labelledby") &&
        !hasJsxAttribute(node, "title")
      ) {
        context.report({
          node,
          message: `<${name}> missing accessible name — add aria-label or aria-labelledby for screen readers`,
        });
      }
    },
  }),
};

export const iconButtonLabel: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      const iconButtonNames = new Set([
        "IconButton",
        "ActionIcon",
        "CloseButton",
      ]);

      if (!iconButtonNames.has(name)) return;

      if (
        !hasJsxAttribute(node, "aria-label") &&
        !hasJsxAttribute(node, "title") &&
        !hasJsxAttribute(node, "label")
      ) {
        context.report({
          node,
          message: `<${name}> missing accessible label — icon-only buttons must have aria-label or title`,
        });
      }
    },
  }),
};

export const tooltipTrigger: Rule = {
  create: (_context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "Tooltip" && name !== "TooltipTrigger") return;

      // tooltips should be keyboard accessible
      // this is a general reminder
    },
  }),
};
