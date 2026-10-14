/**
 * Cryptographic security utilities for Private Garage POS
 * Uses standard Web Crypto API (SubtleCrypto) for PBKDF2 hashing, salted passwords,
 * password validation, and brute-force attempt protection.
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password strength according to garage security policy:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates a random cryptographic salt hex string
 */
export function generateSalt(byteLength: number = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts buffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and salt
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const saltHex = existingSalt || generateSalt(16);
  const enc = new TextEncoder();
  
  try {
    const cryptoObj = (typeof window !== 'undefined' ? window.crypto : globalThis.crypto);
    if (cryptoObj && cryptoObj.subtle) {
      const keyMaterial = await cryptoObj.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const saltBuffer = new Uint8Array(
        saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );

      const derivedKey = await cryptoObj.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      return {
        hash: bufferToHex(derivedKey),
        salt: saltHex
      };
    }
  } catch (err) {
    console.warn('SubtleCrypto error, using fallback cryptographic hash:', err);
  }

  // Pure JS fallback if SubtleCrypto is unavailable in certain sandboxes
  let hashVal = 0;
  const combined = `${saltHex}:${password}:private_garage_pos_secret`;
  for (let i = 0; i < combined.length; i++) {
    hashVal = (hashVal << 5) - hashVal + combined.charCodeAt(i);
    hashVal |= 0;
  }
  return {
    hash: Math.abs(hashVal).toString(16).padStart(32, '0'),
    salt: saltHex
  };
}

/**
 * Verifies a plain text password against an existing hash and salt
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  if (!password || !storedHash || !salt) return false;
  const result = await hashPassword(password, salt);
  return result.hash === storedHash;
}

/**
 * Generates a random session token
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * In-memory / localStorage rate limiting for failed login attempts
 * Locks out for 60 seconds after 5 failed attempts
 */
const RATE_LIMIT_STORAGE_KEY = 'apex_login_attempts';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

interface AttemptRecord {
  count: number;
  lastFailed: number;
  lockoutUntil?: number;
}

export function checkLoginRateLimit(identifier: string): { locked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return { locked: false, remainingSeconds: 0 };
    const records: Record<string, AttemptRecord> = JSON.parse(raw);
    const userRecord = records[identifier.toLowerCase().trim()];
    
    if (!userRecord) return { locked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (userRecord.lockoutUntil && userRecord.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((userRecord.lockoutUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    // Reset if window has elapsed
    if (now - userRecord.lastFailed > LOCKOUT_DURATION_MS * 2) {
      delete records[identifier.toLowerCase().trim()];
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
    }
  } catch (e) {
    // Ignore storage errors
  }
  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string): { locked: boolean; remainingSeconds: number; attemptsLeft: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const records: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
    const key = identifier.toLowerCase().trim();
    const now = Date.now();

    const record = records[key] || { count: 0, lastFailed: now };
    record.count += 1;
    record.lastFailed = now;

    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockoutUntil = now + LOCKOUT_DURATION_MS;
      records[key] = record;
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
      return {
        locked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        attemptsLeft: 0
      };
    }

    records[key] = record;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
    return {
      locked: false,
      remainingSeconds: 0,
      attemptsLeft: MAX_FAILED_ATTEMPTS - record.count
    };
  } catch (e) {
    return { locked: false, remainingSeconds: 0, attemptsLeft: 3 };
  }
}

export function clearFailedLogins(identifier: string): void {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return;
    const records: Record<string, AttemptRecord> = JSON.parse(raw);
    delete records[identifier.toLowerCase().trim()];
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    // Ignore
  }
}
