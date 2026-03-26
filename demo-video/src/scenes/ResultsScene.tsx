import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, MONO } from "../fonts";

export const ResultsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [100, 115], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const columns = [
    { label: "LLM Alone", tokens: "50-100K", time: "30-60s", contrast: "Guesses", css: "Misses files", verify: '"Looks good"', color: "#ef4444" },
    { label: "UX Doctor + LLM", tokens: "2K", time: "2 seconds", contrast: "Exact math", css: "Scans all CSS", verify: "Score: 55→91", color: "#22c55e" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity: fadeIn * fadeOut,
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#f1f5f9", fontFamily: FONT }}>
          Why not just use an LLM?
        </div>
      </div>

      <div style={{ display: "flex", gap: 60, justifyContent: "center" }}>
        {columns.map((col, colIdx) => {
          const colOpacity = interpolate(frame, [8 + colIdx * 10, 18 + colIdx * 10], [0, 1], { extrapolateRight: "clamp" });
          const rows = [
            { label: "Context tokens", value: col.tokens },
            { label: "Scan time", value: col.time },
            { label: "Contrast ratios", value: col.contrast },
            { label: "CSS coverage", value: col.css },
            { label: "Verification", value: col.verify },
          ];

          return (
            <div
              key={colIdx}
              style={{
                opacity: colOpacity,
                backgroundColor: "#1e1e2e",
                borderRadius: 16,
                padding: 40,
                width: 450,
                border: `2px solid ${col.color}33`,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: col.color, fontFamily: FONT, marginBottom: 30, textAlign: "center" }}>
                {col.label}
              </div>
              {rows.map((row, rowIdx) => {
                const rowOpacity = interpolate(frame, [18 + colIdx * 10 + rowIdx * 4, 22 + colIdx * 10 + rowIdx * 4], [0, 1], { extrapolateRight: "clamp" });
                return (
                  <div key={rowIdx} style={{ opacity: rowOpacity, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 20, color: "#94a3b8", fontFamily: FONT }}>{row.label}</span>
                    <span style={{ fontSize: 20, color: "#f1f5f9", fontWeight: 600, fontFamily: MONO }}>{row.value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
