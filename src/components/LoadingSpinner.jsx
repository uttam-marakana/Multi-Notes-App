import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const LoadingSpinner = ({ message = "Loading..." }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        padding: "2rem",
        color: colors.text,
      }}
    >
      <div
        className="spinner"
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${colors.border}`,
          borderTopColor: colors.primary,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem",
        }}
      />
      <p style={{ margin: 0, fontSize: "0.9rem" }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
