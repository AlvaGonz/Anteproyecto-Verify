import React from "react";
import { motion, AnimatePresence, useReducedMotion, animate } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import { ArrowUp } from "lucide-react";

const SHOW_THRESHOLD = 400;
const SCROLL_DURATION = 1.2;

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const animationRef = React.useRef<AnimationPlaybackControls | null>(null);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      animationRef.current?.stop();
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const scrollToTop = () => {
    const start = window.scrollY;
    if (start <= 0) return;
    if (reduceMotion) {
      window.scrollTo(0, 0);
      return;
    }
    animationRef.current?.stop();
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    animationRef.current = animate(start, 0, {
      duration: SCROLL_DURATION,
      ease: "easeInOut",
      onUpdate: (value) => window.scrollTo(0, value),
      onComplete: () => {
        animationRef.current = null;
        root.style.scrollBehavior = "";
      },
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Volver arriba"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.8 }}
          transition={reduceMotion ? { duration: 0.15, ease: "easeOut" } : { duration: 0.2, ease: "easeOut" }}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          className="group fixed bottom-6 right-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_-10px_rgba(249,133,19,0.6)] transition-shadow duration-200 hover:shadow-[0_14px_40px_-10px_rgba(249,133,19,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
