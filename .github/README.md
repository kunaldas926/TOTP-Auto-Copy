# 🔐 TOTP Auto Copy - Browser Extension

A secure and convenient browser extension for Microsoft Edge (and Chromium-based browsers) that automatically copies Time-Based One-Time Passwords (TOTP) to your clipboard when you visit configured websites.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Getting Your TOTP Secret](#getting-your-totp-secret)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Technical Details](#technical-details)

---

## ✨ Features

- **Automatic TOTP Copy**: Automatically copies TOTP codes to clipboard when you visit configured URLs
- **Manual Copy Option**: Click the copy icon (📋) to manually copy any TOTP code
- **Live TOTP Display**: View current TOTP codes with real-time updates
- **Previous/Next TOTP Codes**: Always-visible adjacent TOTP codes displayed as text on the right side of each account name for easy reference
- **Visual Timer**: Animated circular countdown indicator with color coding:
  - 🟢 **Green**: More than 15 seconds remaining
  - 🟡 **Yellow**: 6-15 seconds remaining
  - 🔴 **Red**: 5 seconds or less remaining
- **Multiple Accounts**: Manage TOTP secrets for unlimited websites/services
- **Clean UI**: Modern, intuitive interface with collapsible forms
- **Secure Storage**: All secrets stored locally using Chrome's secure storage API

---

## 📥 Installation

### Method 1: Load Unpacked Extension (Development Mode)

1. **Download the Extension**
   - Download or clone this repository to your local machine
   - Extract the files to a folder (e.g., `C:\TOTP-Extension`)

2. **Open Edge Extensions Page**
   - Open Microsoft Edge browser
   - Navigate to `edge://extensions/` or click Menu (⋯) → Extensions

3. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the bottom-left corner

4. **Load the Extension**
   - Click **Load unpacked**
   - Browse to the folder containing the extension files
   - Select the folder and click **Select Folder**

5. **Verify Installation**
   - You should see "TOTP Auto Copy" in your extensions list
   - The extension icon should appear in your browser toolbar

### Method 2: Install from Edge Add-ons Store (Coming Soon)

*This extension will be published to the Microsoft Edge Add-ons store in the future.*

---

## 🚀 How to Use

### Adding Your First TOTP Secret

1. **Open the Extension**
   - Click the TOTP Manager icon in your browser toolbar
   - You'll see the main popup window

2. **Click the + Icon**
   - Click the yellow **+** icon in the top-right corner
   - The add secret form will expand

3. **Fill in the Details**

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Name** | A friendly name for this account | `GitHub`, `Google`, `AWS` |
   | **URL Pattern** | Part of the website URL to trigger auto-copy | `github.com`, `accounts.google.com` |
   | **TOTP Secret** | Your TOTP secret key (base32 encoded) | `JBSWY3DPEHPK3PXP` |

4. **Save the Secret**
   - Click the **Add** button
   - The form will close and your new secret will appear in the list

### Using TOTP Codes

#### View Adjacent Codes
- Each account displays three TOTP codes:
  - **Left (Previous)**: The code that was valid in the previous 30-second period
  - **Middle (Current)**: The code currently displayed with live countdown timer
  - **Right (Next)**: The code that will be valid in the next 30-second period
- This allows you to see upcoming codes for accounts with delays

#### Automatic Copy (Recommended)
- Simply navigate to a website that matches your configured URL pattern
- The extension will automatically generate and copy the TOTP code to your clipboard
- Paste the code (Ctrl+V) into the authentication field

#### Manual Copy
1. Open the extension popup
2. Find the account you need
3. Click the **📋 Copy** icon next to the current TOTP code
4. The icon will change to **✓** briefly to confirm
5. Paste the code where needed

### Managing Secrets

#### View TOTP Codes
- All your configured accounts are displayed in the popup
- TOTP codes update automatically every 30 seconds
- The circular timer shows how much time remains for the current code

#### Delete a Secret

Method 1: Delete from Edit Form (Recommended)
1. Find the account you want to delete
2. Click anywhere on the TOTP display area (the gray background) or click the account name
3. An edit icon (✏️) will appear
4. Click the edit icon to open the edit form
5. Click the **Delete** button (red) at the bottom of the form
6. Confirm the deletion in the popup dialog

---

## 🔑 Getting Your TOTP Secret

### Where to Find Your TOTP Secret

When setting up 2FA on most websites, you'll see a QR code. Look for options like:
- "Can't scan QR code?"
- "Manual entry"
- "Enter key manually"
- "Show secret key"

Click these options to reveal your TOTP secret key (usually a long base32-encoded string).

### Example Services and Setup

#### GitHub
1. Go to Settings → Security → Two-factor authentication
2. Click "Set up using an app"
3. Click "enter this text code" to reveal the secret
4. Copy the secret key (e.g., `abcd efgh ijkl mnop`)
5. Use URL pattern: `github.com`

#### Google
1. Go to Account → Security → 2-Step Verification
2. Select "Authenticator app"
3. Click "Can't scan it?"
4. Copy the secret key shown
5. Use URL pattern: `accounts.google.com`

#### AWS
1. Go to IAM → Users → Security credentials
2. Click "Manage" next to "Assigned MFA device"
3. Select "Virtual MFA device"
4. Click "Show secret key"
5. Use URL pattern: `console.aws.amazon.com`

### Secret Key Format

- TOTP secrets are typically **base32 encoded**
- They contain only letters A-Z and numbers 2-7
- Spaces and dashes are ignored (you can include them or not)
- Example: `JBSWY3DPEHPK3PXP` or `JBSW Y3DP EHPK 3PXP`

---

## 🔒 Security Considerations

### ⚠️ Important Security Notes

1. **Store Secrets Securely**
   - TOTP secrets are as sensitive as passwords
   - This extension stores secrets in Chrome's sync storage
   - Anyone with access to your browser profile can access these secrets

2. **Use at Your Own Risk**
   - This extension is provided as-is for convenience
   - Consider using a dedicated password manager with TOTP support for critical accounts
   - Keep backups of your TOTP secrets in a secure location

3. **Browser Security**
   - Always lock your computer when away
   - Use a strong Windows password/PIN
   - Consider using browser profiles with passwords

4. **URL Matching**
   - Be specific with URL patterns to avoid unintended triggering
   - Use full domain names (e.g., `accounts.google.com` instead of `google.com`)

### What This Extension Does NOT Do

- ❌ Does not send your secrets to any external server
- ❌ Does not share data with third parties
- ❌ Does not require internet connection to generate codes
- ❌ Does not store secrets in plain text files

### What This Extension DOES Do

- ✅ Stores secrets in Chrome's encrypted sync storage
- ✅ Generates TOTP codes locally in your browser
- ✅ Automatically copies codes when visiting configured URLs
- ✅ Keeps all data within your browser profile

---

## 🛠️ Troubleshooting

### Extension Not Copying Automatically

**Problem**: TOTP codes aren't being copied when you visit a website.

**Solutions**:
1. Check that the URL pattern matches the website you're visiting
2. Open the extension popup to verify the secret is saved correctly
3. Check browser console (F12) for any error messages
4. Ensure the page has fully loaded (extension waits for 'complete' status)
5. Verify the extension has the required permissions

### Invalid TOTP Codes

**Problem**: Generated codes are not being accepted by the website.

**Solutions**:
1. Verify you copied the secret key correctly (no extra characters)
2. Check your system time is correct (TOTP relies on accurate time)
3. Ensure the secret is base32 encoded (A-Z, 2-7)
4. Try generating a new secret on the service's website
5. Some services use 8-digit codes - use Advanced Options to configure digits

### Extension Icon Not Showing

**Problem**: Can't find the extension icon in the toolbar.

**Solutions**:
1. Click the extensions icon (puzzle piece) in the toolbar
2. Find "TOTP Auto Copy" and click the pin icon
3. The extension icon should now appear in your toolbar

### Delete Button Not Appearing

**Problem**: Can't delete a secret.

**Solutions**:
1. Click anywhere on the gray TOTP display area or the account name
2. An edit icon (✏️) should appear
3. Click the edit icon to open the edit form
4. The red **Delete** button will appear at the bottom of the form
5. Click it to delete the secret with confirmation

---

## 🔧 Technical Details

### Technology Stack

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **APIs Used**:
  - Chrome Storage API (sync storage)
  - Chrome Scripting API
  - Chrome Tabs API
  - Web Crypto API (for HMAC-SHA1)
  - Clipboard API

### Files Structure

```
totp-generator-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (auto-copy logic)
├── content.js         # Content script (clipboard access)
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and event handlers
├── totp.js            # TOTP generation algorithm
└── .github/
    └── README.md      # This file
```

### TOTP Algorithm

This extension implements the standard TOTP (Time-Based One-Time Password) algorithm as defined in [RFC 6238](https://tools.ietf.org/html/rfc6238):

- **Algorithm**: HMAC-SHA1
- **Time Step**: 30 seconds
- **Code Length**: 6 digits (configurable via Advanced Options)
- **Base32 Decoding**: Standard implementation

### Permissions Explained

The extension requires the following permissions:

- **storage**: To save your TOTP secrets securely
- **clipboardWrite**: To copy TOTP codes to clipboard
- **tabs**: To detect when you navigate to configured URLs
- **activeTab**: To access the current tab's URL
- **scripting**: To execute clipboard copy in the page context
- **host_permissions (`<all_urls>`)**: To monitor navigation across all websites

---

## 📝 Version History

### Version 1.0.1 (February 2026)
- ✨ Enhanced UI with previous/next TOTP code display
- ✅ Improved delete functionality (in edit form)
- ✅ List hiding when form is open
- ✅ Advanced options for custom digits and period
- ✅ Better visual timer with color coding

### Version 1.0.0 (October 2025)
- ✨ Initial release
- ✅ Automatic TOTP copy on URL match
- ✅ Manual copy with clipboard button
- ✅ Live countdown timer with color coding
- ✅ Add/delete secrets management
- ✅ Collapsible add form with + icon
- ✅ Modern, clean UI design

---

## 🤝 Contributing

Contributions are welcome! If you find bugs or have feature suggestions:

1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Submit pull requests with clear descriptions

---

## 📄 License

This project is provided as-is for educational and personal use.

---

## ⚡ Quick Start Guide

1. **Install** the extension (see [Installation](#installation))
2. **Click** the extension icon in your toolbar
3. **Click** the **+** icon
4. **Enter** your account name, URL pattern, and TOTP secret
5. **Click** Add
6. **Visit** the configured website - code auto-copies!
7. **Paste** (Ctrl+V) the code into the 2FA field

---

## 📞 Support

If you need help:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [How to Use](#how-to-use) guide
3. Ensure your TOTP secret is correct
4. Verify your system time is accurate

---

## 🎯 Best Practices

1. **Back Up Your Secrets**: Keep a secure backup of your TOTP secrets
2. **Use Specific URLs**: Be precise with URL patterns (e.g., `login.example.com`)
3. **Test Before Disabling Old 2FA**: Verify the extension works before removing your authenticator app
4. **Regular Updates**: Keep the extension updated for security patches
5. **Limit Exposure**: Only add accounts you frequently use

---

**Made with ❤️ for convenience and security**

*Remember: Security is a shared responsibility. Stay safe online!* 🔐
