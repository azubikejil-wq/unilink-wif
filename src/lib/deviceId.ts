// Fixed version: src/lib/deviceId.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

/**
 * Generate a simple fallback device ID without external dependencies
 */
function generateSimpleFallbackId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const nav = window.navigator;
  const screen = window.screen;
  
  // Create a simple hash from browser properties
  const browserString = `${nav.userAgent}|${nav.language}|${screen.width}x${screen.height}|${nav.platform}`;
  let hash = 0;
  for (let i = 0; i < browserString.length; i++) {
    const char = browserString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `DEV-FALLBACK-${Math.abs(hash).toString(36)}-${random}`.toUpperCase();
}

/**
 * Get or generate a unique device ID using browser fingerprinting
 * This ID persists across browser sessions and survives cache clearing
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Check localStorage first for faster access
    let deviceId = localStorage.getItem('unilink_device_id');
    
    if (deviceId) {
      console.log('✅ Using existing device ID:', deviceId);
      return deviceId;
    }

    console.log('🔄 Generating new device ID...');

    // Try to use FingerprintJS
    try {
      // Initialize FingerprintJS once (lazy loading)
      if (!fpPromise) {
        fpPromise = FingerprintJS.load();
      }

      // Get fingerprint with timeout
      const fp = await Promise.race([
        fpPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fingerprint timeout')), 5000)
        )
      ]) as any;
      
      const result = await fp.get();
      
      console.log('🔐 Fingerprint generated:', result.visitorId);
      
      // Create device ID from fingerprint (visitorId is 99.5% accurate)
      deviceId = `DEV-${result.visitorId}`;
      
      // Save to localStorage for faster access next time
      localStorage.setItem('unilink_device_id', deviceId);
      
      // Also save fingerprint components for verification/debugging
      localStorage.setItem('unilink_device_fingerprint', JSON.stringify({
        visitorId: result.visitorId,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      }));
      
      console.log('💾 Device ID saved:', deviceId);
      
      return deviceId;
    } catch (fpError) {
      console.warn('⚠️ FingerprintJS failed, using fallback:', fpError);
      throw fpError; // Fall through to fallback
    }
  } catch (error) {
    console.error('❌ Error generating device ID:', error);
    
    // Fallback to simple device ID if fingerprinting fails
    let fallbackId = localStorage.getItem('unilink_device_id_fallback');
    if (!fallbackId) {
      fallbackId = generateSimpleFallbackId();
      localStorage.setItem('unilink_device_id_fallback', fallbackId);
      // Also set as main device ID for consistency
      localStorage.setItem('unilink_device_id', fallbackId);
      console.log('🆕 Generated fallback device ID:', fallbackId);
    } else {
      console.log('✅ Using existing fallback device ID:', fallbackId);
    }
    return fallbackId;
  }
}

/**
 * Get stored device ID without generating new one
 * Returns null if no device ID exists
 */
export function getStoredDeviceId(): string | null {
  return localStorage.getItem('unilink_device_id') || localStorage.getItem('unilink_device_id_fallback');
}

/**
 * Clear device ID (useful for testing or logout)
 */
export function clearDeviceId(): void {
  localStorage.removeItem('unilink_device_id');
  localStorage.removeItem('unilink_device_fingerprint');
  localStorage.removeItem('unilink_device_id_fallback');
  console.log('🗑️ Device ID cleared');
}

/**
 * Get device fingerprint details for debugging
 */
export function getDeviceFingerprint(): any {
  const fingerprintData = localStorage.getItem('unilink_device_fingerprint');
  return fingerprintData ? JSON.parse(fingerprintData) : null;
}