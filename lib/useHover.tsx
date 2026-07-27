"use client";

import { useState, type CSSProperties } from "react";

/**
 * Replaces the old dc-runtime `style-hover="..."` attribute: merges a hover
 * style object on top of the base style while the element is hovered.
 *
 * The same style is applied on keyboard focus. Without it every button, link
 * and card in the app would signal interactivity to the mouse and nothing at
 * all to the keyboard. `:focus-visible` is what keeps a plain mouse click from
 * leaving the style stuck on after the pointer moves away.
 */
export function useHoverStyle(base: CSSProperties, hover: CSSProperties) {
  const [active, setActive] = useState(false);
  const style = active ? { ...base, ...hover } : base;
  const handlers = {
    onMouseEnter: () => setActive(true),
    onMouseLeave: () => setActive(false),
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      try {
        if (e.currentTarget.matches(":focus-visible")) setActive(true);
      } catch {
        // Browser without :focus-visible — fall back to showing it always.
        setActive(true);
      }
    },
    onBlur: () => setActive(false),
  };
  return { style, handlers };
}
