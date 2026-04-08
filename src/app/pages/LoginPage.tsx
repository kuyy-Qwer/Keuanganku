import { useState } from "react";
import { useNavigate } from "react-router";
import SimplifiedLoginScreen from "../../imports/SimplifiedLoginScreen/SimplifiedLoginScreen";

export default function LoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleContinue = () => {
    // Simple navigation to app on continue
    navigate("/app");
  };

  const handleBiometrics = () => {
    // Navigate to app via biometrics
    navigate("/app");
  };

  return (
    <div className="relative w-full h-screen" onClick={handleContinue}>
      <SimplifiedLoginScreen />
    </div>
  );
}
