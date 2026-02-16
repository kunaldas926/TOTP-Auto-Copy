// ============================================================================
// DOM Element Selectors and Constants
// ============================================================================
const DOM = {
    toggleForm: () => document.getElementById('toggleForm'),
    addSecretForm: () => document.getElementById('addSecretForm'),
    nameInput: () => document.getElementById('name'),
    urlInput: () => document.getElementById('url'),
    secretInput: () => document.getElementById('secret'),
    digitsInput: () => document.getElementById('digits'),
    periodInput: () => document.getElementById('period'),
    addSecretBtn: () => document.getElementById('addSecret'),
    deleteSecretBtn: () => document.getElementById('deleteSecret'),
    cancelAddBtn: () => document.getElementById('cancelAdd'),
    secretList: () => document.getElementById('secretList'),
    toggleAdvanced: () => document.getElementById('toggleAdvanced'),
    advancedOptions: () => document.getElementById('advancedOptions'),
    totpPreview: () => document.getElementById('totpPreview'),
    previewCodes: () => document.getElementById('previewCodes'),
    formModeIndicator: () => document.getElementById('formModeIndicator')
};

const CONFIG = {
    TOTP_TIME_STEP: 30,
    COPY_FEEDBACK_DURATION: 1000,
    CIRCLE_CIRCUMFERENCE: 113,
    STORAGE_KEY: 'secrets',
    PREVIEW_COUNT: 6
};

const SELECTORS = {
    secretItem: '.secret-item',
    totpDisplay: '.totp-display',
    siteName: '.site-name',
    deleteIcon: '.delete-icon',
    editIcon: '.edit-icon',
    copyIcon: '.copy-icon',
    totpCode: '.totp-code',
    timerText: '.timer-text',
    timerCircleProgress: '.timer-circle-progress'
};

// ============================================================================
// Form State Management
// ============================================================================
let editingId = null;

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadSecrets();
    attachEventListeners();
});

// ============================================================================
// Event Listeners
// ============================================================================
function attachEventListeners() {
    DOM.toggleForm().addEventListener('click', toggleFormVisibility);
    DOM.cancelAddBtn().addEventListener('click', cancelForm);
    DOM.addSecretBtn().addEventListener('click', addNewSecret);
    DOM.deleteSecretBtn().addEventListener('click', deleteSecretFromForm);
    DOM.toggleAdvanced().addEventListener('click', toggleAdvanced);
    DOM.secretInput().addEventListener('input', updatePreview);
    DOM.digitsInput().addEventListener('change', updatePreview);
    DOM.periodInput().addEventListener('change', updatePreview);
}

function toggleFormVisibility() {
    const form = DOM.addSecretForm();
    const isOpening = !form.classList.contains('open');

    form.classList.toggle('open');
    DOM.toggleForm().classList.toggle('hidden');
    DOM.secretList().style.display = isOpening ? 'none' : 'block';

    if (isOpening) {
        DOM.nameInput().focus();
    }
}

function cancelForm() {
    DOM.addSecretForm().classList.remove('open');
    DOM.toggleForm().classList.remove('hidden');
    DOM.secretList().style.display = 'block';
    clearForm();
    editingId = null;
}

function clearForm() {
    DOM.nameInput().value = '';
    DOM.urlInput().value = '';
    DOM.secretInput().value = '';
    DOM.digitsInput().value = '6';
    DOM.periodInput().value = '30';
    DOM.formModeIndicator().style.display = 'none';
    DOM.deleteSecretBtn().style.display = 'none';
    DOM.addSecretBtn().textContent = 'Add';
    DOM.advancedOptions().classList.remove('open');
    DOM.toggleAdvanced().textContent = 'Advanced options ▼';


    // Remove editing and selected classes from all secret items
    document.querySelectorAll('.secret-item').forEach(item => {
        item.classList.remove('editing', 'selected');
        const editBtn = item.querySelector('.edit-icon');
        const copyBtn = item.querySelector('.copy-icon');
        if (editBtn) editBtn.style.display = 'none';
        if (copyBtn) copyBtn.style.display = 'flex';
    });
}

async function addNewSecret() {
    const name = DOM.nameInput().value.trim();
    const url = DOM.urlInput().value.trim();
    const secret = DOM.secretInput().value.trim().replaceAll(/\s/g, '');
    const digits = Number.parseInt(DOM.digitsInput().value, 10) || 6;
    const period = Number.parseInt(DOM.periodInput().value, 10) || 30;

    if (!validateFormInputs(name, url, secret)) {
        return;
    }

    try {
        const secrets = await getStoredSecrets();

        if (editingId) {
            // Update existing secret
            const index = secrets.findIndex(s => s.id === editingId);
            if (index !== -1) {
                secrets[index] = { ...secrets[index], name, url, secret, digits, period };
            }
        } else {
            // Add new secret
            secrets.push({ name, url, secret, digits, period, id: Date.now() });
        }

        await chrome.storage.sync.set({ [CONFIG.STORAGE_KEY]: secrets });

        clearForm();
        DOM.addSecretForm().classList.remove('open');
        DOM.toggleForm().classList.remove('hidden');
        DOM.secretList().style.display = 'block';
        DOM.totpPreview().classList.remove('open');
        DOM.advancedOptions().classList.remove('open');
        editingId = null;
        await loadSecrets();
    } catch (error) {
        console.error('Failed to save secret:', error);
        alert('Failed to save secret. Please try again.');
    }
}

// ============================================================================
// Form Validation
// ============================================================================
function validateFormInputs(name, url, secret) {
    if (!name || !url || !secret) {
        alert('Please fill in all fields');
        return false;
    }

    if (name.length > 50) {
        alert('Name must be 50 characters or less');
        return false;
    }

    if (url.length > 100) {
        alert('URL pattern must be 100 characters or less');
        return false;
    }

    return true;
}

// ============================================================================
// Advanced Options
// ============================================================================
function toggleAdvanced() {
    const options = DOM.advancedOptions();
    const toggle = DOM.toggleAdvanced();

    options.classList.toggle('open');
    toggle.textContent = options.classList.contains('open') ? 'Advanced options ▲' : 'Advanced options ▼';
}

async function updatePreview() {
    // Preview functionality removed
}

// ============================================================================
// Storage Operations
// ============================================================================
async function getStoredSecrets() {
    try {
        const result = await chrome.storage.sync.get(CONFIG.STORAGE_KEY);
        return result[CONFIG.STORAGE_KEY] || [];
    } catch (error) {
        console.error('Failed to retrieve secrets:', error);
        return [];
    }
}

// ============================================================================
// Load and Render Secrets
// ============================================================================
let updateInterval;

async function loadSecrets() {
    const secretList = await getStoredSecrets();
    renderSecretsList(secretList);
    startUpdateInterval();
}

async function renderSecretsList(secretList) {
    const container = DOM.secretList();
    container.innerHTML = '';

    if (secretList.length === 0) {
        container.innerHTML = '<p class="empty-message">No secrets added yet.</p>';
        stopUpdateInterval();
        return;
    }

    for (const item of secretList) {
        try {
            const element = await createSecretElement(item);
            container.appendChild(element);
        } catch (error) {
            console.error(`Failed to render secret ${item.name}:`, error);
        }
    }

    attachSecretItemListeners();
}

async function createSecretElement(item) {
    const div = document.createElement('div');
    div.className = 'secret-item';
    div.dataset.id = item.id;

    try {
        const digits = item.digits || 6;
        const period = item.period || 30;

        const totp = await generateTOTP(item.secret, period, digits);
        const prevTotp = await generateTOTPForTime(item.secret, period, digits, -1);
        const nextTotp = await generateTOTPForTime(item.secret, period, digits, 1);
        const timeRemaining = getTimeRemaining(period);
        const circleColor = getCircleColor(timeRemaining);
        const circleOffset = getCircleOffset(timeRemaining, period);

        div.innerHTML = `
            <div class="secret-header">
                <strong class="site-name" data-url="${escapeHtml(item.url)}" data-id="${item.id}">${escapeHtml(item.name)}</strong>
                <div class="totp-codes-preview">
                    <span class="prev-code" title="Previous TOTP">${prevTotp}</span>
                    <span class="next-code" title="Next TOTP">${nextTotp}</span>
                </div>
            </div>
            <div class="totp-display" data-id="${item.id}" data-secret="${item.secret}" data-digits="${digits}" data-period="${period}">
                <span class="totp-code">${totp}</span>
                <div class="timer-circle">
                    <svg class="timer-svg" width="40" height="40" viewBox="0 0 40 40">
                        <circle class="timer-circle-bg" cx="20" cy="20" r="18"></circle>
                        <circle class="timer-circle-progress ${circleColor}" cx="20" cy="20" r="18"
                                stroke-dasharray="${CONFIG.CIRCLE_CIRCUMFERENCE}" 
                                stroke-dashoffset="${circleOffset}"></circle>
                    </svg>
                    <span class="timer-text">${timeRemaining}</span>
                </div>
                <div class="action-buttons">
                    <button class="edit-icon" data-id="${item.id}" title="Edit" style="display: none;">✏️</button>
                    <button class="copy-icon" data-secret="${item.secret}" data-digits="${digits}" data-period="${period}" title="Copy TOTP">📋</button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to generate TOTP:', error);
        div.innerHTML = '<p class="empty-message">Error generating TOTP code</p>';
    }

    return div;
}

function attachSecretItemListeners() {
    document.querySelectorAll(SELECTORS.totpDisplay).forEach(display => {
        display.addEventListener('click', toggleDeleteButton);
    });

    document.querySelectorAll(SELECTORS.siteName).forEach(name => {
        name.addEventListener('click', (e) => {
            const itemId = e.currentTarget.dataset.id;
            const totpDisplay = e.currentTarget.closest(SELECTORS.secretItem).querySelector(SELECTORS.totpDisplay);
            const mockEvent = {
                currentTarget: totpDisplay
            };
            toggleDeleteButton.call(this, mockEvent);
        });
    });

    document.querySelectorAll(SELECTORS.editIcon).forEach(btn => {
        btn.addEventListener('click', editSecret);
    });

    document.querySelectorAll(SELECTORS.copyIcon).forEach(btn => {
        btn.addEventListener('click', copyTotp);
    });
}

// ============================================================================
// Secret Item Interactions
// ============================================================================
function toggleDeleteButton(e) {
    const itemId = e.currentTarget.dataset.id;
    const secretItem = document.querySelector(`.secret-item[data-id="${itemId}"]`);
    const editIcon = secretItem.querySelector('.edit-icon');
    const copyIcon = secretItem.querySelector('.copy-icon');
    const isSelected = secretItem.classList.toggle('selected');

    // Hide all other edit icons
    document.querySelectorAll(SELECTORS.editIcon).forEach(icon => {
        const parentItem = icon.closest('.secret-item');
        if (parentItem && parentItem !== secretItem) {
            parentItem.classList.remove('selected');
            parentItem.querySelector('.edit-icon').style.display = 'none';
            parentItem.querySelector('.copy-icon').style.display = 'flex';
        }
    });

    // Toggle buttons visibility for current item
    if (isSelected) {
        editIcon.style.display = 'flex';
        copyIcon.style.display = 'none';
    } else {
        editIcon.style.display = 'none';
        copyIcon.style.display = 'flex';
    }
}

async function editSecret(e) {
    e.stopPropagation();

    const id = Number.parseInt(e.target.dataset.id, 10);
    const secrets = await getStoredSecrets();
    const secret = secrets.find(s => s.id === id);

    if (!secret) {
        console.error('Secret not found');
        return;
    }

    // Populate form with existing values
    DOM.nameInput().value = secret.name;
    DOM.urlInput().value = secret.url;
    DOM.secretInput().value = secret.secret;
    DOM.digitsInput().value = secret.digits || 6;
    DOM.periodInput().value = secret.period || 30;

    // Update form mode indicator
    const indicator = DOM.formModeIndicator();
    indicator.style.display = 'block';
    indicator.textContent = `Editing: ${secret.name}`;

    // Update button text
    DOM.addSecretBtn().textContent = 'Save';

    // Show delete button
    DOM.deleteSecretBtn().style.display = 'flex';

    // Set editing state
    editingId = id;

    // Mark the secret item as being edited (shows site name)
    document.querySelectorAll('.secret-item').forEach(item => {
        item.classList.remove('editing');
    });
    const secretItem = document.querySelector(`[data-id="${id}"]`);
    if (secretItem) {
        secretItem.classList.add('editing');
    }

    // Show form and hide list
    DOM.addSecretForm().classList.add('open');
    DOM.toggleForm().classList.add('hidden');
    DOM.secretList().style.display = 'none';
    DOM.advancedOptions().classList.add('open');
    DOM.toggleAdvanced().textContent = 'Advanced options ▲';

    // Generate preview
    await updatePreview();

    // Focus on first field
    DOM.nameInput().focus();
}

async function deleteSecretFromForm() {
    if (!editingId) {
        console.error('No secret selected for deletion');
        return;
    }

    const secrets = await getStoredSecrets();
    const secret = secrets.find(s => s.id === editingId);

    if (!secret) {
        console.error('Secret not found');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete "${secret.name}"?`);
    if (!confirmDelete) {
        return;
    }

    try {
        const filtered = secrets.filter(item => item.id !== editingId);
        await chrome.storage.sync.set({ [CONFIG.STORAGE_KEY]: filtered });

        cancelForm();
        await loadSecrets();
    } catch (error) {
        console.error('Failed to delete secret:', error);
        alert('Failed to delete secret. Please try again.');
    }
}

async function copyTotp(e) {
    e.stopPropagation();
    const secret = e.target.dataset.secret;
    const digits = Number.parseInt(e.target.dataset.digits, 10) || 6;
    const period = Number.parseInt(e.target.dataset.period, 10) || 30;
    const originalText = e.target.textContent;

    if (!secret) {
        console.error('No secret found for copy operation');
        e.target.textContent = '✗';
        setTimeout(() => {
            e.target.textContent = originalText;
        }, CONFIG.COPY_FEEDBACK_DURATION);
        return;
    }

    try {
        const totp = await generateTOTP(secret, period, digits);
        await navigator.clipboard.writeText(totp);

        e.target.textContent = '✓';
        setTimeout(() => {
            e.target.textContent = originalText;
        }, CONFIG.COPY_FEEDBACK_DURATION);
    } catch (error) {
        console.error('Failed to copy TOTP:', error);
        e.target.textContent = '✗';
        setTimeout(() => {
            e.target.textContent = originalText;
        }, CONFIG.COPY_FEEDBACK_DURATION);
    }
}

// ============================================================================
// Previous/Next TOTP Display
// ============================================================================
async function generateTOTPForTime(secret, timeStep, digits, offset) {
    /**
     * Generate TOTP for a specific time offset
     * offset: -1 for previous, 0 for current, +1 for next
     */
    if (!validateTotpSecret(secret)) {
        throw new Error('Invalid TOTP secret format');
    }

    try {
        const key = base32Decode(secret.replaceAll(/\s/g, ''));
        const epoch = Math.floor(Date.now() / 1000);
        const counter = Math.floor(epoch / timeStep) + offset;

        // Create 8-byte counter in big-endian format
        const counterBuffer = new ArrayBuffer(8);
        const counterView = new DataView(counterBuffer);
        counterView.setUint32(4, counter, false); // Big-endian

        // Import key and generate HMAC-SHA1 signature
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
        const signatureArray = new Uint8Array(signature);

        // Extract dynamic binary code using last 4 bits as offset
        const offset_bits = signatureArray.at(-1) & 0x0F;
        const binary =
            ((signatureArray[offset_bits] & 0x7F) << 24) |
            ((signatureArray[offset_bits + 1] & 0xFF) << 16) |
            ((signatureArray[offset_bits + 2] & 0xFF) << 8) |
            (signatureArray[offset_bits + 3] & 0xFF);

        return (binary % (10 ** digits)).toString().padStart(digits, '0');
    } catch (error) {
        throw new Error(`Failed to generate TOTP: ${error.message}`);
    }
}

// ============================================================================
// TOTP Display Updates
// ============================================================================
function startUpdateInterval() {
    stopUpdateInterval();
    updateInterval = setInterval(updateTotpDisplays, 1000);
}

function stopUpdateInterval() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

async function updateTotpDisplays() {
    const secretList = await getStoredSecrets();

    for (const item of secretList) {
        const itemDiv = document.querySelector(`${SELECTORS.secretItem}[data-id="${item.id}"]`);
        if (!itemDiv) continue;

        try {
            const digits = item.digits || 6;
            const period = item.period || 30;
            const timeRemaining = getTimeRemaining(period);

            const totp = await generateTOTP(item.secret, period, digits);
            const prevTotp = await generateTOTPForTime(item.secret, period, digits, -1);
            const nextTotp = await generateTOTPForTime(item.secret, period, digits, 1);

            const totpCode = itemDiv.querySelector(SELECTORS.totpCode);
            const timerText = itemDiv.querySelector(SELECTORS.timerText);
            const circleProgress = itemDiv.querySelector(SELECTORS.timerCircleProgress);
            const prevCode = itemDiv.querySelector('.prev-code');
            const nextCode = itemDiv.querySelector('.next-code');

            if (totpCode && totpCode.textContent !== totp) {
                totpCode.textContent = totp;
            }

            if (timerText) {
                timerText.textContent = timeRemaining;
            }

            if (circleProgress) {
                const offset = getCircleOffset(timeRemaining, period);
                circleProgress.setAttribute('stroke-dashoffset', offset);

                const color = getCircleColor(timeRemaining);
                circleProgress.classList.remove('green', 'yellow', 'red');
                circleProgress.classList.add(color);
            }

            if (prevCode && prevCode.textContent !== prevTotp) {
                prevCode.textContent = prevTotp;
            }

            if (nextCode && nextCode.textContent !== nextTotp) {
                nextCode.textContent = nextTotp;
            }
        } catch (error) {
            console.error(`Failed to update TOTP for ${item.name}:`, error);
        }
    }
}

// ============================================================================
// Timer and Color Functions
// ============================================================================
function getCircleColor(timeRemaining) {
    if (timeRemaining > 15) return 'green';
    if (timeRemaining > 5) return 'yellow';
    return 'red';
}

function getCircleOffset(timeRemaining, timeStep) {
    const progress = timeRemaining / timeStep;
    return CONFIG.CIRCLE_CIRCUMFERENCE * (1 - progress);
}

// ============================================================================
// Utility Functions
// ============================================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
