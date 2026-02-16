/**
 * Content Script for TOTP Auto Copy Extension
 * Receives messages from background script and handles clipboard operations
 */

// ============================================================================
// Configuration
// ============================================================================
const CONTENT_SCRIPT_CONFIG = {
    DEBUG: false,
    NOTIFICATION_TIMEOUT: 2000
};

// ============================================================================
// Message Handler
// ============================================================================
/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request?.action) {
        return false;
    }

    switch (request.action) {
        case 'copyTotp':
            handleCopyTotp(request.totp, sendResponse);
            break;
        case 'showNotification':
            handleShowNotification(request.message, sendResponse, request.type);
            break;
        default:
            logDebug('Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
    }

    return true; // Keep channel open for async responses
});

// ============================================================================
// TOTP Copy Handler
// ============================================================================
/**
 * Handle copying TOTP to clipboard
 * @param {string} totp - TOTP code to copy
 * @param {Function} sendResponse - Callback to send response
 */
async function handleCopyTotp(totp, sendResponse) {
    if (!totp) {
        sendResponse({ success: false, error: 'No TOTP code provided' });
        return;
    }

    try {
        await navigator.clipboard.writeText(totp);
        logDebug('TOTP copied to clipboard');
        sendResponse({ success: true });
    } catch (error) {
        logDebug('Failed to copy TOTP:', error.message);
        sendResponse({ success: false, error: error.message });
    }
}

// ============================================================================
// Notification Handler
// ============================================================================
/**
 * Handle showing visual notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info)
 */
function handleShowNotification(message, sendResponse, type = 'info') {
    try {
        createNotificationElement(message, type);
        if (sendResponse) {
            sendResponse({ success: true });
        }
    } catch (error) {
        logDebug('Failed to show notification:', error.message);
        if (sendResponse) {
            sendResponse({ success: false, error: error.message });
        }
    }
}

/**
 * Create and display notification element
 * @param {string} message - Message to display
 * @param {string} type - Notification type
 */
function createNotificationElement(message, type) {
    // Remove any existing notification
    const existing = document.getElementById('totp-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'totp-notification';
    notification.className = `totp-notification totp-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${getBackgroundColorForType(type)};
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        animation: totp-slide-in 0.3s ease-out;
    `;

    // Add animation styles if not already present
    if (!document.getElementById('totp-styles')) {
        const style = document.createElement('style');
        style.id = 'totp-styles';
        style.textContent = `
            @keyframes totp-slide-in {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes totp-slide-out {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after timeout
    setTimeout(() => {
        notification.style.animation = 'totp-slide-out 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, CONTENT_SCRIPT_CONFIG.NOTIFICATION_TIMEOUT);
}

/**
 * Get background color for notification type
 * @param {string} type - Notification type
 * @returns {string} CSS color value
 */
function getBackgroundColorForType(type) {
    switch (type) {
        case 'success':
            return '#28A3AF'; // Liberty Teal
        case 'error':
            return '#FF5722'; // Red
        case 'info':
        default:
            return '#1A1446'; // Liberty Blue
    }
}

// ============================================================================
// Debugging Utilities
// ============================================================================
/**
 * Log debug messages if debugging is enabled
 */
function logDebug(...args) {
    if (CONTENT_SCRIPT_CONFIG.DEBUG) {
        console.log('[TOTP Content Script]', ...args);
    }
}
