import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://sfhajdcuhhoaxtluohba.supabase.co '; // e.g., https://xxxxx.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmaGFqZGN1aGhvYXh0bHVvaGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQ5MDQsImV4cCI6MjA3NzQ0MDkwNH0.R24eALOYv7BztKSPVYBohpFe8gVaN1pSCUGFD9rdS0w'; // Long string starting with eyJ...

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript types for your database tables
export interface Transaction {
  id?: string;
  voucher_code: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  duration_days: number;
  amount: number;
  transaction_ref?: string | null;
  security_pin: string;
  device_fingerprint?: string | null;
  created_at?: string;
  expires_at?: string | null;
  status?: 'active' | 'expired' | 'used' | 'blocked';
  is_used?: boolean;
  bound_mac_address?: string | null;
  bound_ip_address?: string | null;
  first_used_at?: string | null;
  last_used_at?: string | null;
  usage_attempts?: number;
}

export interface VoucherUsageLog {
  id?: string;
  voucher_code: string;
  mac_address: string;
  ip_address?: string | null;
  device_fingerprint?: string | null;
  attempt_time?: string;
  success?: boolean;
  failure_reason?: string | null;
}

export interface SecurityAlert {
  id?: string;
  voucher_code: string;
  alert_type: 'unauthorized_access' | 'multiple_devices' | 'pin_mismatch' | 'expired';
  description?: string | null;
  created_at?: string;
}