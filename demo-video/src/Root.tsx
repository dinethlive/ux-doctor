import { Composition } from "remotion";
import { UxDoctorDemo } from "./UxDoctorDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="UxDoctorDemo"
      component={UxDoctorDemo}
      durationInFrames={925}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
