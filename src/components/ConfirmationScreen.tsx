import { Button } from "@/components/ui/button";
import { CheckCircle2, Wifi, Copy, Check, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConfirmationScreenProps {
  days: number;
  total: number;
  voucherCode: string;
  securityPin: string;
  onBackToHome: () => void;
}

const ConfirmationScreen = ({ days, total, voucherCode, securityPin, onBackToHome }: ConfirmationScreenProps) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Voucher code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(securityPin);
      setCopiedPin(true);
      toast({
        title: "Copied!",
        description: "Security PIN copied to clipboard",
      });
      setTimeout(() => setCopiedPin(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyBoth = async () => {
    try {
      const text = `UniLink WiFi Voucher\nCode: ${voucherCode}\nPIN: ${securityPin}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Voucher code and PIN copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">UniLink</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2 className="h-24 w-24 text-primary relative z-10" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <h2 className="text-3xl font-bold text-foreground">
              Payment Successful!
            </h2>
            <p className="text-lg text-muted-foreground">
              Your Wi-Fi voucher is ready to use.
            </p>
          </div>

          {/* Voucher Code */}
          <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Voucher Code</p>
              <div className="font-mono text-3xl font-bold text-primary tracking-wider mb-3">
                {voucherCode}
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="w-full h-10"
                disabled={copiedCode}
              >
                {copiedCode ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Security PIN */}
          <div className="p-6 rounded-2xl bg-green-500/5 border-2 border-green-500/20 space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-green-600">Security PIN</p>
              </div>
              <div className="font-mono text-3xl font-bold text-green-600 tracking-widest mb-3">
                {securityPin}
              </div>
              <Button
                onClick={handleCopyPin}
                variant="outline"
                size="sm"
                className="w-full h-10 border-green-500/20 hover:bg-green-500/10"
                disabled={copiedPin}
              >
                {copiedPin ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy PIN
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Keep Your PIN Secure
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  You'll need both the voucher code and PIN to connect. Don't share your PIN with anyone. This voucher can only be used on one device.
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-3 animate-in fade-in slide-in-from-bottom-14 duration-700 delay-600">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{days} {days === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-primary">₦{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-700">
            <Button 
              onClick={handleCopyBoth}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Code & PIN
            </Button>
            
            <Button 
              onClick={onBackToHome}
              size="lg"
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              Back to Home
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

export default ConfirmationScreen;