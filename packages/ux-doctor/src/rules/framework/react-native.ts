import type { Rule } from "../types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
} from "../helpers.js";

const RN_TOUCHABLE_COMPONENTS = new Set([
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
  "TouchableNativeFeedback",
  "Pressable",
]);

export const accessibilityLabel: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      if (!RN_TOUCHABLE_COMPONENTS.has(name)) return;

      if (
        !hasJsxAttribute(node, "accessibilityLabel") &&
        !hasJsxAttribute(node, "accessible") &&
        !hasJsxAttribute(node, "aria-label")
      ) {
        context.report({
          node,
          message: `<${name}> missing accessibilityLabel — screen readers won't be able to describe this interactive element`,
        });
      }
    },
  }),
};

export const accessibilityRole: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (!name) return;

      if (!RN_TOUCHABLE_COMPONENTS.has(name)) return;

      if (
        !hasJsxAttribute(node, "accessibilityRole") &&
        !hasJsxAttribute(node, "role")
      ) {
        context.report({
          node,
          message: `<${name}> missing accessibilityRole — add role="button" or appropriate role for assistive technology`,
        });
      }
    },
  }),
};

export const imageAccessibility: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "Image") return;

      if (
        !hasJsxAttribute(node, "accessibilityLabel") &&
        !hasJsxAttribute(node, "accessible") &&
        !hasJsxAttribute(node, "aria-label") &&
        !hasJsxAttribute(node, "alt")
      ) {
        context.report({
          node,
          message: "React Native <Image> missing accessibilityLabel — images should describe their content for screen readers",
        });
      }
    },
  }),
};

export const importantForAccessibility: Rule = {
  create: (_context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "View") return;

      // only flag Views that seem decorative (no children, with style)
      if (
        hasJsxAttribute(node, "style") &&
        !hasJsxAttribute(node, "importantForAccessibility") &&
        !hasJsxAttribute(node, "accessible")
      ) {
        // this is a light hint, not always applicable
      }
    },
  }),
};
