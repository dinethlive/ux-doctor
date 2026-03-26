import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import { log } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface AgentTarget {
  name: string;
  directory: string;
}

const getSkillSourceDir = (): string => {
  // walk up from this file to find skills/ux-doctor/
  const candidates = [
    resolve(__dirname, "..", "..", "skills", "ux-doctor"),
    resolve(__dirname, "..", "..", "..", "skills", "ux-doctor"),
    resolve(__dirname, "..", "..", "..", "..", "skills", "ux-doctor"),
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, "SKILL.md"))) {
      return candidate;
    }
  }

  return candidates[0];
};

const getAgentTargets = (): AgentTarget[] => {
  const home = homedir();
  const targets: AgentTarget[] = [
    { name: "Claude Code", directory: join(home, ".claude", "skills", "ux-doctor") },
    { name: "Cursor", directory: join(home, ".cursor", "skills", "ux-doctor") },
    { name: "Amp Code", directory: join(home, ".config", "amp", "skills", "ux-doctor") },
    { name: "Codex", directory: join(home, ".codex", "skills", "ux-doctor") },
    { name: "Gemini CLI", directory: join(home, ".gemini", "skills", "ux-doctor") },
    { name: "OpenCode", directory: join(home, ".config", "opencode", "skills", "ux-doctor") },
  ];

  return targets.filter((target) => {
    const parentDir = join(target.directory, "..");
    return existsSync(join(parentDir, ".."));
  });
};

const copySkillFiles = async (
  sourceDir: string,
  targetDir: string,
): Promise<void> => {
  await mkdir(targetDir, { recursive: true });

  const skillMdPath = join(sourceDir, "SKILL.md");
  if (existsSync(skillMdPath)) {
    const content = await readFile(skillMdPath, "utf-8");
    await writeFile(join(targetDir, "SKILL.md"), content);
  }

  const refsDir = join(sourceDir, "references");
  if (existsSync(refsDir)) {
    const targetRefsDir = join(targetDir, "references");
    await mkdir(targetRefsDir, { recursive: true });

    const files = await readdir(refsDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = await readFile(join(refsDir, file), "utf-8");
        await writeFile(join(targetRefsDir, file), content);
      }
    }
  }
};

export const uninstallSkill = async (skipPrompt = false): Promise<void> => {
  const targets = getAgentTargets();
  const projectLocal = join(process.cwd(), ".agents", "ux-doctor");
  const allTargets = [
    { name: "Project local (.agents/ux-doctor/)", directory: projectLocal },
    ...targets,
  ];

  const installed = allTargets.filter((t) => existsSync(t.directory));

  if (installed.length === 0) {
    log.info("No ux-doctor skill installations found.");
    return;
  }

  if (!skipPrompt) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Uninstall ux-doctor skill from: ${installed.map((t) => t.name).join(", ")}?`,
      initial: true,
    });

    if (!confirm) return;
  }

  for (const target of installed) {
    try {
      await rm(target.directory, { recursive: true, force: true });
      log.success(`Uninstalled skill from ${target.name}`);
    } catch (error) {
      log.warn(`Failed to uninstall from ${target.name}: ${error}`);
    }
  }
};

export const installSkill = async (skipPrompt = false): Promise<void> => {
  const sourceDir = getSkillSourceDir();

  if (!existsSync(join(sourceDir, "SKILL.md"))) {
    log.warn("Skill source files not found. Try running from the ux-doctor package directory.");
    return;
  }

  const targets = getAgentTargets();

  // always offer project-local install
  const projectLocal = join(process.cwd(), ".agents", "ux-doctor");
  const allTargets = [
    { name: "Project local (.agents/ux-doctor/)", directory: projectLocal },
    ...targets,
  ];

  if (allTargets.length <= 1 && targets.length === 0) {
    log.warn("No AI agent skill directories detected.");
  }

  if (!skipPrompt) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Install ux-doctor skill for: ${allTargets.map((t) => t.name).join(", ")}?`,
      initial: true,
    });

    if (!confirm) return;
  }

  const refsDir = join(sourceDir, "references");
  const refCount = existsSync(refsDir) ? (await readdir(refsDir)).filter((f) => f.endsWith(".md")).length : 0;

  for (const target of allTargets) {
    try {
      await copySkillFiles(sourceDir, target.directory);
      log.success(`Installed skill for ${target.name} (SKILL.md + ${refCount} reference guides)`);
    } catch (error) {
      log.warn(`Failed to install skill for ${target.name}: ${error}`);
    }
  }
};
