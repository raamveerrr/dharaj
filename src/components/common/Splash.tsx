import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_DATA_URI =
  "data:image/jpeg;base64,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";

const SPLASH_KEY = "dharaj-splash-seen";
const SPLASH_DURATION = 2000;

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, SPLASH_DURATION);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.035 }}
      transition={{ duration: 0.38, ease: "easeIn" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 40%, #0d3b2c 0%, #082720 100%)",
      }}
    >
      {/* ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
        className="pointer-events-none absolute"
        style={{
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(207,168,85,0.35) 0%, rgba(207,168,85,0) 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* logo + ring + shimmer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.72, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.12, ease: [0.19, 1.35, 0.4, 1] }}
        className="relative"
        style={{ width: 280, maxWidth: "70vw" }}
      >
        <img
          src={LOGO_DATA_URI}
          alt="Dharaj"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 999,
            filter: "drop-shadow(0 10px 26px rgba(0,0,0,0.45))",
          }}
        />

        {/* gold ring */}
        <svg
          viewBox="0 0 100 46"
          preserveAspectRatio="none"
          className="pointer-events-none absolute"
          style={{ inset: -14, width: "calc(100% + 28px)", height: "calc(100% + 28px)", overflow: "visible" }}
        >
          <motion.rect
            x={1}
            y={1}
            width={98}
            height={44}
            rx={22}
            ry={22}
            fill="none"
            stroke="#cfa855"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ strokeDasharray: 900, strokeDashoffset: 900, opacity: 0.9 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.9, delay: 0.32, ease: "easeOut" }}
          />
        </svg>

        {/* shimmer sweep */}
        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{ inset: 0, borderRadius: 999 }}
        >
          <motion.div
            initial={{ opacity: 0, left: "-60%" }}
            animate={{ opacity: [0, 1, 1, 0], left: ["-60%", "-60%", "120%", "120%"] }}
            transition={{ duration: 0.85, delay: 0.78, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
            className="absolute"
            style={{
              top: "-40%",
              width: "40%",
              height: "180%",
              background:
                "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,236,190,0.55) 50%, rgba(255,255,255,0) 100%)",
              transform: "rotate(8deg)",
            }}
          />
        </div>

        {/* gold dot mark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.15, ease: "easeOut" }}
          className="absolute"
          style={{
            bottom: -34,
            left: "50%",
            transform: "translateX(-50%)",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#f0d99a",
            boxShadow: "0 0 12px 2px rgba(240,217,154,0.7)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export function useSplash() {
  // Always start hidden so the server and the first client render match;
  // decide whether to show the splash after hydration.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SPLASH_KEY)) setShow(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setShow(false);
  };

  return { show, dismiss };
}

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { show, dismiss } = useSplash();
  return (
    <>
      <AnimatePresence>
        {show && <Splash onDone={dismiss} />}
      </AnimatePresence>
      {children}
    </>
  );
}
