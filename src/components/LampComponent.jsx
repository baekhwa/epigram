import { useState } from "react";
import lampOff from "../assets/images/lamp_off.png";
import lampOn from "../assets/images/lamp_on.png";

export default function LampComponent() {
  const [isLamp, setIsLamp] = useState(false);
  const handleIsLampOnOff = () => {
    setIsLamp(!isLamp);
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        {!isLamp && (
          <img src={lampOff} alt="Lamp Off" onClick={handleIsLampOnOff} />
        )}
        {isLamp && (
          <img src={lampOn} alt="Lamp On" onClick={handleIsLampOnOff} />
        )}
      </div>
    </>
  );
}
