// src/components/AnimatedSplash.js
import React, { useEffect } from "react";

export default function AnimatedSplash({ logoSrc, onFinish = () => {}, duration = 2500 }) {
  useEffect(() => {
    const id = setTimeout(() => {
      onFinish();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onFinish]);

  return (
    <div style={styles.container} aria-hidden="true">
      <div style={styles.stage}>
        <div style={styles.logoWrap}>
          {/* The "3D" card that rotates and pulses */}
          <div style={styles.card}>
            <img
              src={logoSrc}
              alt="Seva Sanjeevani logo"
              style={styles.logoImage}
              draggable={false}
            />
          </div>
          {/* 3D shadow/glow layers */}
          <div style={styles.glow} />
        </div>

        <div style={styles.textWrap}>
          <h1 style={styles.title}>Seva Sanjeevani</h1>
          <p style={styles.subtitle}>Empowering clean temples • Smart donations</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin3d {
          0% { transform: rotateY(0deg) rotateX(0deg) translateZ(0); }
          30% { transform: rotateY(22deg) rotateX(6deg) translateZ(6px); }
          60% { transform: rotateY(-14deg) rotateX(3deg) translateZ(2px); }
          100% { transform: rotateY(0deg) rotateX(0deg) translateZ(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 8px 40px rgba(166,124,0,0.06); transform: scale(1); }
          50% { box-shadow: 0 28px 80px rgba(166,124,0,0.12); transform: scale(1.02); }
          100% { box-shadow: 0 8px 40px rgba(166,124,0,0.06); transform: scale(1); }
        }
        .splash-fade-out {
          animation: splashFade 0.6s ease forwards;
        }
        @keyframes splashFade {
          to { opacity: 0; transform: translateY(-8px) scale(0.995); pointer-events: none; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(242,247,250,1) 100%)",
    transition: "opacity 0.45s ease, transform 0.45s ease",
    willChange: "opacity, transform",
    flexDirection: "column",
    padding: 24,
  },
  stage: {
    display: "flex",
    alignItems: "center",
    gap: 28,
    transformStyle: "preserve-3d",
    perspective: 1100,
  },
  logoWrap: {
    position: "relative",
    width: 140,
    height: 140,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transformStyle: "preserve-3d",
    animation: "pulse 2.4s ease-in-out infinite",
  },
  card: {
    width: 120,
    height: 120,
    borderRadius: 14,
    background: "linear-gradient(180deg,#fff,#fffaf0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transformStyle: "preserve-3d",
    boxShadow: "0 8px 40px rgba(6, 214, 160, 0.06), 0 2px 8px rgba(0,0,0,0.06)",
    animation: "spin3d 2.6s ease-in-out infinite",
    border: "1px solid rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  logoImage: {
    maxWidth: "82%",
    maxHeight: "82%",
    objectFit: "contain",
    transformStyle: "preserve-3d",
    userSelect: "none",
    pointerEvents: "none",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 30,
    filter: "blur(22px)",
    background: "radial-gradient(circle at 30% 30%, rgba(6,214,160,0.12), rgba(17,138,178,0.06) 30%, transparent 60%)",
    zIndex: -1,
  },
  textWrap: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: "#1f3a3a",
    letterSpacing: 0.6,
    fontWeight: 800,
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
  subtitle: {
    margin: 0,
    color: "#2c6f81",
    fontSize: 13,
    marginTop: 6,
    opacity: 0.9,
  },
};
