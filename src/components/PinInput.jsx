import React, { useRef, useEffect, useState } from "react";
import { RiEye2Line, RiEyeCloseFill } from "react-icons/ri";

export default function PinInput({
  value,
  setValue,
  label,
  autoFocus = false,
}) {
  const inputsRef = useRef([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;

    const newPin = value.split("");
    newPin[index] = val;
    const updated = newPin.join("").slice(0, 4);

    setValue(updated);

    if (val && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="pin-block">
      <div className="pin-header">
        <label>{label}</label>
        <button
          type="button"
          className="pin-toggle"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <RiEyeCloseFill /> : <RiEye2Line />}
        </button>
      </div>

      <div className="pin-box-container">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type={visible ? "text" : "password"}
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="pin-box"
          />
        ))}
      </div>
    </div>
  );
}
