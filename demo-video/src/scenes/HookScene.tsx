import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, MONO } from "../fonts";

export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const q1Opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const q1Scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const q1Exit = interpolate(frame, [45, 55], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const scoreEntry = interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" });
  const scoreScale = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 8, stiffness: 80 } });
  const scoreNumber = Math.round(interpolate(frame, [70, 100], [0, 84], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const scoreExit = interpolate(frame, [105, 115], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cmdOpacity = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: "clamp" });
  const cmdScale = spring({ frame: Math.max(0, frame - 115), fps, config: { damping: 10, stiffness: 70 } });
  const cmdExit = interpolate(frame, [160, 170], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
      {frame < 55 && (
        <div style={{ opacity: q1Opacity * q1Exit, transform: `scale(${q1Scale})`, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 82, fontWeight: 700, color: "#ffffff", fontFamily: FONT, lineHeight: 1.15, letterSpacing: "-2px" }}>
            Your app has
          </div>
          <div style={{ fontSize: 82, fontWeight: 700, color: "#ef4444", fontFamily: FONT, lineHeight: 1.15, letterSpacing: "-2px" }}>
            accessibility issues.
          </div>
          <div style={{ fontSize: 42, fontWeight: 500, color: "#64748b", fontFamily: FONT, marginTop: 24 }}>
            You just don't know where.
          </div>
        </div>
      )}

      {frame >= 55 && frame < 115 && (
        <div style={{ opacity: scoreEntry * scoreExit, transform: `scale(${scoreScale})`, textAlign: "center" }}>
          <div style={{ fontSize: 200, fontWeight: 700, fontFamily: FONT, letterSpacing: "-8px", color: scoreNumber >= 75 ? "#22c55e" : scoreNumber >= 50 ? "#eab308" : "#ef4444", lineHeight: 1 }}>
            {scoreNumber}
          </div>
          <div style={{ fontSize: 36, color: "#94a3b8", fontFamily: FONT, fontWeight: 500, marginTop: 12 }}>
            out of 100
          </div>
          <div style={{ fontSize: 48, color: "#ffffff", fontFamily: FONT, fontWeight: 700, marginTop: 30 }}>
            Now you do.
          </div>
        </div>
      )}

      {frame >= 115 && (
        <div style={{ opacity: cmdOpacity * cmdExit, transform: `scale(${cmdScale})`, textAlign: "center" }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#ffffff", fontFamily: FONT, marginBottom: 40 }}>
            One command. Every issue. Exact lines.
          </div>
          <div style={{
            display: "inline-block",
            backgroundColor: "#1e1e2e",
            borderRadius: 16,
            padding: "24px 48px",
            fontSize: 36,
            fontFamily: MONO,
            color: "#22c55e",
            border: "2px solid #313244",
            boxShadow: "0 20px 60px rgba(59,130,246,0.15)",
          }}>
            npx ux-doctor . --verbose
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
