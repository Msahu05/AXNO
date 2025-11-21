import { useEffect, useState } from "react";
import { useThemeMode } from "@/contexts/theme-context";

const LandingAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useThemeMode();

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500">
      <div className="relative flex size-72 items-center justify-center">
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

