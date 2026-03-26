import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { UxDoctorConfig } from "../types.js";
import { CONFIG_FILE_NAME, PACKAGE_JSON_CONFIG_KEY } from "../constants.js";
import { log } from "./logger.js";

export const loadConfig = async (
  rootDirectory: string,
): Promise<UxDoctorConfig | null> => {
  const configPath = join(rootDirectory, CONFIG_FILE_NAME);

  try {
    const content = await readFile(configPath, "utf-8");
    return JSON.parse(content) as UxDoctorConfig;
  } catch {
    // no config file, try package.json
  }

  try {
    const packageJsonPath = join(rootDirectory, "package.json");
    const content = await readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(content);
    if (packageJson[PACKAGE_JSON_CONFIG_KEY]) {
      return packageJson[PACKAGE_JSON_CONFIG_KEY] as UxDoctorConfig;
    }
  } catch {
    // no package.json or no config key
  }

  log.debug("No config file found, using defaults");
  return null;
};
