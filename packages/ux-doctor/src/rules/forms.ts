import type { Rule } from "./types.js";
import {
  getJsxElementName,
  hasJsxAttribute,
  getJsxAttribute,
  getJsxAttributeValue,
} from "./helpers.js";

export const labelAssociation: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "input" && name !== "select" && name !== "textarea") return;

      const typeAttr = getJsxAttribute(node, "type");
      const typeValue = typeAttr ? getJsxAttributeValue(typeAttr) : null;
      if (typeValue === "hidden" || typeValue === "submit" || typeValue === "button" || typeValue === "reset") return;

      const hasLabel =
        hasJsxAttribute(node, "aria-label") ||
        hasJsxAttribute(node, "aria-labelledby") ||
        hasJsxAttribute(node, "id"); // could be referenced by <label htmlFor>

      if (!hasLabel) {
        context.report({
          node,
          message: `<${name}> without associated label — add aria-label, aria-labelledby, or wrap in a <label>`,
        });
      }
    },
  }),
};

export const autocomplete: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "input") return;

      const typeAttr = getJsxAttribute(node, "type");
      const typeValue = typeAttr ? getJsxAttributeValue(typeAttr) : "text";

      const personalDataTypes = new Set([
        "text", "email", "tel", "url", "password",
      ]);

      if (
        typeof typeValue === "string" &&
        personalDataTypes.has(typeValue) &&
        !hasJsxAttribute(node, "autoComplete") &&
        !hasJsxAttribute(node, "autocomplete")
      ) {
        const nameAttr = getJsxAttribute(node, "name");
        const nameValue = nameAttr ? getJsxAttributeValue(nameAttr) : null;

        const personalFieldNames = [
          "name", "email", "phone", "tel", "address", "city", "state",
          "zip", "postal", "country", "password", "username", "firstname",
          "lastname", "first-name", "last-name",
        ];

        if (
          typeof nameValue === "string" &&
          personalFieldNames.some((f) =>
            nameValue.toLowerCase().includes(f),
          )
        ) {
          context.report({
            node,
            message: `<input name="${nameValue}"> appears to collect personal data but has no autocomplete attribute`,
          });
        }
      }
    },
  }),
};

export const errorIdentification: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "input" && name !== "select" && name !== "textarea") return;

      const hasAriaInvalid = hasJsxAttribute(node, "aria-invalid");
      if (!hasAriaInvalid) return;

      if (!hasJsxAttribute(node, "aria-describedby") && !hasJsxAttribute(node, "aria-errormessage")) {
        context.report({
          node,
          message: `<${name}> has aria-invalid but no aria-describedby or aria-errormessage — error message won't be announced`,
        });
      }
    },
  }),
};

export const requiredIndicator: Rule = {
  create: (context) => ({
    JSXOpeningElement(node) {
      const name = getJsxElementName(node);
      if (name !== "input" && name !== "select" && name !== "textarea") return;

      if (
        hasJsxAttribute(node, "required") &&
        !hasJsxAttribute(node, "aria-required")
      ) {
        context.report({
          node,
          message: `<${name}> has required attribute but no aria-required — some screen readers may not announce the required state`,
        });
      }
    },
  }),
};
