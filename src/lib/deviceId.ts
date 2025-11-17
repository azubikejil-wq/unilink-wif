// Production-ready device ID: src/lib/deviceId.ts

/**
 * Generate a unique device fingerprint based on browser properties
 * This creates a consistent ID for the same device
 */
function generateDeviceFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;
  
  // Collect browser fingerprint data
  const components = [
    nav.userAgent,
    nav.language,
    nav.platform,
    nav.hardwareConcurrency?.toString() || '',
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    // Add canvas fingerprint
    getCanvasFingerprint(),
  ];
  
  // Create hash from components
  const fingerprint = hashString(components.join('|'));
  return fingerprint;
}

/**
 * Generate canvas fingerprint for better uniqueness
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('UniLink Device ID', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('UniLink Device ID', 4, 17);
    
    // Get data URL and hash it
    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl).substring(0, 16);
  } catch (e) {
    console.warn('Canvas fingerprint failed:', e);
    return 'no-canvas';
  }
}

/**
 * Simple hash function to create consistent device ID
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  const positiveHash = Math.abs(hash).toString(16);
  
  // Pad with timestamp for extra uniqueness
  const timestamp = Date.now().toString(36);
  
  return (positiveHash + timestamp).substring(0, 32);
}

/**
 * Try to store device ID in multiple places for reliability
 */
function storeDeviceId(deviceId: string): void {
  const timestamp = new Date().toISOString();
  
  // Try localStorage
  try {
    localStorage.setItem('unilink_device_id', deviceId);
    localStorage.setItem('unilink_device_created', timestamp);
    console.log('✅ Saved to localStorage');
  } catch (e) {
    console.warn('⚠️ localStorage failed:', e);
  }
  
  // Try sessionStorage as backup
  try {
    sessionStorage.setItem('unilink_device_id', deviceId);
    sessionStorage.setItem('unilink_device_created', timestamp);
    console.log('✅ Saved to sessionStorage');
  } catch (e) {
    console.warn('⚠️ sessionStorage failed:', e);
  }
  
  // Store in cookie as last resort
  try {
    document.cookie = `unilink_device_id=${deviceId}; max-age=31536000; path=/; SameSite=Lax`;
    console.log('✅ Saved to cookie');
  } catch (e) {
    console.warn('⚠️ Cookie failed:', e);
  }
}

/**
 * Try to retrieve device ID from multiple sources
 */
function retrieveDeviceId(): string | null {
  // Try localStorage first
  try {
    const stored = localStorage.getItem('unilink_device_id');
    if (stored) {
      console.log('📦 Found in localStorage:', stored);
      return stored;
    }
  } catch (e) {
    console.warn('⚠️ localStorage read failed:', e);
  }
  
  // Try sessionStorage
  try {
    const stored = sessionStorage.getItem('unilink_device_id');
    if (stored) {
      console.log('📦 Found in sessionStorage:', stored);
      return stored;
    }
  } catch (e) {
    console.warn('⚠️ sessionStorage read failed:', e);
  }
  
  // Try cookie
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'unilink_device_id') {
        console.log('📦 Found in cookie:', value);
        return value;
      }
    }
  } catch (e) {
    console.warn('⚠️ Cookie read failed:', e);
  }
  
  return null;
}

/**
 * Get or generate a unique device ID
 * This ID persists across browser sessions via multiple storage methods
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to retrieve from storage
    const stored = retrieveDeviceId();
    if (stored) {
      console.log('✅ Using existing device ID:', stored);
      return stored;
    }

    console.log('🔄 Generating new device ID...');
    
    // Generate fingerprint-based device ID
    const fingerprint = generateDeviceFingerprint();
    const deviceId = `DEV-${fingerprint}`;
    
    // Save to all available storage
    storeDeviceId(deviceId);
    
    console.log('💾 Device ID created and saved:', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('❌ Error with device ID:', error);
    
    // Fallback: generate random ID if everything fails
    const fallbackId = `DEV-FALLBACK-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    try {
      storeDeviceId(fallbackId);
    } catch (storageError) {
      console.warn('⚠️ All storage methods failed:', storageError);
    }
    
    console.log('🆘 Using fallback device ID:', fallbackId);
    return fallbackId;
  }
}

/**
 * Get stored device ID without generating new one
 * Returns null if no device ID exists
 */
export function getStoredDeviceId(): string | null {
  return retrieveDeviceId();
}

/**
 * Clear device ID (useful for testing or logout)
 */
export function clearDeviceId(): void {
  // Clear from localStorage
  try {
    localStorage.removeItem('unilink_device_id');
    localStorage.removeItem('unilink_device_created');
    localStorage.removeItem('unilink_device_id_fallback');
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
  
  // Clear from sessionStorage
  try {
    sessionStorage.removeItem('unilink_device_id');
    sessionStorage.removeItem('unilink_device_created');
  } catch (e) {
    console.warn('Could not clear sessionStorage:', e);
  }
  
  // Clear cookie
  try {
    document.cookie = 'unilink_device_id=; max-age=0; path=/';
  } catch (e) {
    console.warn('Could not clear cookie:', e);
  }
  
  console.log('🗑️ Device ID cleared from all storage');
}

/**
 * Get device fingerprint details for debugging
 */
export function getDeviceInfo(): any {
  const nav = window.navigator;
  const screen = window.screen;
  
  return {
    deviceId: getStoredDeviceId(),
    userAgent: nav.userAgent,
    language: nav.language,
    platform: nav.platform,
    hardwareConcurrency: nav.hardwareConcurrency,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: new Date().getTimezoneOffset(),
    created: localStorage.getItem('unilink_device_created'),
  };
}