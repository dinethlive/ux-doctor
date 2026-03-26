import type { Rule } from "./types.js";
import {
  getJsxAttribute,
  getJsxAttributeValue,
} from "./helpers.js";

export const duplicateIds: Rule = {
  create: (context) => {
    const seenIds = new Map<string, boolean>();

    return {
      JSXOpeningElement(node) {
        const idAttr = getJsxAttribute(node, "id");
        if (!idAttr) return;

        const idValue = getJsxAttributeValue(idAttr);
        if (typeof idValue !== "string" || !idValue) return;

        if (seenIds.has(idValue)) {
          context.report({
            node,
            message: `Duplicate id="${idValue}" — IDs must be unique within a page for ARIA references and fragment navigation to work`,
          });
        } else {
          seenIds.set(idValue, true);
        }
      },
    };
  },
};
