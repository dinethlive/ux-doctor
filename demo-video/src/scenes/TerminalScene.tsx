import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FONT, MONO } from "../fonts";

// Phase 1: Run verbose command (frames 0-280)
const VERBOSE_LINES = [
  { text: "$ ux-doctor . --verbose", color: "#22c55e", delay: 5, size: 24 },
  { text: "", delay: 15, size: 6 },
  { text: "  _   ___  __   ___          _", color: "#60a5fa", delay: 20, size: 20 },
  { text: " | | | \\ \\/ /   |   \\ ___  __| |_ ___ _ _", color: "#60a5fa", delay: 21, size: 20 },
  { text: " | |_| |>  <    | |) / _ \\/ _|  _/ _ \\ '_|", color: "#60a5fa", delay: 22, size: 20 },
  { text: "  \\___//_/\\_\\   |___/\\___/\\__|\\__\\___/_|", color: "#60a5fa", delay: 23, size: 20 },
  { text: "", delay: 28, size: 6 },
  { text: "  ████████████████░░░░  84/100 Great", color: "#22c55e", delay: 35, size: 26 },
  { text: "  7 errors  9 warnings  1.2s", color: "#e2e8f0", delay: 42, size: 20 },
  { text: "", delay: 48, size: 6 },
  { text: "  ██████████ Contrast            2E", color: "#ef4444", delay: 55, size: 20 },
  { text: "  █████████  Keyboard            1E", color: "#ef4444", delay: 62, size: 20 },
  { text: "  █████████  Focus Indicators    1E 1W", color: "#eab308", delay: 69, size: 20 },
  { text: "  █████████  Forms               1E 1W", color: "#eab308", delay: 76, size: 20 },
  { text: "  ██████████ Typography             2W", color: "#eab308", delay: 83, size: 20 },
  { text: "  ██████████ Motion                 1E 1W", color: "#eab308", delay: 90, size: 20 },
  { text: "  ██████████ Color System           3W", color: "#eab308", delay: 97, size: 20 },
  { text: "", delay: 105, size: 6 },
  { text: "  src/components/Button.tsx", color: "#38bdf8", delay: 115, size: 22 },
  { text: "    14 ERROR [css] contrast 2.5:1, needs 4.5:1", color: "#ef4444", delay: 122, size: 20 },
  { text: "       fix: color: #6b7280;", color: "#22c55e", delay: 130, size: 20 },
  { text: "    22 ERROR [jsx] missing alt attribute", color: "#ef4444", delay: 140, size: 20 },
  { text: '       fix: <img alt="Team photo" />', color: "#22c55e", delay: 148, size: 20 },
  { text: "", delay: 158, size: 6 },
  { text: "  app/globals.css", color: "#38bdf8", delay: 165, size: 22 },
  { text: "    8  ERROR [css] outline:none without replacement", color: "#ef4444", delay: 172, size: 20 },
  { text: "       fix: outline: 2px solid #2563eb;", color: "#22c55e", delay: 180, size: 20 },
  { text: "    27 ERROR [css] no prefers-reduced-motion query", color: "#ef4444", delay: 190, size: 20 },
  { text: "       fix: @media (prefers-reduced-motion) {...}", color: "#22c55e", delay: 198, size: 20 },
  { text: "", delay: 210, size: 6 },
  { text: "  app/page.tsx", color: "#38bdf8", delay: 218, size: 22 },
  { text: "    15 ERROR [tailwind] text-gray-400 bg-white = 2.5:1", color: "#ef4444", delay: 226, size: 20 },
  { text: "       fix: text-gray-700 bg-white", color: "#22c55e", delay: 234, size: 20 },
];

// Phase 2: Show --agent mode (frames 280-520)
const AGENT_LINES = [
  { text: "$ ux-doctor . --agent", color: "#22c55e", delay: 5, size: 24 },
  { text: "", delay: 15, size: 6 },
  { text: "# UX Doctor Report", color: "#f1f5f9", delay: 20, size: 22 },
  { text: "Score: 84/100 (Great)", color: "#22c55e", delay: 28, size: 22 },
  { text: "Found: 7 errors, 9 warnings", color: "#e2e8f0", delay: 36, size: 20 },
  { text: "", delay: 44, size: 6 },
  { text: "## Fix Plan", color: "#a78bfa", delay: 50, size: 22 },
  { text: "Fix errors first, then warnings. Priority 1 = fix first.", color: "#94a3b8", delay: 58, size: 18 },
  { text: "", delay: 66, size: 6 },
  { text: "## src/components/Button.tsx", color: "#38bdf8", delay: 74, size: 22 },
  { text: "- ERROR line 14: contrast 2.5:1, needs 4.5:1 (fix in: css)", color: "#ef4444", delay: 82, size: 18 },
  { text: "  Fix: color: #6b7280;", color: "#22c55e", delay: 90, size: 18 },
  { text: "- ERROR line 22: missing alt attribute (fix in: jsx)", color: "#ef4444", delay: 100, size: 18 },
  { text: '  Fix: <img alt="Description" />', color: "#22c55e", delay: 108, size: 18 },
  { text: "", delay: 118, size: 6 },
  { text: "## app/globals.css", color: "#38bdf8", delay: 126, size: 22 },
  { text: "- ERROR line 8: outline:none without replacement (fix in: css)", color: "#ef4444", delay: 134, size: 18 },
  { text: "  Fix: outline: 2px solid #2563eb;", color: "#22c55e", delay: 142, size: 18 },
  { text: "", delay: 152, size: 6 },
  { text: "## app/page.tsx", color: "#38bdf8", delay: 160, size: 22 },
  { text: "- ERROR line 15: tailwind text-gray-400 bg-white (fix in: tailwind)", color: "#ef4444", delay: 168, size: 18 },
  { text: "  Fix: text-gray-700 bg-white", color: "#22c55e", delay: 176, size: 18 },
];

export const TerminalScene = () => {
  const frame = useCurrentFrame();

  const isPhase1 = frame < 280;
  const phase2Frame = frame - 280;

  const lines = isPhase1 ? VERBOSE_LINES : AGENT_LINES;
  const localFrame = isPhase1 ? frame : phase2Frame;

  // transitions
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const phase1Out = interpolate(frame, [255, 275], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phase2In = interpolate(frame, [280, 295], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phase2Out = interpolate(frame, [515, 535], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const opacity = isPhase1
    ? fadeIn * phase1Out
    : phase2In * phase2Out;

  const termScale = isPhase1
    ? interpolate(frame, [0, 6], [0.96, 1], { extrapolateRight: "clamp" })
    : interpolate(phase2Frame, [0, 10], [0.96, 1], { extrapolateRight: "clamp" });

  // phase label
  const labelText = isPhase1 ? "Human Output" : "Agent Output";
  const labelColor = isPhase1 ? "#60a5fa" : "#a78bfa";
  const labelOpacity = isPhase1
    ? interpolate(frame, [8, 16], [0, 1], { extrapolateRight: "clamp" })
    : interpolate(phase2Frame, [8, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity,
      }}
    >
      {/* Mode label */}
      <div style={{
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: labelOpacity,
      }}>
        <span style={{
          fontSize: 22,
          fontFamily: FONT,
          fontWeight: 600,
          color: labelColor,
          backgroundColor: `${labelColor}15`,
          padding: "8px 24px",
          borderRadius: 8,
          border: `1px solid ${labelColor}30`,
        }}>
          {labelText}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "#11111b",
          borderRadius: 20,
          padding: "32px 44px",
          width: 1300,
          maxHeight: 820,
          fontFamily: MONO,
          lineHeight: 1.45,
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(59,130,246,0.06)",
          border: "1px solid #1e293b",
          transform: `scale(${termScale})`,
          overflow: "hidden",
        }}
      >
        {/* title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>
          <div style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: "#f38ba8" }} />
          <div style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: "#f9e2af" }} />
          <div style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: "#a6e3a1" }} />
          <span style={{ marginLeft: 14, color: "#585b70", fontSize: 14, fontWeight: 500 }}>Terminal</span>
        </div>

        {lines.map((line, i) => {
          const lineOpacity = interpolate(localFrame, [line.delay, line.delay + 2], [0, 1], {
            extrapolateRight: "clamp",
          });
          const lineX = interpolate(localFrame, [line.delay, line.delay + 4], [6, 0], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={`${isPhase1 ? "v" : "a"}-${i}`}
              style={{
                opacity: lineOpacity,
                transform: `translateX(${lineX}px)`,
                color: line.color ?? "#1e1e2e",
                fontSize: line.size,
                minHeight: line.text ? "auto" : line.size,
                fontWeight: line.text.startsWith("$") ? 700 : line.text.startsWith("#") ? 600 : 400,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
