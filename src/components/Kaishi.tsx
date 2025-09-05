import React from "react";
import styles from "./TitleScreen.module.css";

type TitleScreenProps = {
  onLoginStart: () => void;
  onGuestStart: () => void;
  appName?: string;
  Logo?: React.ComponentType; // カスタムロゴを差し替え可能
};

const DefaultLogo: React.FC = () => (
  <svg
    className={styles.logoSvg}
    viewBox="0 0 240 80"
    role="img"
    aria-label="App Logo"
  >
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="240" height="80" rx="12" fill="none" stroke="currentColor" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="28"
      fontWeight="700"
      fill="url(#g)"
    >
      PayMapKitaQ
    </text>
  </svg>
);

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onLoginStart,
  onGuestStart,
  appName = "PayMapKitaQ",
  Logo = DefaultLogo,
}) => {
  return (
    <main className={styles.root} aria-labelledby="app-title">
      <section className={styles.topHalf}>
        <h1 id="app-title" className={styles.visuallyHidden}>
          {appName}
        </h1>
        <div className={styles.logoWrap} aria-hidden="true">
          <Logo />
        </div>
      </section>

      <section className={styles.bottomHalf}>
        <div className={styles.buttonStack} role="group" aria-label="開始方法">
          <button
            className={`${styles.cta} ${styles.primary}`}
            onClick={onLoginStart}
          >
            ログインして始める
          </button>
          <button
            className={`${styles.cta} ${styles.secondary}`}
            onClick={onGuestStart}
          >
            ログインせずに始める
          </button>
        </div>
      </section>
    </main>
  );
};

export default TitleScreen;
