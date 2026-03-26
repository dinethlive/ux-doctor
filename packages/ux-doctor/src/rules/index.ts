import type { RulePlugin } from "./types.js";
import { noDivSoup, headingContent, pageLanguage } from "./semantic.js";
import { validRole, requiredProps, noRedundant, noConflicting, hiddenFocusable } from "./aria.js";
import { clickHasKeyEvent, noPositiveTabindex, interactiveTabindex, noStaticInteraction, focusTrapEscape } from "./keyboard.js";
import { labelAssociation, autocomplete, errorIdentification, requiredIndicator } from "./forms.js";
import { decorativeAlt, svgAccessible, videoCaptions, noAutoplay } from "./media.js";
import { prefersReducedMotionJsx, noAutoplayAnimation } from "./motion.js";
import { duplicateIds } from "./navigation.js";
import { nextImageAlt, nextLinkAccessibility, nextHeadMetadata } from "./framework/nextjs.js";
import { accessibilityLabel, accessibilityRole, imageAccessibility } from "./framework/react-native.js";
import { dialogAccessibility, iconButtonLabel } from "./framework/common-ui-libs.js";

const plugin: RulePlugin = {
  meta: { name: "ux-doctor" },
  rules: {
    "semantic/no-div-soup": noDivSoup,
    "semantic/heading-content": headingContent,
    "semantic/page-language": pageLanguage,
    "aria/valid-role": validRole,
    "aria/required-props": requiredProps,
    "aria/no-redundant": noRedundant,
    "aria/no-conflicting": noConflicting,
    "aria/hidden-focusable": hiddenFocusable,
    "keyboard/click-has-key-event": clickHasKeyEvent,
    "keyboard/no-positive-tabindex": noPositiveTabindex,
    "keyboard/interactive-tabindex": interactiveTabindex,
    "keyboard/no-static-interaction": noStaticInteraction,
    "keyboard/focus-trap-escape": focusTrapEscape,
    "forms/label-association": labelAssociation,
    "forms/autocomplete": autocomplete,
    "forms/error-identification": errorIdentification,
    "forms/required-indicator": requiredIndicator,
    "media/decorative-alt": decorativeAlt,
    "media/svg-accessible": svgAccessible,
    "media/video-captions": videoCaptions,
    "media/no-autoplay": noAutoplay,
    "motion/prefers-reduced-motion-jsx": prefersReducedMotionJsx,
    "motion/no-autoplay-animation": noAutoplayAnimation,
    "navigation/duplicate-ids": duplicateIds,
    "framework/nextjs-image-alt": nextImageAlt,
    "framework/nextjs-link-accessibility": nextLinkAccessibility,
    "framework/nextjs-head-metadata": nextHeadMetadata,
    "framework/rn-accessibility-label": accessibilityLabel,
    "framework/rn-accessibility-role": accessibilityRole,
    "framework/rn-image-accessibility": imageAccessibility,
    "framework/dialog-accessibility": dialogAccessibility,
    "framework/icon-button-label": iconButtonLabel,
  },
};

export default plugin;
