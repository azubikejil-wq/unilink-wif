// Create this file: src/lib/deviceId.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

/**
 * Get or generate a unique device ID using browser fingerprinting
 * This ID persists across browser sessions and survives cache clearing
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Check localStorage first for faster access
    let deviceId = localStorage.getItem('unilink_device_id');
    
    if (deviceId) {
      console.log('Using existing device ID:', deviceId);
      return deviceId;
    }

    console.log('Generating new device ID...');

    // Initialize FingerprintJS once (lazy loading)
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }

    // Get fingerprint
    const fp = await fpPromise;
    const result = await fp.get();
    
    console.log('Fingerprint generated:', result.visitorId);
    
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
    
    console.log('Device ID saved:', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    
    // Fallback to simple random ID if fingerprinting fails
    let fallbackId = localStorage.getItem('unilink_device_id_fallback');
    if (!fallbackId) {
      fallbackId = `DEV-FALLBACK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      localStorage.setItem('unilink_device_id_fallback', fallbackId);
      console.log('Using fallback device ID:', fallbackId);
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
  console.log('Device ID cleared');
}

/**
 * Get device fingerprint details for debugging
 */
export function getDeviceFingerprint(): any {
  const fingerprintData = localStorage.getItem('unilink_device_fingerprint');
  return fingerprintData ? JSON.parse(fingerprintData) : null;
}