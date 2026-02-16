/**
 * Background Service Worker for TOTP Auto Copy Extension
 * Handles automatic TOTP code copying when navigating to configured URLs
 */

importScripts('totp.js');

// ============================================================================
// Configuration
// ============================================================================
const CONFIG = {
    DEBUG: false,                    // Set to false in production
    NOTIFICATION_TIMEOUT: 3000,      // Badge display duration (ms)
    MAX_RETRIES: 3,                  // Maximum clipboard copy attempts
    RETRY_DELAY: 1000,               // Delay between retry attempts (ms)
    DUPLICATE_CHECK_WINDOW: 5000,    // Window to prevent duplicate processing (ms)
    CLEANUP_INTERVAL: 60000,         // Memory cleanup interval (ms)
    MAX_RECENT_ENTRY_AGE: 30000,     // Max age for recent entries (ms)
    STORAGE_KEY: 'secrets'
};

// Keep track of recently processed tabs to avoid duplicate notifications
const recentlyProcessedTabs = new Map();

// ============================================================================
// URL Pattern Matching
// ============================================================================
/**
 * Enhanced URL matching with proper regex support
 * @param {string} tabUrl - Current tab URL
 * @param {string} pattern - URL pattern to match
 * @returns {boolean} True if URL matches pattern
 */
function matchesUrlPattern(tabUrl, pattern) {
    try {
        if (!tabUrl || !pattern) return false;

        let regexPattern = pattern
            .replaceAll(/[.+^${}()|[\]\\]/g, String.raw`\$&`)  // Escape special chars
            .replaceAll('*', '.*')                   // Convert * to .*
            .replaceAll('?', '.');                   // Convert ? to .

        // If pattern doesn't start with protocol, match it anywhere in the domain
        if (!pattern.includes('://')) {
            regexPattern = String.raw`(://|\.)?` + regexPattern;
        }

        const regex = new RegExp(regexPattern, 'i');
        return regex.test(tabUrl);
    } catch (error) {
        logDebug('Invalid URL pattern:', pattern, error);
        // Fallback to simple includes check for malformed regex
        return tabUrl.toLowerCase().includes(pattern.toLowerCase());
    }
}

// ============================================================================
// Storage Operations
// ============================================================================
/**
 * Get stored secrets with error handling
 * @returns {Promise<Array>} Array of stored secrets
 */
async function getStoredSecrets() {
    try {
        const result = await chrome.storage.sync.get(CONFIG.STORAGE_KEY);
        return result[CONFIG.STORAGE_KEY] || [];
    } catch (error) {
        logDebug('Failed to retrieve secrets:', error);
        return [];
    }
}

// ============================================================================
// Notifications and UI Updates
// ============================================================================
/**
 * Show notification badge on extension icon
 * @param {string} text - Badge text to display
 * @param {string} color - Badge background color
 */
function setBadge(text, color) {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
}

/**
 * Clear the extension icon badge
 */
function clearBadge() {
    chrome.action.setBadgeText({ text: '' });
}

/**
 * Show notification to user about auto-copy action
 * @param {string} serviceName - Name of the service
 * @param {boolean} success - Whether the operation succeeded
 */
function showNotification(serviceName, success = true) {
    if (success) {
        setBadge('✓', '#28A3AF');  // Liberty Teal
        logDebug(`TOTP auto-copied for ${serviceName}`);
    } else {
        setBadge('!', '#FF5722');  // Red
        logDebug(`Failed to auto-copy TOTP for ${serviceName}`);
    }

    // Clear the badge after a timeout
    setTimeout(clearBadge, CONFIG.NOTIFICATION_TIMEOUT);
}

// ============================================================================
// Clipboard Operations
// ============================================================================
/**
 * Copy TOTP to clipboard with retry logic
 * @param {number} tabId - Tab ID
 * @param {string} totp - TOTP code to copy
 * @param {string} serviceName - Service name for logging
 * @returns {Promise<boolean>} Success status
 */
async function copyTotpToClipboard(tabId, totp, serviceName) {
    let attempts = 0;

    while (attempts < CONFIG.MAX_RETRIES) {
        try {
            // Send message to content script to copy to clipboard
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'copyTotp',
                totp: totp
            });

            if (response && response.success) {
                showNotification(serviceName, true);
                return true;
            } else {
                throw new Error(response?.error || 'Unknown error from content script');
            }
        } catch (error) {
            attempts++;
            logDebug(`Clipboard copy attempt ${attempts} failed:`, error.message);

            if (attempts < CONFIG.MAX_RETRIES) {
                await new Promise(resolve =>
                    setTimeout(resolve, CONFIG.RETRY_DELAY)
                );
            }
        }
    }

    showNotification(serviceName, false);
    return false;
}

// ============================================================================
// Tab Processing
// ============================================================================
/**
 * Process tab update and auto-copy TOTP if applicable
 * @param {number} tabId - Tab ID
 * @param {string} tabUrl - Tab URL
 */
async function processTabUpdate(tabId, tabUrl) {
    try {
        // Check if we've recently processed this tab to avoid duplicates
        const recentKey = `${tabId}:${tabUrl}`;
        const lastProcessed = recentlyProcessedTabs.get(recentKey);
        const now = Date.now();

        if (lastProcessed && (now - lastProcessed) < CONFIG.DUPLICATE_CHECK_WINDOW) {
            return; // Skip if processed within recent window
        }

        const secrets = await getStoredSecrets();
        if (secrets.length === 0) {
            return;
        }

        // Find matching secret
        const matchingSecret = secrets.find(item =>
            item.url && matchesUrlPattern(tabUrl, item.url)
        );

        if (!matchingSecret) {
            return;
        }

        // Validate secret before generating TOTP
        if (!validateTotpSecret(matchingSecret.secret)) {
            logDebug(`Invalid TOTP secret for ${matchingSecret.name}`);
            showNotification(matchingSecret.name, false);
            return;
        }

        // Generate TOTP with custom digits and period
        const digits = matchingSecret.digits || 6;
        const period = matchingSecret.period || 30;
        const totp = await generateTOTP(matchingSecret.secret, period, digits);

        // Copy to clipboard
        const success = await copyTotpToClipboard(tabId, totp, matchingSecret.name);

        if (success) {
            // Mark as recently processed
            recentlyProcessedTabs.set(recentKey, now);

            // Send notification to content script for visual feedback
            try {
                await chrome.tabs.sendMessage(tabId, {
                    action: 'showNotification',
                    message: `TOTP copied for ${matchingSecret.name}`,
                    type: 'success'
                });
            } catch (error) {
                // Content script might not be ready, ignore
                logDebug('Could not send notification to content script:', error.message);
            }

            // Clean up old entries to prevent memory leaks
            cleanRecentlyProcessed();
        }
    } catch (error) {
        logDebug('Error processing tab update:', error.message);
    }
}

// ============================================================================
// Memory Management
// ============================================================================
/**
 * Clean up old entries from recently processed tabs
 */
function cleanRecentlyProcessed() {
    const now = Date.now();

    for (const [key, timestamp] of recentlyProcessedTabs.entries()) {
        if (now - timestamp > CONFIG.MAX_RECENT_ENTRY_AGE) {
            recentlyProcessedTabs.delete(key);
        }
    }
}

// ============================================================================
// Debugging Utilities
// ============================================================================
/**
 * Log debug messages if debugging is enabled
 */
function logDebug(...args) {
    if (CONFIG.DEBUG) {
        console.log('[TOTP Extension]', ...args);
    }
}

// ============================================================================
// Event Listeners
// ============================================================================
// Main event listeners - process tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only process when page is completely loaded
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        await processTabUpdate(tabId, tab.url);
    }
});

// Clean up on extension startup
chrome.runtime.onStartup.addListener(() => {
    recentlyProcessedTabs.clear();
    clearBadge();
    logDebug('Extension started');
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        clearBadge();
        logDebug('TOTP Auto Copy extension installed');
    }
});

// Periodic cleanup to prevent memory leaks
setInterval(cleanRecentlyProcessed, CONFIG.CLEANUP_INTERVAL);