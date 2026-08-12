// GE GIPAD - Fortalecimento Familiar
// Progressive Web App (PWA) Application Logic

/**
 * Register Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

/**
 * Check if app is installed (PWA)
 */nfunction checkIfAppIsInstalled() {
    if (window.navigator.standalone === true) {
        console.log('App is running in standalone mode (installed as PWA)');
        document.body.classList.add('pwa-mode');
    }
}

/**
 * Handle before install prompt (for install button)
 */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event for later use.
    deferredPrompt = e;
    console.log('beforeinstallprompt event fired');
});

/**
 * Add install button handler
 */
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

/**
 * Handle app installed event
 */
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Clear the deferredPrompt as it can not be used again
    deferredPrompt = null;
});

/**
 * Initialize app
 */
function initializeApp() {
    console.log('GE GIPAD - Fortalecimento Familiar initialized');
    checkIfAppIsInstalled();
    loadStoredData();
}

/**
 * Load data from localStorage
 */
function loadStoredData() {
    try {
        const storedData = localStorage.getItem('ge-gipad-data');
        if (storedData) {
            const data = JSON.parse(storedData);
            console.log('Stored data loaded:', data);
        }
    } catch (error) {
        console.log('Error loading stored data:', error);
    }
}

/**
 * Save data to localStorage
 */
function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log('Data saved:', key);
    } catch (error) {
        console.log('Error saving data:', error);
    }
}

/**
 * Handle online/offline events
 */
window.addEventListener('online', () => {
    console.log('Application is now online');
    document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
    console.log('Application is now offline');
    document.body.classList.add('offline-mode');
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}