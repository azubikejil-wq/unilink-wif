import { useEffect } from "react";
import { Wifi } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Wifi className="h-20 w-20 text-primary relative z-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-bold text-primary tracking-tight">
          UniLink
        </h1>
      </div>
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Jahana Network</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
