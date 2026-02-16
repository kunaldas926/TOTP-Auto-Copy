/**
 * TOTP (Time-based One-Time Password) Generation Utility
 * Implements RFC 6238 algorithm for generating 6-digit TOTP codes
 */

// ============================================================================
// Configuration
// ============================================================================
const TOTP_CONFIG = {
    TIME_STEP: 30,      // 30 seconds time step
    DIGITS: 6,          // 6-digit codes
    ALGORITHM: 'SHA-1'
};

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// ============================================================================
// Base32 Decoding
// ============================================================================
/**
 * Decodes a Base32-encoded string to a Uint8Array
 * @param {string} base32 - Base32 encoded string
 * @returns {Uint8Array} Decoded bytes
 * @throws {Error} If invalid Base32 characters are found
 */
function base32Decode(base32) {
    let bits = '';
    base32 = base32.toUpperCase().replaceAll(/=+$/g, '');

    for (let i = 0; i < base32.length; i++) {
        const val = BASE32_ALPHABET.indexOf(base32.charAt(i));
        if (val === -1) {
            throw new Error(`Invalid Base32 character: ${base32.charAt(i)}`);
        }
        bits += val.toString(2).padStart(5, '0');
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2);
    }

    return bytes;
}

// ============================================================================
// TOTP Generation
// ============================================================================
/**
 * Validates if a secret key is in valid Base32 format
 * @param {string} secret - TOTP secret to validate
 * @returns {boolean} True if secret is valid
 */
function validateTotpSecret(secret) {
    if (!secret || typeof secret !== 'string') {
        return false;
    }

    const cleanSecret = secret.toUpperCase().replaceAll(/\s/g, '').replaceAll('=', '');

    // Check if all characters are valid Base32
    return /^[A-Z2-7]+$/.test(cleanSecret) && cleanSecret.length > 0;
}

/**
 * Generates a TOTP code from a Base32-encoded secret
 * @param {string} secret - Base32-encoded TOTP secret
 * @param {number} timeStep - Time step in seconds (default: 30)
 * @param {number} digits - Number of digits to return (default: 6)
 * @returns {Promise<string>} TOTP code as a zero-padded string
 * @throws {Error} If secret is invalid or generation fails
 */
async function generateTOTP(secret, timeStep = TOTP_CONFIG.TIME_STEP, digits = TOTP_CONFIG.DIGITS) {
    if (!validateTotpSecret(secret)) {
        throw new Error('Invalid TOTP secret format');
    }

    try {
        const key = base32Decode(secret.replaceAll(/\s/g, ''));
        const epoch = Math.floor(Date.now() / 1000);
        const counter = Math.floor(epoch / timeStep);

        // Create 8-byte counter in big-endian format
        const counterBuffer = new ArrayBuffer(8);
        const counterView = new DataView(counterBuffer);
        counterView.setUint32(4, counter, false); // Big-endian

        // Import key and generate HMAC-SHA1 signature
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: TOTP_CONFIG.ALGORITHM },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
        const signatureArray = new Uint8Array(signature);

        // Extract dynamic binary code using last 4 bits as offset
        const offset = signatureArray.at(-1) & 0x0F;
        const binary =
            ((signatureArray[offset] & 0x7F) << 24) |
            ((signatureArray[offset + 1] & 0xFF) << 16) |
            ((signatureArray[offset + 2] & 0xFF) << 8) |
            (signatureArray[offset + 3] & 0xFF);

        return (binary % (10 ** digits)).toString().padStart(digits, '0');
    } catch (error) {
        throw new Error(`Failed to generate TOTP: ${error.message}`);
    }
}

// ============================================================================
// Time Utilities
// ============================================================================
/**
 * Calculates the number of seconds remaining until next TOTP rotation
 * @param {number} timeStep - Time step in seconds (default: 30)
 * @returns {number} Seconds remaining in current time step
 */
function getTimeRemaining(timeStep = TOTP_CONFIG.TIME_STEP) {
    const epoch = Math.floor(Date.now() / 1000);
    return timeStep - (epoch % timeStep);
}
