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

  // ✅ HANDLE CHANGE + PASTE
  const handleChange = (index, val) => {
    const clean = val.replace(/\D/g, "");

    // 🔥 Handle paste (e.g. "1234")
    if (clean.length > 1) {
      const newPin = clean.slice(0, 4).split("");
      setValue(newPin.join(""));

      newPin.forEach((digit, i) => {
        if (inputsRef.current[i]) {
          inputsRef.current[i].value = digit;
        }
      });

      inputsRef.current[Math.min(newPin.length - 1, 3)]?.focus();
      return;
    }

    // ✅ Normal typing
    if (!/^\d?$/.test(clean)) return;

    const newPin = value.split("");
    newPin[index] = clean;
    const updated = newPin.join("").slice(0, 4);

    setValue(updated);

    if (clean && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ✅ BACKSPACE HANDLING
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  // ✅ SYNC INPUTS WITH VALUE (IMPORTANT)
  useEffect(() => {
    const arr = value.split("");
    inputsRef.current.forEach((input, i) => {
      if (input) input.value = arr[i] || "";
    });
  }, [value]);

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
