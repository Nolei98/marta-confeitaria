"use client";

import { useHoverStyle } from "@/lib/useHover";

/**
 * A foto que flutua sobre o pedestal colorido do card de produto. Havia três
 * cópias — cardápio, home e painel do cliente — diferindo apenas no tamanho.
 */
export type ProductImageSize = "large" | "small";

const SIZES = {
  large: { top: -64, height: 150, shadow: "drop-shadow(0 20px 16px rgba(58,33,28,.28))", lift: -8, scale: 1.06 },
  small: { top: -40, height: 92, shadow: "drop-shadow(0 12px 10px rgba(58,33,28,.24))", lift: -6, scale: 1.08 },
} as const;

export function ProductImage({
  src,
  alt,
  size = "large",
}: {
  src: string;
  alt: string;
  size?: ProductImageSize;
}) {
  const s = SIZES[size];
  const hover = useHoverStyle(
    {
      position: "absolute",
      top: s.top,
      left: "50%",
      transform: "translateX(-50%)",
      height: s.height,
      objectFit: "contain",
      filter: s.shadow,
      transition: "transform .28s ease-out",
      zIndex: 2,
    },
    { transform: `translateX(-50%) translateY(${s.lift}px) scale(${s.scale})` }
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...hover.handlers} style={hover.style} loading="lazy" decoding="async" />;
}
