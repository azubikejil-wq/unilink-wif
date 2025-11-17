// src/pages/PaymentCallback.tsx - SECURE VERSION
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const hasVerified = useRef(false);

  const handleCopyCode = async () => {
    if (!voucherData?.voucherCode) return;

    try {
      await navigator.clipboard.writeText(voucherData.voucherCode);
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

  useEffect(() => {
    // Prevent duplicate verification
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        // Get transaction details from URL params
        const transactionId = searchParams.get('transaction_id');
        const txRef = searchParams.get('tx_ref');
        const urlStatus = searchParams.get('status');

        if (import.meta.env.DEV) {
          console.log('Payment callback params:', { transactionId, txRef, urlStatus });
        }

        // Validate required parameters
        if (!transactionId) {
          setStatus('failed');
          toast({
            title: "Invalid Payment",
            description: "Missing transaction information",
            variant: "destructive",
          });
          return;
        }

        // Quick fail for cancelled payments
        if (urlStatus === 'cancelled') {
          setStatus('failed');
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment",
            variant: "destructive",
          });
          return;
        }

        // Call server-side verification (which also creates voucher)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ 
              transaction_id: transactionId 
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (import.meta.env.DEV) {
          console.log('Verification result:', result);
        }

        // Check if payment was successful
        if (result.status === 'success' && result.voucher) {
          const voucher = result.voucher;
          
          // Set success state with voucher data
          setVoucherData({
            voucherCode: voucher.voucher_code,
            days: voucher.duration_days,
            amount: voucher.amount,
            customerName: voucher.customer_name,
            customerPhone: voucher.phone,
            alreadyExisted: result.data?.already_exists || false,
          });
          
          setStatus('success');

          toast({
            title: "Payment Successful!",
            description: voucher.already_exists 
              ? "Your voucher is ready (already generated)"
              : "Your voucher has been generated",
          });

        } else {
          // Payment verification failed
          setStatus('failed');
          toast({
            title: "Payment Verification Failed",
            description: result.message || "Unable to verify payment",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <XCircle className="h-24 w-24 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Payment Failed</h2>
            <p className="text-muted-foreground">
              We couldn't verify your payment. If money was deducted, please contact support with your transaction reference.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full" size="lg">
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/voucher-history')} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              Check My Vouchers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show voucher
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2 className="h-24 w-24 text-primary relative z-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground">Your WiFi voucher is ready to use</p>
        </div>

        {/* Voucher Code */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 space-y-4">
          <p className="text-sm text-muted-foreground text-center font-semibold">Your Voucher Code</p>
          <p className="font-mono text-5xl font-bold text-primary text-center tracking-[0.5em]">
            {voucherData?.voucherCode}
          </p>
          <Button
            onClick={handleCopyCode}
            variant="outline"
            size="lg"
            className="w-full h-12 border-primary/30 hover:bg-primary/10"
            disabled={copiedCode}
          >
            {copiedCode ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Copy Voucher Code
              </>
            )}
          </Button>
        </div>

        {/* How to Connect */}
        <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="space-y-3">
            <p className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span className="text-xl">📱</span> How to Connect:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <li>Connect to <strong>UniLink WiFi</strong></li>
              <li>Login page will open automatically</li>
              <li>Enter voucher code: <strong className="font-mono">{voucherData?.voucherCode}</strong></li>
              <li>Click Connect and enjoy!</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                🔒 <strong>Auto-Protection:</strong> This voucher will automatically lock to your device on first connection. No one else can use it!
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valid For</span>
            <span className="font-semibold">{voucherData?.days} {voucherData?.days === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-semibold text-primary">₦{voucherData?.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Device Lock</span>
            <span className="font-semibold text-green-600">Enabled ✓</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Timer Starts</span>
            <span className="font-semibold">On First Connection</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/voucher-history')} 
            size="lg" 
            className="w-full h-12"
          >
            View My Vouchers
          </Button>
          
          <Button 
            onClick={() => navigate('/')} 
            size="lg" 
            variant="outline" 
            className="w-full h-12"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;