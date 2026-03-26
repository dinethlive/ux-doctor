import { AbsoluteFill, Sequence } from "remotion";
import { TerminalScene } from "./scenes/TerminalScene";
import { SkillInstallScene } from "./scenes/SkillInstallScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { ClosingScene } from "./scenes/ClosingScene";

export const UxDoctorDemo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Sequence from={0} durationInFrames={540}>
        <TerminalScene />
      </Sequence>

      <Sequence from={540} durationInFrames={175}>
        <SkillInstallScene />
      </Sequence>

      <Sequence from={715} durationInFrames={120}>
        <ResultsScene />
      </Sequence>

      <Sequence from={835} durationInFrames={90}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
