import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, MONO } from "../fonts";

export const ClosingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const cmdOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });
  const cmdY = interpolate(frame, [15, 25], [15, 0], { extrapolateRight: "clamp" });

  const tagsOpacity = interpolate(frame, [30, 40], [0, 1], { extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [45, 55], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: Math.max(0, frame - 45), fps, config: { damping: 8, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: FONT,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            letterSpacing: "-2px",
          }}
        >
          <span style={{ color: "#3b82f6" }}>UX</span> Doctor
        </div>

        <div
          style={{
            opacity: cmdOpacity,
            transform: `translateY(${cmdY}px)`,
            marginTop: 30,
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#1e1e2e",
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 28,
              fontFamily: MONO,
              color: "#22c55e",
              border: "1px solid #313244",
            }}
          >
            npx ux-doctor@latest . --agent
          </div>
        </div>

        <div
          style={{
            opacity: tagsOpacity,
            marginTop: 40,
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["CSS Contrast", "Tailwind", "ARIA", "WCAG AA", "0-100 Score", "AI Agent Ready"].map((tag) => (
            <div
              key={tag}
              style={{
                backgroundColor: "#1e293b",
                color: "#94a3b8",
                padding: "8px 20px",
                borderRadius: 20,
                fontSize: 18,
                fontFamily: FONT,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            marginTop: 50,
            fontSize: 24,
            color: "#64748b",
            fontFamily: FONT,
          }}
        >
          Free &amp; Open Source
          <div style={{ fontSize: 20, color: "#475569", marginTop: 8 }}>
            github.com/dinethlive/ux-doctor
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
