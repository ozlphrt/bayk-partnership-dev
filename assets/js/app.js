// Sailing Club Partnership App - Main Application Logic
// Based on TECHNICAL_SPECIFICATIONS.md requirements

// Global app state
const AppState = {
    currentUser: null,
    currentRole: null,
    selectedOffer: null,
    qrData: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for existing session
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
        AppState.currentRole = savedRole;
        AppState.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
}

// Role management
function setUserRole(role, userData = null) {
    AppState.currentRole = role;
    AppState.currentUser = userData;
    
    localStorage.setItem('selectedRole', role);
    if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }
}

function clearUserSession() {
    AppState.currentRole = null;
    AppState.currentUser = null;
    
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedOffer');
    localStorage.removeItem('currentQRData');
}

// Data loading utilities
async function loadJSONData(filename) {
    try {
        const response = await fetch(`assets/data/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        throw error;
    }
}

// QR Code utilities
function generateQRToken() {
    return 'qr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function createQRData(memberId, offerId) {
    const token = generateQRToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    
    return {
        token: token,
        member_id: memberId,
        offer_id: offerId,
        timestamp: now.toISOString(),
        expires_at: expiresAt.toISOString()
    };
}

// Validation utilities
function validateQRData(qrData) {
    if (!qrData || !qrData.token || !qrData.member_id || !qrData.offer_id) {
        return { valid: false, error: 'Invalid QR code format' };
    }
    
    const now = new Date();
    const expiresAt = new Date(qrData.expires_at);
    
    if (now > expiresAt) {
        return { valid: false, error: 'QR code has expired' };
    }
    
    return { valid: true };
}

// Navigation utilities
function navigateToRole(role) {
    setUserRole(role);
    
    switch(role) {
        case 'member':
            window.location.href = 'member/index.html';
            break;
        case 'partner':
            window.location.href = 'partner/index.html';
            break;
        case 'admin':
            window.location.href = 'admin/index.html';
            break;
        default:
            console.error('Invalid role:', role);
    }
}

function logout() {
    clearUserSession();
    window.location.href = 'index.html';
}

// Error handling
function showError(message, elementId = null) {
    const errorMessage = `<div class="alert alert-error">${message}</div>`;
    
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = errorMessage;
        }
    } else {
        // Show as toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-error';
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 400px;';
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

function showSuccess(message, elementId = null) {
    const successMessage = `<div class="alert alert-success">${message}</div>`;
    
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = successMessage;
        }
    } else {
        // Show as toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success';
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 400px;';
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Format utilities
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export for use in other files
window.AppState = AppState;
window.setUserRole = setUserRole;
window.clearUserSession = clearUserSession;
window.loadJSONData = loadJSONData;
window.generateQRToken = generateQRToken;
window.createQRData = createQRData;
window.validateQRData = validateQRData;
window.navigateToRole = navigateToRole;
window.logout = logout;
window.showError = showError;
window.showSuccess = showSuccess;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
