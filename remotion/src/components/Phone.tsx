import React from "react";
import { C } from "../theme";

export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; width?: number; height?: number }> = ({ children, style, width = 440, height = 900 }) => {
  return (
    <div style={{
      width, height, borderRadius: 56,
      background: "#0a0503", padding: 12,
      boxShadow: "0 50px 100px rgba(0,0,0,0.7), inset 0 0 0 2px #2a1a10",
      ...style,
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 46,
        background: C.cream, overflow: "hidden", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
          width: 100, height: 24, borderRadius: 9999, background: "#0a0503", zIndex: 10,
        }} />
        {children}
      </div>
    </div>
  );
};
