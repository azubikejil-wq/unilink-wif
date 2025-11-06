// Create: src/pages/VoucherHistory.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wifi, Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";

interface Voucher {
  id: string;
  voucher_code: string;
  duration_days: number;
  amount: number;
  created_at: string;
  expires_at: string | null;
  actual_expiry_at: string | null;
  first_connection_at: string | null;
  status: 'active' | 'expired' | 'used';
  customer_name: string;
  is_used: boolean;
}

const VoucherHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      
      // Get device ID
      const id = await getDeviceId();
      setDeviceId(id);
      console.log('🔍 Loading vouchers for device:', id);

      // Fetch all vouchers for this device
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('purchase_device_id', id)
        .order('created_at', { ascending: false });

      console.log('📊 Query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching vouchers:', error);
        toast({
          title: "Error Loading History",
          description: "Could not load your voucher history. Check console for details.",
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ Found ${data?.length || 0} vouchers`);
      setVouchers(data || []);

      // Show debug info if no vouchers found
      if (!data || data.length === 0) {
        console.log('ℹ️ No vouchers found for this device ID');
        console.log('💡 Check Supabase Table Editor to verify:');
        console.log('   1. Vouchers exist in transactions table');
        console.log('   2. purchase_device_id column has values');
        console.log('   3. purchase_device_id matches:', id);
      }
    } catch (error) {
      console.error('💥 Load error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Expired
        </span>
      );
    }
    
    if (voucher.is_used && voucher.actual_expiry_at) {
      const now = new Date();
      const expiry = new Date(voucher.actual_expiry_at);
      
      if (now > expiry) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Expired
          </span>
        );
      }
      
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3" />
        Not Used
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (voucher: Voucher) => {
    if (!voucher.actual_expiry_at) return null;
    
    const now = new Date();
    const expiry = new Date(voucher.actual_expiry_at);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 flex items-center gap-4 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            console.log('Back button clicked, navigating back');
            navigate(-1);
          }}
          className="h-10 w-10 rounded-full hover:bg-secondary cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Voucher History</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Vouchers Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't purchased any vouchers yet.
              </p>
              <Button onClick={() => navigate('/')}>
                Buy Your First Voucher
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Showing {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
              </p>
              
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-2xl font-bold text-primary">
                          {voucher.voucher_code}
                        </span>
                        {getStatusBadge(voucher)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Purchased: {formatDate(voucher.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₦{voucher.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {voucher.duration_days} {voucher.duration_days === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer</p>
                      <p className="text-sm font-semibold">{voucher.customer_name}</p>
                    </div>
                    
                    {voucher.first_connection_at && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">First Used</p>
                        <p className="text-sm font-semibold">
                          {formatDate(voucher.first_connection_at)}
                        </p>
                      </div>
                    )}

                    {voucher.actual_expiry_at && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Expires</p>
                          <p className="text-sm font-semibold">
                            {formatDate(voucher.actual_expiry_at)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Time Left</p>
                          <p className="text-sm font-semibold">
                            {getTimeRemaining(voucher)}
                          </p>
                        </div>
                      </>
                    )}

                    {!voucher.is_used && (
                      <div className="col-span-2">
                        <p className="text-xs text-amber-600 font-semibold">
                          ⏳ Timer will start when you first connect
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoucherHistory;