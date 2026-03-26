import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FONT, MONO } from "../fonts";

const CONVERSATION = [
  { type: "user", text: "check my app for accessibility issues and fix them", delay: 8 },
  { type: "thinking", text: "I'll use the ux-doctor skill to scan for accessibility issues.", delay: 28 },
  { type: "tool", text: "ux-doctor . --agent", delay: 42 },
  { type: "output", text: "Score: 84/100 (Great)", delay: 55 },
  { type: "output", text: "Found: 7 errors, 9 warnings", delay: 60 },
  { type: "output", text: "", delay: 64 },
  { type: "output", text: "src/components/Button.tsx", delay: 67 },
  { type: "output", text: "  14 ERROR [css] contrast 2.5:1 (fix: color: #6b7280)", delay: 72 },
  { type: "output", text: "  22 ERROR [jsx] missing alt (fix: alt=\"...\")", delay: 77 },
  { type: "output", text: "app/globals.css", delay: 83 },
  { type: "output", text: "  8 ERROR [css] outline:none (fix: outline: 2px solid)", delay: 88 },
  { type: "assistant", text: "Found 7 errors across 3 files. Let me fix them.", delay: 100 },
  { type: "assistant", text: "", delay: 105 },
  { type: "tool", text: "Edit src/components/Button.tsx", delay: 110 },
  { type: "edit", text: "  Changed color: #9ca3af to color: #6b7280 (line 14)", delay: 120 },
  { type: "edit", text: '  Added alt="Team collaboration photo" (line 22)', delay: 128 },
];

export const SkillInstallScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [155, 170], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [6, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Label */}
      <div style={{
        position: "absolute",
        top: 24,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: labelOpacity,
      }}>
        <span style={{
          fontSize: 24,
          fontFamily: FONT,
          fontWeight: 600,
          color: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.08)",
          padding: "8px 28px",
          borderRadius: 8,
          border: "1px solid rgba(245,158,11,0.2)",
        }}>
          Claude Code + UX Doctor Skill
        </span>
      </div>

      {/* Claude Code window - SCALED UP */}
      <div style={{
        width: 1500,
        backgroundColor: "#000000",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
        border: "1px solid #333333",
        transform: "scale(1.05)",
        transformOrigin: "center center",
      }}>
        {/* Windows title bar */}
        <div style={{
          backgroundColor: "#1e1e1e",
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 14,
          paddingRight: 8,
          borderBottom: "1px solid #333333",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, color: "#cccccc", fontFamily: MONO }}>C:\WINDOWS\system32\cmd.</span>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ width: 46, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#999999", fontSize: 18, lineHeight: 1 }}>_</span>
            </div>
            <div style={{ width: 46, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#999999", fontSize: 15 }}>口</span>
            </div>
            <div style={{ width: 46, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#999999", fontSize: 18 }}>x</span>
            </div>
          </div>
        </div>

        {/* Claude Code header */}
        <div style={{ padding: "22px 32px 18px 32px", display: "flex", alignItems: "flex-start", gap: 18 }}>
          <div style={{
            width: 56,
            height: 50,
            backgroundColor: "#c0795a",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            flexShrink: 0,
            marginTop: 2,
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 9, height: 9, backgroundColor: "#1a1a1a", borderRadius: 2 }} />
              <div style={{ width: 9, height: 9, backgroundColor: "#1a1a1a", borderRadius: 2 }} />
            </div>
            <div style={{ width: 18, height: 3, backgroundColor: "#1a1a1a", borderRadius: 1 }} />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 20 }}>
              <span style={{ color: "#ffffff", fontWeight: 700 }}>Claude Code</span>
              <span style={{ color: "#888888" }}> v2.1.84</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: "#888888", marginTop: 2 }}>
              Opus 4.6 (1M context) with low effort · Claude Max
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: "#888888", marginTop: 1 }}>
              G:\Projects\my-app
            </div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: "#333333", margin: "0 32px" }} />

        {/* Conversation */}
        <div style={{ padding: "18px 32px 22px 32px", minHeight: 440 }}>
          {CONVERSATION.map((msg, i) => {
            const msgOpacity = interpolate(frame, [msg.delay, msg.delay + 3], [0, 1], { extrapolateRight: "clamp" });
            const msgY = interpolate(frame, [msg.delay, msg.delay + 5], [6, 0], { extrapolateRight: "clamp" });

            if (msg.type === "user") {
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ color: "#555555", fontFamily: MONO, fontSize: 20, marginTop: 1, fontWeight: 700 }}>{">"}</span>
                  <span style={{ color: "#ffffff", fontFamily: MONO, fontSize: 20 }}>{msg.text}</span>
                </div>
              );
            }

            if (msg.type === "thinking") {
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, marginBottom: 14, paddingLeft: 28 }}>
                  <span style={{ color: "#a78bfa", fontFamily: MONO, fontSize: 17, fontStyle: "italic" }}>{msg.text}</span>
                </div>
              );
            }

            if (msg.type === "tool") {
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, marginBottom: 10, paddingLeft: 28 }}>
                  <span style={{
                    color: "#22c55e",
                    fontFamily: MONO,
                    fontSize: 17,
                    backgroundColor: "rgba(34,197,94,0.1)",
                    padding: "4px 14px",
                    borderRadius: 5,
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}>
                    {msg.text}
                  </span>
                </div>
              );
            }

            if (msg.type === "output") {
              if (!msg.text) return <div key={i} style={{ opacity: msgOpacity, height: 5 }} />;
              const isFile = !msg.text.startsWith(" ");
              const isError = msg.text.includes("ERROR");
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, paddingLeft: 42 }}>
                  <span style={{
                    color: isFile ? "#38bdf8" : isError ? "#ef4444" : "#94a3b8",
                    fontFamily: MONO,
                    fontSize: 16,
                    fontWeight: isFile ? 600 : 400,
                  }}>
                    {msg.text}
                  </span>
                </div>
              );
            }

            if (msg.type === "assistant") {
              if (!msg.text) return <div key={i} style={{ opacity: msgOpacity, height: 12 }} />;
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, marginBottom: 6, paddingLeft: 28 }}>
                  <span style={{ color: "#e2e8f0", fontFamily: MONO, fontSize: 17 }}>{msg.text}</span>
                </div>
              );
            }

            if (msg.type === "edit") {
              return (
                <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, paddingLeft: 42, marginBottom: 3 }}>
                  <span style={{ color: "#22c55e", fontFamily: MONO, fontSize: 16 }}>{msg.text}</span>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid #333333",
          padding: "10px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ color: "#555555", fontFamily: MONO, fontSize: 14 }}>? for shortcuts</span>
          <span style={{ color: "#555555", fontFamily: MONO, fontSize: 14 }}>o low · /effort</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
