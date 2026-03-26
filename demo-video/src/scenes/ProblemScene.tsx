import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FONT, MONO } from "../fonts";

export const ProblemScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const item1 = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const item2 = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const item3 = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });

  const cross1Y = interpolate(frame, [10, 25], [30, 0], { extrapolateRight: "clamp" });
  const cross2Y = interpolate(frame, [25, 40], [30, 0], { extrapolateRight: "clamp" });
  const cross3Y = interpolate(frame, [40, 55], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity: fadeOut,
        padding: 100,
      }}
    >
      <div style={{ maxWidth: 1200 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ef4444",
            fontFamily: FONT,
            opacity: fadeIn,
            marginBottom: 50,
          }}
        >
          The Problem
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ opacity: item1, transform: `translateY(${cross1Y}px)`, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 36, color: "#ef4444" }}>x</span>
            <span style={{ fontSize: 30, color: "#e2e8f0", fontFamily: FONT }}>
              AI agents <span style={{ color: "#94a3b8" }}>scan your entire codebase.</span> Burns context window.
            </span>
          </div>

          <div style={{ opacity: item2, transform: `translateY(${cross2Y}px)`, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 36, color: "#ef4444" }}>x</span>
            <span style={{ fontSize: 30, color: "#e2e8f0", fontFamily: FONT }}>
              They <span style={{ color: "#94a3b8" }}>guess contrast ratios.</span> LLMs can't do exact math.
            </span>
          </div>

          <div style={{ opacity: item3, transform: `translateY(${cross3Y}px)`, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 36, color: "#ef4444" }}>x</span>
            <span style={{ fontSize: 30, color: "#e2e8f0", fontFamily: FONT }}>
              They <span style={{ color: "#94a3b8" }}>miss CSS files.</span> Stylesheets, tokens, Tailwind ignored.
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
