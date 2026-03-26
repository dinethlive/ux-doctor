import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const FONT = fontFamily;
export const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace";
