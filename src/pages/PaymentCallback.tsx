// Create this file: src/pages/PaymentCallback.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const hasVerified = useRef(false); // Prevent duplicate verification

  const generateVoucherCode = () => {
    // Generate exactly 8 character code: 3 letters + 5 numbers
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I, O for clarity
    const numbers = '0123456789';
    
    let code = '';
    // 3 random letters
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 5 random numbers
    for (let i = 0; i < 5; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  };

  const getDeviceFingerprint = () => {
    const nav = window.navigator;
    const screen = window.screen;
    const fingerprint = {
      userAgent: nav.userAgent,
      language: nav.language,
      platform: nav.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(fingerprint));
  };

  const handleCopyCode = async () => {
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
    const verifyPayment = async () => {
      try {
        // Get transaction details from URL params
        const transactionId = searchParams.get('transaction_id');
        const txRef = searchParams.get('tx_ref');
        const status = searchParams.get('status');

        console.log('Payment callback params:', { transactionId, txRef, status });

        if (!transactionId || !txRef) {
          setStatus('failed');
          toast({
            title: "Invalid Payment",
            description: "Missing payment information",
            variant: "destructive",
          });
          return;
        }

        // Call edge function to verify payment with Flutterwave
        const response = await fetch(
          `https://sfhajdcuhhoaxtluohba.supabase.co/functions/v1/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmaGFqZGN1aGhvYXh0bHVvaGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQ5MDQsImV4cCI6MjA3NzQ0MDkwNH0.R24eALOYv7BztKSPVYBohpFe8gVaN1pSCUGFD9rdS0w`,
            },
            body: JSON.stringify({ transaction_id: transactionId }),
          }
        );

        const result = await response.json();
        console.log('Verification result:', result);

        if (result.status === 'success' && result.data?.status === 'successful') {
          // Payment verified successfully
          const paymentData = result.data;
          
          // Get device ID
          const deviceId = await getDeviceId();
          console.log('💾 Saving voucher with device ID:', deviceId);

          // Check if voucher already exists for this transaction
          const { data: existingVoucher, error: checkError } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_ref', transactionId)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine
            console.error('❌ Error checking existing voucher:', checkError);
            throw new Error('Failed to check existing voucher');
          }

          let savedVoucher;

          if (existingVoucher) {
            console.log('✅ Voucher already exists for this transaction:', existingVoucher);
            savedVoucher = existingVoucher;
          } else {
            // Generate voucher code (same as password for simplicity)
            const voucherCode = generateVoucherCode();
            const deviceFingerprint = getDeviceFingerprint();

            // Extract customer info from payment metadata or customer object
            const customerName = paymentData.customer?.name || paymentData.meta?.name || 'Customer';
            const customerPhone = paymentData.customer?.phone_number || paymentData.meta?.phone || '';
            const customerEmail = paymentData.customer?.email || null;
            const days = parseInt(paymentData.meta?.days || '1');
            const amount = parseFloat(paymentData.amount);

            // Save to Supabase
            const createdAt = new Date().toISOString();
            const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

            // Insert new voucher
            const { data, error } = await supabase.from('transactions').insert({
              voucher_code: voucherCode,
              customer_name: customerName,
              phone: customerPhone,
              email: customerEmail,
              duration_days: days,
              amount: amount,
              transaction_ref: transactionId,
              security_pin: voucherCode, // Use same code as password
              device_fingerprint: deviceFingerprint,
              purchase_device_id: deviceId,
              created_at: createdAt,
              expires_at: expiresAt,
              status: 'active',
              is_used: false,
              usage_attempts: 0,
            }).select().single();

            if (error) {
              console.error('❌ Supabase error:', error);
              throw new Error('Failed to save voucher');
            }

            console.log('✅ Voucher saved successfully:', data);
            savedVoucher = data;
          }

          // Set success state with voucher data
          setVoucherData({
            voucherCode: savedVoucher.voucher_code,
            days: savedVoucher.duration_days,
            amount: savedVoucher.amount,
            customerName: savedVoucher.customer_name,
            customerPhone: savedVoucher.phone,
          });
          setStatus('success');

          toast({
            title: "Payment Successful!",
            description: "Your voucher has been generated",
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
              We couldn't verify your payment. If money was deducted, please contact support.
            </p>
          </div>
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
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
          <p className="text-muted-foreground">Your WiFi voucher is ready</p>
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
              <li>Enter your voucher code: <strong className="font-mono">{voucherData?.voucherCode}</strong></li>
              <li>Click Connect and enjoy!</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                🔒 <strong>Auto-Protection:</strong> This voucher will automatically lock to your device when you first connect. No one else can use it, even with the code!
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
        </div>

        <Button onClick={() => navigate('/')} size="lg" variant="outline" className="w-full h-12">
          Back to Home
        </Button>
        
        <Button onClick={() => navigate('/voucher-history')} size="lg" className="w-full h-12">
          View My Vouchers
        </Button>
      </div>
    </div>
  );
};

export default PaymentCallback;