import React from "react";
import { motion } from "motion/react";

interface EVGearLogoProps {
  size?: number;
}

export function EVGearLogo({ size = 84 }: EVGearLogoProps) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-[#e8f1fd] shadow-sm border border-blue-100/90 mx-auto select-none"
      style={{ width: size, height: size }}
    >
      {/* 
        Smooth 6-Tooth Mechanical Gear
        Rotating Right-to-Left (Counter-Clockwise: -360deg)
      */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center p-2.5"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#15549d] drop-shadow-xs"
          fill="currentColor"
        >
          {/* 6 Symmetrical Rounded Gear Teeth */}
          <rect x="43" y="6" width="14" height="24" rx="5" />
          <rect x="43" y="6" width="14" height="24" rx="5" transform="rotate(60 50 50)" />
          <rect x="43" y="6" width="14" height="24" rx="5" transform="rotate(120 50 50)" />
          <rect x="43" y="6" width="14" height="24" rx="5" transform="rotate(180 50 50)" />
          <rect x="43" y="6" width="14" height="24" rx="5" transform="rotate(240 50 50)" />
          <rect x="43" y="6" width="14" height="24" rx="5" transform="rotate(300 50 50)" />

          {/* Solid Gear Body */}
          <circle cx="50" cy="50" r="33" />

          {/* Gear Center Cutout */}
          <circle cx="50" cy="50" r="22" fill="#e8f1fd" />
        </svg>
      </motion.div>

      {/* 
        Proportional Centered EV Logo Hub
        Fits neatly inside the gear's center ring without covering the teeth!
      */}
      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#0c3875] to-[#071d3d] shadow-sm border border-white/30">
        <span className="text-xs font-black text-[#fbe947] tracking-tight select-none">
          EV
        </span>
      </div>
    </div>
  );
}
