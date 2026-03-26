import type { Rule } from "./types.js";
import {
  getJsxElementName,
  getJsxAttribute,
  getJsxAttributeValue,
  hasJsxAttribute,
} from "./helpers.js";
import {
  VALID_ARIA_ROLES,
  REQUIRED_ARIA_PROPS,
  REDUNDANT_ARIA_ROLES,
} from "../constants.js";

export const validRole: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const roleAttr = getJsxAttribute(node, "role");
      if (!roleAttr) return;

      const roleValue = getJsxAttributeValue(roleAttr);
      if (typeof roleValue !== "string") return;

      if (!VALID_ARIA_ROLES.has(roleValue)) {
        context.report({
          node,
          message: `Invalid ARIA role "${roleValue}" — use a valid WAI-ARIA role`,
        });
      }
    },
  }),
};

export const requiredProps: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const roleAttr = getJsxAttribute(node, "role");
      if (!roleAttr) return;

      const roleValue = getJsxAttributeValue(roleAttr);
      if (typeof roleValue !== "string") return;

      const required = REQUIRED_ARIA_PROPS[roleValue];
      if (!required) return;

      for (const prop of required) {
        if (!hasJsxAttribute(node, prop)) {
          context.report({
            node,
            message: `Role "${roleValue}" requires ${prop} attribute`,
          });
        }
      }
    },
  }),
};

export const noRedundant: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      const roleAttr = getJsxAttribute(node, "role");
      if (!roleAttr) return;

      const roleValue = getJsxAttributeValue(roleAttr);
      if (typeof roleValue !== "string") return;

      const implicitRole = REDUNDANT_ARIA_ROLES[name.toLowerCase()];
      if (implicitRole && implicitRole === roleValue) {
        context.report({
          node,
          message: `Redundant role="${roleValue}" on <${name}> — this element already has an implicit "${roleValue}" role`,
        });
      }
    },
  }),
};

export const noConflicting: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      if (
        hasJsxAttribute(node, "aria-hidden") &&
        hasJsxAttribute(node, "aria-label")
      ) {
        const hiddenAttr = getJsxAttribute(node, "aria-hidden");
        const hiddenValue = hiddenAttr ? getJsxAttributeValue(hiddenAttr) : null;

        if (hiddenValue === "true" || hiddenValue === true) {
          context.report({
            node,
            message: "Element has both aria-hidden=\"true\" and aria-label — these conflict (hidden elements should not have labels)",
          });
        }
      }
    },
  }),
};

export const hiddenFocusable: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const hiddenAttr = getJsxAttribute(node, "aria-hidden");
      if (!hiddenAttr) return;

      const hiddenValue = getJsxAttributeValue(hiddenAttr);
      if (hiddenValue !== "true" && hiddenValue !== true) return;

      const name = getJsxElementName(node);
      const isFocusable =
        name === "a" ||
        name === "button" ||
        name === "input" ||
        name === "select" ||
        name === "textarea" ||
        hasJsxAttribute(node, "tabIndex") ||
        hasJsxAttribute(node, "tabindex");

      if (isFocusable) {
        const tabIndexAttr = getJsxAttribute(node, "tabIndex") || getJsxAttribute(node, "tabindex");
        const tabIndexValue = tabIndexAttr ? getJsxAttributeValue(tabIndexAttr) : null;

        if (tabIndexValue === "-1" || String(tabIndexValue) === "-1") return;

        context.report({
          node,
          message: `aria-hidden="true" on focusable element <${name ?? "element"}> — this creates a confusing experience for screen reader users`,
        });
      }
    },
  }),
};
