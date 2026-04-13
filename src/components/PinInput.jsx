import React, { useRef, useEffect, useState } from "react";
import { RiEye2Line, RiEyeCloseFill } from "react-icons/ri";
import { useTheme } from "../contexts/ThemeContext";

export default function PinInput({ value = "", setValue, label, autoFocus }) {
  const { theme } = useTheme();
  const inputsRef = useRef([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index, val) => {
    const clean = val.replace(/\D/g, "");
    let arr = value.split("");

    if (clean.length > 1) {
      arr = clean.slice(0, 4).split("");
    } else {
      arr[index] = clean;
    }

    const updated = arr.join("").slice(0, 4);
    setValue(updated);

    if (clean && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`pin-block ${theme}`}>
      <div className="pin-header">
        <label>{label}</label>
        <button
          type="button"
          className="pin-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide PIN" : "Show PIN"}
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
            className="pin-box bg-background text-text border-border hover:scale-[1.05] hover:shadow-lg hover:border-primary/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/75 transition-all duration-200 rounded-lg font-bold text-lg"
            aria-label={`PIN digit ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
