"use client";

import { useState, type CSSProperties } from "react";

/**
 * Replaces the old dc-runtime `style-hover="..."` attribute: merges a hover
 * style object on top of the base style while the element is hovered.
 */
export function useHoverStyle(base: CSSProperties, hover: CSSProperties) {
  const [hovered, setHovered] = useState(false);
  const style = hovered ? { ...base, ...hover } : base;
  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
  return { style, handlers };
}
