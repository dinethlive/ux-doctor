import type { Rule } from "./types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
  getJsxAttribute,
  getJsxAttributeValue,
  isInteractiveElement,
} from "./helpers.js";

export const clickHasKeyEvent: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      if (!hasJsxAttribute(node, "onClick") && !hasJsxAttribute(node, "onclick")) return;

      const name = getJsxElementName(node);
      if (!name) return;

      if (isInteractiveElement(name)) return;

      const hasKeyHandler =
        hasJsxAttribute(node, "onKeyDown") ||
        hasJsxAttribute(node, "onKeyUp") ||
        hasJsxAttribute(node, "onKeyPress") ||
        hasJsxAttribute(node, "onkeydown") ||
        hasJsxAttribute(node, "onkeyup");

      if (!hasKeyHandler) {
        context.report({
          node,
          message: `<${name}> has onClick without onKeyDown/onKeyUp — keyboard users cannot activate this element`,
        });
      }
    },
  }),
};

export const noPositiveTabindex: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const tabIndexAttr =
        getJsxAttribute(node, "tabIndex") || getJsxAttribute(node, "tabindex");
      if (!tabIndexAttr) return;

      const value = getJsxAttributeValue(tabIndexAttr);
      const numValue = typeof value === "string" ? parseInt(value, 10) : typeof value === "number" ? value : NaN;

      if (!isNaN(numValue) && numValue > 0) {
        context.report({
          node,
          message: `tabIndex=${numValue} disrupts the natural tab order — use tabIndex={0} or tabIndex={-1} instead`,
        });
      }
    },
  }),
};

export const interactiveTabindex: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      if (isInteractiveElement(name)) return;

      const hasRole = hasJsxAttribute(node, "role");
      const hasClick = hasJsxAttribute(node, "onClick") || hasJsxAttribute(node, "onclick");

      if ((hasRole || hasClick) && !hasJsxAttribute(node, "tabIndex") && !hasJsxAttribute(node, "tabindex")) {
        const roleAttr = getJsxAttribute(node, "role");
        const roleValue = roleAttr ? getJsxAttributeValue(roleAttr) : null;

        const interactiveRoles = new Set([
          "button", "link", "tab", "menuitem", "menuitemcheckbox",
          "menuitemradio", "option", "switch", "checkbox", "radio",
          "textbox", "combobox", "searchbox", "slider", "spinbutton",
        ]);

        if (roleValue && typeof roleValue === "string" && interactiveRoles.has(roleValue)) {
          context.report({
            node,
            message: `<${name}> with role="${roleValue}" is missing tabIndex={0} — this interactive widget won't be keyboard accessible`,
          });
        }
      }
    },
  }),
};

export const noStaticInteraction: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      if (isInteractiveElement(name)) return;

      const hasClick = hasJsxAttribute(node, "onClick") || hasJsxAttribute(node, "onclick");
      if (!hasClick) return;

      const hasRole = hasJsxAttribute(node, "role");
      if (hasRole) return;

      context.report({
        node,
        message: `<${name}> has a click handler but no ARIA role — use a <button> or add role="button" with tabIndex={0}`,
      });
    },
  }),
};

export const focusTrapEscape: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      const roleAttr = getJsxAttribute(node, "role");
      const roleValue = roleAttr ? getJsxAttributeValue(roleAttr) : null;

      const isDialog =
        name === "dialog" || roleValue === "dialog" || roleValue === "alertdialog";

      if (!isDialog) return;

      const hasKeyDown =
        hasJsxAttribute(node, "onKeyDown") || hasJsxAttribute(node, "onkeydown");

      if (!hasKeyDown) {
        context.report({
          node,
          message: "Dialog/modal without onKeyDown handler — users need Escape key to close",
        });
      }
    },
  }),
};
