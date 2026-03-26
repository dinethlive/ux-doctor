import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const TitleScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, config: { damping: 12, stiffness: 80 } }) * -20;
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [25, 45], [20, 0], { extrapolateRight: "clamp" });

  const lineWidth = interpolate(frame, [15, 40], [0, 400], { extrapolateRight: "clamp" });

  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity: fadeOut,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            letterSpacing: "-2px",
          }}
        >
          <span style={{ color: "#3b82f6" }}>UX</span> Doctor
        </div>

        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: "#3b82f6",
            margin: "20px auto",
            borderRadius: 2,
          }}
        />

        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            fontFamily: "system-ui, sans-serif",
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          The accessibility scanner that tells AI agents
          <br />
          <span style={{ color: "#60a5fa" }}>exactly where to fix</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
