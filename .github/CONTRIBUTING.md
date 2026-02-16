# Contributing to TOTP Auto Copy Extension

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/totp-generator-extension.git
   cd totp-generator-extension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

3. **Make Changes**
   - Edit the code
   - The extension will reload automatically in Chrome

## Project Structure

```
totp-auto-copy/
├── manifest.json         # Extension manifest (Manifest V3)
├── background.js         # Service worker (auto-copy on URL match)
├── content.js            # Content script (clipboard access)
├── popup.html            # Extension popup UI (add/edit/view secrets)
├── popup.js              # Popup UI controller (event handling, TOTP display)
├── totp.js               # TOTP generation library (RFC 6238 compliant)
├── README.md             # User documentation and setup guide
└── .github/
    ├── README.md         # User documentation
    ├── CONTRIBUTING.md   # This file
    └── workflows/        # GitHub Actions CI/CD workflows
```

## Code Style Guidelines

### JavaScript

- Use ES6+ features (const, let, arrow functions, async/await)
- Use JSDoc comments for functions
- Follow the existing code structure and patterns
- Prefer explicit error handling over silent failures

### Example

```javascript
/**
 * Generates a TOTP code
 * @param {string} secret - Base32 encoded secret
 * @returns {Promise<string>} The generated TOTP code
 */
async function generateTOTP(secret) {
    // Implementation
}
```

### HTML/CSS

- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Follow BEM-like naming for CSS classes
- Prefer CSS variables for theming

## Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clear, concise code
   - Add comments for complex logic
   - Test thoroughly in Chrome
   - Follow existing patterns in:
     - `popup.js` for UI event handling and TOTP display logic
     - `totp.js` for cryptographic functions
     - `background.js` for auto-copy and tab monitoring
     - `manifest.json` for permission declarations

3. **Test Your Changes**
   - **Extension Loading**: Verify extension loads without syntax errors in `chrome://extensions/`
   - **TOTP Functionality**:
     - Add new secrets with valid Base32 keys
     - Verify 6-digit TOTP codes generate correctly
     - Confirm countdown timer updates every second
     - Test color-coded timer (green/yellow/red based on time remaining)
     - Verify Previous/Next TOTP codes display as text on the right side
   - **Secret Management**:
     - Create, edit, and delete secrets
     - Verify edit form hides the secret list
     - Confirm delete button only appears in edit form with confirmation dialog
   - **Auto-Copy Feature**:
     - Set up secret with auto-copy URL pattern
     - Navigate to matching URL and verify TOTP auto-copies
     - Check clipboard for correct TOTP value
     - Test notification feedback (success/error types)
   - **Storage & Persistence**:
     - Verify secrets persist after browser restart
     - Check Chrome sync storage integration
   - **UI/UX**:
     - Test on different screen sizes
     - Verify smooth form transitions
     - Check browser console for any errors or warnings

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then open a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Use conventional commit format:
- `feat: add manual refresh button`
- `fix: resolve clipboard permission issue`
- `docs: update installation instructions`

### PR Description

Include:
1. **What**: Description of changes
2. **Why**: Reason for changes
3. **How**: Implementation approach
4. **Testing**: How you tested the changes

### Example

```markdown
## What
Adds support for 8-digit TOTP codes in addition to existing 6-digit codes

## Why
Some services (like Google's backup codes) use 8-digit authentication codes

## How
- Modified `totp.js` to accept configurable digit length parameter
- Updated `popup.html` form to allow selection of code length
- Updated secret storage to include digit preference
- Modified display logic in `popup.js` to handle variable lengths

## Testing
- Added new 8-digit secrets and verified codes generate correctly
- Tested mixed 6-digit and 8-digit secrets in popup
- Verified auto-copy works with 8-digit codes
- Checked countdown timer displays correctly for both lengths
- Verified Previous/Next codes display correctly for 8-digit secrets
```

## Testing Checklist

Before submitting a PR, verify:

- [ ] Extension loads without errors (`chrome://extensions/`)
- [ ] All existing functionality still works (add, edit, delete secrets)
- [ ] New features work as expected
- [ ] No console errors in popup or background service worker
- [ ] TOTP code generation is accurate for test secrets
- [ ] Countdown timer updates every second
- [ ] Previous/Next TOTP codes display correctly
- [ ] Auto-copy functionality works for URL patterns
- [ ] Notification feedback displays for auto-copy events
- [ ] Delete confirmation dialog appears before deletion
- [ ] Edit form properly hides the secret list
- [ ] Secrets persist in Chrome sync storage
- [ ] UI is responsive and looks good
- [ ] Code follows project style guidelines
- [ ] Comments are clear and helpful
- [ ] No unrelated files are modified

## Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the problem
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: 
   - Chrome/Chromium version
   - OS (Windows, macOS, Linux)
   - Extension version
6. **Screenshots/Video**: If applicable
7. **Additional Context**:
   - Console errors (from popup or background service worker)
   - Does it work with specific secret types?
   - Is it related to auto-copy, TOTP generation, or secret management?

## Feature Requests

For feature requests, please include:

1. **Description**: What feature you'd like (with clear, specific scope)
2. **Use Case**: Why this feature would be useful
3. **Proposed Solution**: How you envision it working
4. **Alternatives**: Other approaches you've considered
5. **Related Files**: Which extension components would need changes (e.g., `popup.js`, `totp.js`, `background.js`, `manifest.json`)

### Examples of Feature Requests

- "Allow configurable TOTP digit length (6, 8, or custom)"
- "Add support for HOTP (counter-based) algorithms"
- "Enable batch import/export of secrets"
- "Add dark mode theme for popup UI"

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the issue, not the person
- Accept constructive criticism gracefully

## Key Implementation Patterns

### TOTP Generation (totp.js)

- ✅ RFC 6238 compliant with HMAC-SHA1
- ✅ 30-second time steps
- ✅ Support for offset calculations (Previous/Next codes)
- ✅ Base32 secret decoding with standard implementation

### Popup UI Controller (popup.js)

- ✅ Event-driven architecture for form management
- ✅ Live TOTP updates every 1 second with `updateTotpDisplays()`
- ✅ Color-coded countdown timer (green/yellow/red)
- ✅ Form visibility toggle hides secret list during editing
- ✅ Centralized secrets access via DOM helper functions

### Service Worker (background.js)

- ✅ Tab monitoring with URL pattern matching
- ✅ Duplicate prevention for rapid tab switches
- ✅ Auto-copy with configurable retry logic
- ✅ Notification badges on extension icon

### Storage Architecture

- ✅ Chrome sync storage for cross-device synchronization
- ✅ Encrypted secret persistence
- ✅ Standard Chrome Storage API interface

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in the repository
- Comment on existing issues or PRs

Thank you for contributing! 🎉
