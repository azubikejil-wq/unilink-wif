// src/lib/supabase.ts - UPDATED VERSION
import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file'
  );
}

// Create and export Supabase client
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
  purchase_device_id?: string | null;
  created_at?: string;
  expires_at?: string | null;
  actual_expiry_at?: string | null;
  first_connection_at?: string | null;
  status?: 'active' | 'expired' | 'used' | 'blocked';
  is_used?: boolean;
  bound_mac_address?: string | null;
  bound_ip_address?: string | null;
  first_used_at?: string | null;
  last_used_at?: string | null;
  usage_attempts?: number;
  session_count?: number;
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