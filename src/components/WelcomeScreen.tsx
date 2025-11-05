import { Button } from "@/components/ui/button";
import { Wifi, Zap, Shield, History } from "lucide-react";

interface WelcomeScreenProps {
  onBuyClick: () => void;
  onHistoryClick: () => void; // Added this line
}

const WelcomeScreen = ({ onBuyClick, onHistoryClick }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wifi className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">UniLink</h1>
          </div>
          
          {/* History Button in Header */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onHistoryClick}
            className="h-10 w-10 rounded-full"
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Welcome to UniLink
            </h2>
            <p className="text-xl text-muted-foreground">
              Buy your Wi-Fi voucher in seconds.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Instant Access</h3>
                <p className="text-sm text-muted-foreground">Get online immediately</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">Trusted by thousands</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-8 space-y-3 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            <Button 
              onClick={onBuyClick}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Buy Wi-Fi Voucher
            </Button>
            
            <Button 
              onClick={onHistoryClick}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              <History className="mr-2 h-4 w-4" />
              View Voucher History
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-6 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Jahana Network</span>
        </p>
      </footer>
    </div>
  );
};

export default WelcomeScreen;