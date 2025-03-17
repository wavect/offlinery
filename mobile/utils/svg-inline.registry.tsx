import React from "react";
import { SvgXml } from "react-native-svg";

export const ImageLoadError = () => (
    <SvgXml
        width="100%"
        height="100%"
        xml={`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="120" height="120" fill="#f5f5f5" rx="4"/>
  
  <!-- Image icon -->
  <rect x="30" y="30" width="60" height="45" stroke="#999" stroke-width="4" fill="none" rx="4"/>
  <circle cx="45" cy="45" r="8" fill="#999"/>
  <path d="M30 65 L50 50 L70 65 L90 40" stroke="#999" stroke-width="4" fill="none"/>
  
  <!-- Error symbol -->
  <circle cx="90" cy="90" r="15" fill="#ff4444"/>
  <path d="M84 84 L96 96 M96 84 L84 96" stroke="white" stroke-width="3"/>
</svg>`}
    />
);
