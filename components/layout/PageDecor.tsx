"use client";

import styles from "./PageDecor.module.css";
import { WhiskIcon, CupcakeIcon, CookieIcon, RollingPinIcon, PipingBagIcon, CakeSliceIcon } from "@/components/icons";

const SHAPES = [
  { Icon: WhiskIcon, top: "10vh", side: "left", offset: "3%", size: 46, rotate: -18 },
  { Icon: CupcakeIcon, top: "34vh", side: "right", offset: "4%", size: 50, rotate: 12 },
  { Icon: CookieIcon, top: "62vh", side: "left", offset: "6%", size: 40, rotate: 8 },
  { Icon: RollingPinIcon, top: "92vh", side: "right", offset: "2%", size: 54, rotate: -10 },
  { Icon: PipingBagIcon, top: "124vh", side: "left", offset: "4%", size: 44, rotate: 14 },
  { Icon: CakeSliceIcon, top: "156vh", side: "right", offset: "5%", size: 42, rotate: -14 },
  { Icon: WhiskIcon, top: "188vh", side: "right", offset: "3%", size: 40, rotate: 22 },
  { Icon: CookieIcon, top: "218vh", side: "left", offset: "3%", size: 48, rotate: -6 },
  { Icon: CupcakeIcon, top: "252vh", side: "left", offset: "5%", size: 42, rotate: -16 },
  { Icon: PipingBagIcon, top: "284vh", side: "right", offset: "4%", size: 46, rotate: 10 },
] as const;

export function PageDecor() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={styles.shape}
          style={{
            top: s.top,
            [s.side]: s.offset,
            transform: `rotate(${s.rotate}deg)`,
          }}
        >
          <s.Icon size={s.size} />
        </div>
      ))}
    </div>
  );
}
