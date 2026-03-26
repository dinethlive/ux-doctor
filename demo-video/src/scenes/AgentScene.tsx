import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FONT, MONO } from "../fonts";

const STEPS = [
  { icon: "1", text: "Agent runs ux-doctor . --agent", detail: "2 seconds, 2K tokens", delay: 10 },
  { icon: "2", text: "Gets exact files and lines to fix", detail: "with code examples", delay: 30 },
  { icon: "3", text: "Opens only the broken files", detail: "saves 50K+ tokens", delay: 50 },
  { icon: "4", text: "Applies fixes from fixExample", detail: "knows JSX vs CSS vs Tailwind", delay: 70 },
  { icon: "5", text: "Re-runs to verify score improved", detail: "55 → 78 → 91", delay: 90 },
];

export const AgentScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity: fadeIn * fadeOut,
        padding: 100,
      }}
    >
      <div style={{ maxWidth: 1200 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#a78bfa", fontFamily: FONT, marginBottom: 50 }}>
          The Agent Workflow
        </div>

        {STEPS.map((step, i) => {
          const opacity = interpolate(frame, [step.delay, step.delay + 10], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [step.delay, step.delay + 10], [40, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: FONT,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, color: "#f1f5f9", fontWeight: 600, fontFamily: FONT }}>
                  {step.text}
                </div>
                <div style={{ fontSize: 20, color: "#64748b", fontFamily: MONO }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
