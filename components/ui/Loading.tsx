import Image from "next/image";
import styles from "./Loading.module.css";

export function LoadingScreen({ compact = false }: { compact?: boolean }) {
  const size = compact ? 52 : 84;
  return (
    <div className={styles.wrap} style={{ padding: compact ? "32px 24px" : "120px 24px" }}>
      <Image src="/images/logo.png" alt="Marta Confeitaria" width={size} height={size} className={styles.logo} style={{ width: size, height: size, objectFit: "contain" }} />
      <div className={styles.label} style={{ fontSize: compact ? 14 : 17 }}>
        Carregando<span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </div>
    </div>
  );
}
