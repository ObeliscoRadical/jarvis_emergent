import { motion } from "framer-motion";
import { ORB_LABELS } from "@/jarvisPreview/constants";

const FACE_IMAGE_URL = "https://static.prod-images.emergentagent.com/jobs/b341e959-5ed6-4bf7-b7d3-7fbbb183998c/images/775a77bb70fb58af6707372d2a592dfacf9128882a8f54e25c12128344c6e6bf.jpeg";

export function ReactorOrb({ state, speechPulse = 0, onToggleListening }) {
  const mouthScaleY = state === "speaking" ? 0.76 + speechPulse * 0.08 : state === "listening" ? 0.92 : 0.78;
  const mouthScaleX = state === "speaking" ? 1 + speechPulse * 0.03 : 1;
  const mouthOpacity = state === "speaking" ? 0.4 + speechPulse * 0.08 : 0.2;

  return (
    <button
      type="button"
      className={`cinematic-orb orbital-${state}`}
      data-testid="reactor-orb-button"
      onClick={onToggleListening}
      aria-label="Ativar ou pausar escuta simulada"
    >
      <span className="orbital-backlight orbital-backlight-left" />
      <span className="orbital-backlight orbital-backlight-right" />
      <span className="orbital-ring orbital-ring-outer" />
      <span className="orbital-ring orbital-ring-outer-2" />
      <span className="orbital-ring orbital-ring-mid" />
      <span className="orbital-ring orbital-ring-inner" />
      <span className="orbital-arc orbital-arc-a" />
      <span className="orbital-arc orbital-arc-b" />
      <span className="orbital-arc orbital-arc-c" />
      <span className="orbital-grid" />
      <span className="orbital-target orbital-target-h" />
      <span className="orbital-target orbital-target-v" />
      <motion.span
        className="orbital-core"
        animate={
          state === "thinking"
            ? { scale: [0.95, 1.1, 0.98], opacity: [0.88, 1, 0.92] }
            : state === "speaking"
              ? { scale: [1, 1.06, 1], opacity: [0.92, 1, 0.92] }
              : state === "listening"
                ? { scale: [0.98, 1.04, 0.98], opacity: [0.9, 1, 0.9] }
                : { scale: [0.96, 1.02, 0.96], opacity: [0.84, 1, 0.84] }
        }
        transition={{ duration: state === "thinking" ? 0.8 : 1.8, repeat: Infinity }}
      >
        <span className="orbital-core-shell">
          <span className="orbital-face-frame">
            <img
              src={FACE_IMAGE_URL}
              alt="Avatar holográfico do JARVAS"
              className="orbital-face-image"
              data-testid="reactor-face-image"
            />
            <span className="orbital-face-overlay" />
            <span className="orbital-face-scan" />
            <span
              className="orbital-mouth-glow"
              style={{
                opacity: mouthOpacity,
                transform: `translateX(-50%) scaleX(${mouthScaleX}) scaleY(${mouthScaleY})`,
              }}
            />
            <span
              className="orbital-mouth-line"
              style={{
                opacity: state === "speaking" ? 0.8 : 0.38,
                transform: `translateX(-50%) scaleX(${mouthScaleX}) scaleY(${mouthScaleY})`,
              }}
            />
          </span>
        </span>
      </motion.span>
      <span className="orbital-notch orbital-notch-a" />
      <span className="orbital-notch orbital-notch-b" />
      <span className="orbital-notch orbital-notch-c" />
      <div className="orbital-caption-wrap">
        <span className="orbital-caption-kicker">CENTRAL CORE</span>
        <span className="orbital-caption" data-testid="reactor-state-label">
          {ORB_LABELS[state]}
        </span>
      </div>
    </button>
  );
}
