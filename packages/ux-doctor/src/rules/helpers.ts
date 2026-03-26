import type { EsTreeNode } from "./types.js";

export const getJsxElementName = (node: EsTreeNode): string | null => {
  if (node.type === "JSXOpeningElement") {
    const name = node.name as EsTreeNode | undefined;
    if (name?.type === "JSXIdentifier") {
      return name.name as string;
    }
  }
  return null;
};

export const getJsxAttribute = (
  node: EsTreeNode,
  attributeName: string,
): EsTreeNode | null => {
  const attributes = node.attributes as EsTreeNode[] | undefined;
  if (!attributes) return null;

  for (const attr of attributes) {
    if (attr.type === "JSXAttribute") {
      const name = attr.name as EsTreeNode | undefined;
      if (name?.type === "JSXIdentifier" && name.name === attributeName) {
        return attr;
      }
    }
  }
  return null;
};

export const hasJsxAttribute = (
  node: EsTreeNode,
  attributeName: string,
): boolean => {
  return getJsxAttribute(node, attributeName) !== null;
};

export const getJsxAttributeValue = (
  attr: EsTreeNode,
): string | boolean | null => {
  const value = attr.value as EsTreeNode | null | undefined;

  if (value === null || value === undefined) return true;

  if (value.type === "Literal" || value.type === "StringLiteral") {
    return value.value as string;
  }

  if (value.type === "JSXExpressionContainer") {
    const expression = value.expression as EsTreeNode | undefined;
    if (expression?.type === "Literal") {
      return expression.value as string | boolean;
    }
  }

  return null;
};

export const isInteractiveElement = (elementName: string): boolean => {
  const interactive = new Set([
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "details",
    "summary",
  ]);
  return interactive.has(elementName.toLowerCase());
};

export const isNativeButton = (elementName: string): boolean =>
  elementName.toLowerCase() === "button";

export const isHeadingElement = (elementName: string): boolean =>
  /^h[1-6]$/i.test(elementName);

export const walkAst = (
  node: EsTreeNode,
  visitor: (child: EsTreeNode) => void,
): void => {
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (child && typeof child === "object") {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === "object" && "type" in item) {
            walkAst(item as EsTreeNode, visitor);
          }
        }
      } else if ("type" in (child as Record<string, unknown>)) {
        walkAst(child as EsTreeNode, visitor);
      }
    }
  }
};
