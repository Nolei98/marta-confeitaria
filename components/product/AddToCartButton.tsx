"use client";

import { useHoverStyle } from "@/lib/useHover";

/**
 * Botão de adicionar ao carrinho. Existia em quatro cópias quase idênticas
 * (cardápio, home, destaques da home e painel do cliente), o que fez o estado
 * de esgotado nascer só em três delas — no painel do cliente dava para
 * adicionar produto sem estoque.
 *
 * As variantes mudam só tamanho e posição; o comportamento é o mesmo.
 */
export type AddToCartVariant = "default" | "compact" | "corner";

const SIZES: Record<AddToCartVariant, React.CSSProperties> = {
  default: { width: 32, height: 32, fontSize: 16 },
  compact: { width: 28, height: 28, fontSize: 15, fontWeight: 700 },
  corner: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    fontSize: 14,
    fontWeight: 700,
    zIndex: 1,
    display: "grid",
    placeItems: "center",
  },
};

const BASE: React.CSSProperties = {
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "transform .2s ease, background-color .2s ease",
};

export function AddToCartButton({
  onClick,
  disabled,
  variant = "default",
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: AddToCartVariant;
  className?: string;
}) {
  const corner = variant === "corner";
  const hover = useHoverStyle(
    {
      ...BASE,
      ...SIZES[variant],
      background: corner ? "#f6d9dd" : "#c1531c",
      color: corner ? "#c1531c" : "#fff",
    },
    corner
      ? { background: "#c1531c", color: "#fff", transform: "scale(1.15)" }
      : { background: "#8a6470", transform: "scale(1.18)" }
  );

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-label="Esgotado"
        className={className}
        style={{
          ...hover.style,
          background: corner ? "#e7dcd6" : "#c9beb5",
          color: corner ? "#a08c85" : "#fff",
          cursor: "not-allowed",
        }}
      >
        +
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Adicionar ao carrinho"
      className={className}
      {...hover.handlers}
      style={hover.style}
    >
      +
    </button>
  );
}
