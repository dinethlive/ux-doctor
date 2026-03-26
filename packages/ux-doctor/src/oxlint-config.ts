import type { ProjectInfo } from "./types.js";

interface OxlintConfig {
  plugins: string[];
  jsPlugins: string[];
  rules: Record<string, string>;
}

export const createOxlintConfig = (
  project: ProjectInfo,
  pluginPath: string,
): OxlintConfig => {
  const rules: Record<string, string> = {};

  // built-in oxlint jsx-a11y rules
  rules["jsx-a11y/alt-text"] = "error";
  rules["jsx-a11y/anchor-has-content"] = "error";
  rules["jsx-a11y/anchor-is-valid"] = "warn";
  rules["jsx-a11y/aria-props"] = "error";
  rules["jsx-a11y/aria-role"] = "error";
  rules["jsx-a11y/aria-unsupported-elements"] = "error";
  rules["jsx-a11y/click-events-have-key-events"] = "error";
  rules["jsx-a11y/heading-has-content"] = "error";
  rules["jsx-a11y/html-has-lang"] = "error";
  rules["jsx-a11y/img-redundant-alt"] = "warn";
  rules["jsx-a11y/interactive-supports-focus"] = "error";
  rules["jsx-a11y/lang"] = "error";
  rules["jsx-a11y/mouse-events-have-key-events"] = "error";
  rules["jsx-a11y/no-access-key"] = "warn";
  rules["jsx-a11y/no-autofocus"] = "warn";
  rules["jsx-a11y/no-distracting-elements"] = "error";
  rules["jsx-a11y/no-interactive-element-to-noninteractive-role"] = "warn";
  rules["jsx-a11y/no-noninteractive-element-interactions"] = "warn";
  rules["jsx-a11y/no-redundant-roles"] = "warn";
  rules["jsx-a11y/prefer-tag-over-role"] = "warn";
  rules["jsx-a11y/role-has-required-aria-props"] = "error";
  rules["jsx-a11y/scope"] = "error";
  rules["jsx-a11y/tabindex-no-positive"] = "warn";

  // custom ux-doctor rules (only rules NOT covered by built-in jsx-a11y)
  rules["ux-doctor/semantic/no-div-soup"] = "warn";
  rules["ux-doctor/aria/no-conflicting"] = "error";
  rules["ux-doctor/aria/hidden-focusable"] = "error";
  rules["ux-doctor/keyboard/interactive-tabindex"] = "error";
  rules["ux-doctor/keyboard/focus-trap-escape"] = "warn";
  rules["ux-doctor/forms/label-association"] = "error";
  rules["ux-doctor/forms/autocomplete"] = "warn";
  rules["ux-doctor/forms/error-identification"] = "warn";
  rules["ux-doctor/forms/required-indicator"] = "warn";
  rules["ux-doctor/media/decorative-alt"] = "warn";
  rules["ux-doctor/media/svg-accessible"] = "warn";
  rules["ux-doctor/media/video-captions"] = "error";
  rules["ux-doctor/media/no-autoplay"] = "warn";
  rules["ux-doctor/motion/prefers-reduced-motion-jsx"] = "error";
  rules["ux-doctor/motion/no-autoplay-animation"] = "warn";
  rules["ux-doctor/navigation/duplicate-ids"] = "error";
  rules["ux-doctor/framework/nextjs-image-alt"] = "error";
  rules["ux-doctor/framework/nextjs-link-accessibility"] = "warn";
  rules["ux-doctor/framework/nextjs-head-metadata"] = "warn";
  rules["ux-doctor/framework/rn-accessibility-label"] = "warn";
  rules["ux-doctor/framework/rn-accessibility-role"] = "warn";
  rules["ux-doctor/framework/rn-image-accessibility"] = "warn";
  rules["ux-doctor/framework/dialog-accessibility"] = "warn";
  rules["ux-doctor/framework/icon-button-label"] = "warn";

  return {
    plugins: ["jsx-a11y"],
    jsPlugins: [pluginPath],
    rules,
  };
};
