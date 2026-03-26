import { readFile } from "node:fs/promises";
import { join } from "node:path";
import postcss from "postcss";
import { TAILWIND_DEFAULT_COLORS } from "../constants.js";
import { log } from "../utils/logger.js";

export interface TailwindColorMap {
  colors: Map<string, string>;
}

export const buildTailwindColorMap = async (
  rootDirectory: string,
): Promise<TailwindColorMap> => {
  const colors = new Map<string, string>(
    Object.entries(TAILWIND_DEFAULT_COLORS),
  );

  // try v4 first (@theme in CSS)
  const v4Colors = await loadTailwindV4Colors(rootDirectory);
  if (v4Colors.size > 0) {
    for (const [name, value] of v4Colors) {
      colors.set(name, value);
    }
    log.verbose(`Loaded ${v4Colors.size} Tailwind v4 theme colors`);
    return { colors };
  }

  // try v3 config
  const v3Colors = await loadTailwindV3Colors(rootDirectory);
  if (v3Colors.size > 0) {
    for (const [name, value] of v3Colors) {
      colors.set(name, value);
    }
    log.verbose(`Loaded ${v3Colors.size} Tailwind v3 config colors`);
  }

  return { colors };
};

const loadTailwindV4Colors = async (
  rootDirectory: string,
): Promise<Map<string, string>> => {
  const colors = new Map<string, string>();

  const cssFiles = [
    "src/app/globals.css",
    "src/globals.css",
    "app/globals.css",
    "styles/globals.css",
    "src/index.css",
    "src/styles/globals.css",
  ];

  for (const file of cssFiles) {
    try {
      const content = await readFile(join(rootDirectory, file), "utf-8");
      if (!content.includes("@theme")) continue;

      const root = postcss.parse(content);
      root.walkAtRules("theme", (atRule) => {
        atRule.walkDecls((decl) => {
          if (decl.prop.startsWith("--color-")) {
            const colorName = decl.prop.replace("--color-", "");
            colors.set(colorName, decl.value);
          }
        });
      });

      if (colors.size > 0) break;
    } catch {
      // file doesn't exist
    }
  }

  return colors;
};

const loadTailwindV3Colors = async (
  rootDirectory: string,
): Promise<Map<string, string>> => {
  const colors = new Map<string, string>();

  const configFiles = [
    "tailwind.config.ts",
    "tailwind.config.js",
    "tailwind.config.mjs",
  ];

  for (const configFile of configFiles) {
    try {
      const content = await readFile(
        join(rootDirectory, configFile),
        "utf-8",
      );

      // simple regex extraction of color definitions from config
      // handles: colors: { primary: '#xxx', ... } and extend.colors patterns
      const colorMatches = content.matchAll(
        /['"]([a-zA-Z][\w-]*)['"]:\s*['"]([#\w().,\s]+)['"]/g,
      );

      for (const match of colorMatches) {
        const name = match[1];
        const value = match[2];
        if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
          colors.set(name, value);
        }
      }

      if (colors.size > 0) break;
    } catch {
      // config file doesn't exist
    }
  }

  return colors;
};

export interface TailwindColorPair {
  textColor: string;
  bgColor: string;
  textClass: string;
  bgClass: string;
}

export const extractTailwindColorPairs = (
  className: string,
  colorMap: TailwindColorMap,
): TailwindColorPair[] => {
  const classes = className.split(/\s+/);
  const pairs: TailwindColorPair[] = [];

  const textClasses: Array<{ colorName: string; className: string }> = [];
  const bgClasses: Array<{ colorName: string; className: string }> = [];

  for (const cls of classes) {
    const textMatch = cls.match(/^text-([\w-]+(?:\/\d+)?)$/);
    if (textMatch) {
      const colorName = textMatch[1].replace(/\/\d+$/, "");
      if (colorMap.colors.has(colorName)) {
        textClasses.push({ colorName, className: cls });
      }
    }

    const bgMatch = cls.match(/^bg-([\w-]+(?:\/\d+)?)$/);
    if (bgMatch) {
      const colorName = bgMatch[1].replace(/\/\d+$/, "");
      if (colorMap.colors.has(colorName)) {
        bgClasses.push({ colorName, className: cls });
      }
    }
  }

  for (const text of textClasses) {
    for (const bg of bgClasses) {
      const textColor = colorMap.colors.get(text.colorName);
      const bgColor = colorMap.colors.get(bg.colorName);
      if (textColor && bgColor) {
        pairs.push({
          textColor,
          bgColor,
          textClass: text.className,
          bgClass: bg.className,
        });
      }
    }
  }

  return pairs;
};
