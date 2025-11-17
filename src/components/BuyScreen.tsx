// src/pages/BuyScreen.tsx - SECURE VERSION
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wifi, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDeviceId } from "@/lib/deviceId";

interface BuyScreenProps {
  onBack: () => void;
}

const BuyScreen = ({ onBack }: BuyScreenProps) => {
  const [days, setDays] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const { toast } = useToast();

  const pricePerDay = 500;
  const total = days * pricePerDay;

  // Input sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>'"]/g, '') // Remove potential XSS characters
      .substring(0, 100); // Limit length
  };

  const handleBuy = async () => {
    // Rate limiting - prevent spam clicks
    const now = Date.now();
    if (now - lastAttempt < 3000) {
      toast({
        title: "Please Wait",
        description: "Please wait a moment before trying again",
        variant: "destructive",
      });
      return;
    }
    setLastAttempt(now);

    // Validate inputs
    if (!phone.trim() || !name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and phone number",
        variant: "destructive",
      });
      return;
    }

    if (days < 1 || days > 365) {
      toast({
        title: "Invalid Duration",
        description: "Please select between 1 and 365 days",
        variant: "destructive",
      });
      return;
    }

    // Email validation (only if provided)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address or leave it empty",
          variant: "destructive",
        });
        return;
      }
    }

    // Phone validation (Nigerian format)
    const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Nigerian phone number (e.g., 08012345678)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get device ID
      const deviceId = await getDeviceId();
      
      // Sanitize inputs
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = email.trim() ? sanitizeInput(email) : '';
      const sanitizedPhone = cleanPhone;

      if (import.meta.env.DEV) {
        console.log("Starting payment process...", {
          name: sanitizedName,
          phone: sanitizedPhone,
          days,
          amount: total,
          deviceId,
        });
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: sanitizedName,
            email: sanitizedEmail || null,
            phone: sanitizedPhone,
            amount: total,
            days,
            device_id: deviceId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data?.link) {
        // Redirect to Flutterwave
        window.location.href = data.data.link;
      } else {
        console.error("Payment error:", data);
        toast({
          title: "Error Starting Payment",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to payment server. Please check your connection.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 rounded-full"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">UniLink</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-foreground">Select Duration</h2>
            <p className="text-muted-foreground">
              ₦{pricePerDay.toLocaleString()} per day. Choose how many days you want.
            </p>
          </div>

          {/* Customer Information */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-50">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                disabled={isProcessing}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
                disabled={isProcessing}
                required
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">Format: 080XXXXXXXX or +234XXXXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={isProcessing}
                maxLength={100}
              />
            </div>
          </div>

          {/* Days Input */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-75">
            <div className="space-y-2">
              <Label htmlFor="days" className="text-base font-semibold">
                Number of Days
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="days"
                  type="number"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setDays(Math.max(1, Math.min(365, value)));
                  }}
                  className="pl-11 h-14 text-lg"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Quick Select */}
            <div className="flex gap-2">
              {[1, 3, 7, 30].map((d) => (
                <Button
                  key={d}
                  variant={days === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(d)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {d} {d === 1 ? 'day' : 'days'}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-500 delay-150">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{days} {days === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per day</span>
              <span className="font-semibold text-foreground">₦{pricePerDay.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">Total</span>
                </div>
                <span className="font-bold text-2xl text-primary">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <div className="animate-in fade-in slide-in-from-bottom-16 duration-500 delay-200 pb-6">
            <Button 
              onClick={handleBuy}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ₦${total.toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyScreen;