import { useEffect, useState } from "react";
import { useThemeMode } from "@/contexts/theme-context";

let landingPlayed = false;

const LandingAnimation = () => {
  const [isVisible, setIsVisible] = useState(() => !landingPlayed);
  const { theme } = useThemeMode();

  useEffect(() => {
    if (landingPlayed) return;
    landingPlayed = true;
    const timeout = window.setTimeout(() => setIsVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500">
      <div className="relative flex size-72 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_rgba(127,90,255,0.4))] shadow-[0_25px_65px_rgba(0,0,0,0.2)]">
        {[...Array(10)].map((_, index) => (
          <span
            key={index}
            className={`landing-piece landing-piece-${index} ${theme === "dark" ? "landing-piece-dark" : "landing-piece-light"}`}
          />
        ))}
        <div className="landing-glow" />
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.8em] text-muted-foreground">Own The Look</p>
          <p className="text-6xl font-black tracking-[0.3em] text-foreground">AXNO</p>
        </div>
      </div>
    </div>
  );
};

export default LandingAnimation;

