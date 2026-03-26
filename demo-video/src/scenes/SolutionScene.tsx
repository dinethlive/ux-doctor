import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, MONO } from "../fonts";

export const SolutionScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const items = [
    { text: "Static CSS contrast analysis", detail: "No browser needed", delay: 10 },
    { text: "Tailwind class pair checking", detail: "text-gray-400 bg-white = 2.5:1", delay: 25 },
    { text: "CSS variable resolution", detail: "var(--color) → #hex → ratio", delay: 40 },
    { text: "47 source lint rules", detail: "ARIA, keyboard, forms, media", delay: 55 },
    { text: "Exact file:line output", detail: "agents open only broken files", delay: 70 },
  ];

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
            color: "#22c55e",
            fontFamily: FONT,
            opacity: fadeIn,
            marginBottom: 50,
          }}
        >
          UX Doctor. The Scout.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {items.map((item, i) => {
            const opacity = interpolate(frame, [item.delay, item.delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(frame, [item.delay, item.delay + 12], [-30, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: 30, color: "#22c55e" }}>&#10003;</span>
                <div>
                  <span style={{ fontSize: 28, color: "#f1f5f9", fontFamily: FONT, fontWeight: 600 }}>
                    {item.text}
                  </span>
                  <span style={{ fontSize: 22, color: "#64748b", fontFamily: MONO, marginLeft: 16 }}>
                    {item.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
