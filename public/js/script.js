document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Hide preloader after 3 seconds
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 3000);
    }

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(swReg => {
                    console.log('[PWA] Service Worker registered successfully:', swReg.scope);
                    window.swReg = swReg;
                })
                .catch(err => {
                    console.error('[PWA] Service Worker registration failed:', err);
                });
        });
    }

    // --- Theme Toggle Logic Removed ---
    const body = document.body;

    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(`${savedTheme}-theme`);

    // --- Onboarding Redirect Logic ---
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    const startButton = document.querySelector('.cta-container a.primary-btn[href="/onboarding"]');
    if (startButton && onboardingComplete) {
        startButton.href = '/learn';
        startButton.innerHTML = 'Continue Learning <i class="fas fa-arrow-right"></i>';
    }

    // --- Install PWA Prompt ---
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] Install prompt available');
        e.preventDefault();
        deferredPrompt = e;

        // Show install button if you have one
        const installButton = document.getElementById('install-pwa-btn');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`[PWA] User response to install prompt: ${outcome}`);
                    deferredPrompt = null;
                    installButton.style.display = 'none';
                }
            });
        }
    });

    // Log when PWA is installed
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        deferredPrompt = null;
    });

    // --- Settings Modal Logic ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const modalThemeToggle = document.getElementById('modal-theme-toggle');

    if (settingsBtn && settingsModal && closeSettingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });

        const closeSettings = () => {
            settingsModal.classList.remove('active');
        };

        closeSettingsBtn.addEventListener('click', closeSettings);
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }

    // Modal Theme Toggle Removed
});
