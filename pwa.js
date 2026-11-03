/* Makes the dashboard installable as a home-screen app on Android and iOS.
 *
 * - registers the service worker that keeps the app shell available offline;
 * - shows an install banner: Chrome/Edge/Samsung use the browser's own install
 *   prompt, iOS has no prompt so the banner explains Share -> Add to Home Screen.
 */
(function () {
    'use strict';

    var banner = document.getElementById('install-banner');
    var hint = document.getElementById('install-hint');
    var installButton = document.getElementById('install-btn');
    var closeButton = document.getElementById('install-close');
    var DISMISS_KEY = 'omnipulse-install-dismissed';
    var deferredPrompt = null;

    var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    function showBanner() {
        if (banner && !isStandalone) banner.classList.remove('hidden');
    }

    function hideBanner() {
        if (banner) banner.classList.add('hidden');
    }

    function wasDismissed() {
        try {
            return window.localStorage.getItem(DISMISS_KEY) === '1';
        } catch (error) {
            return false;
        }
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {
                /* Not fatal: the app still runs in the browser without offline support. */
            });
        });
    }

    if (isStandalone || wasDismissed()) return;

    var isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    if (isIos) {
        // iOS never fires beforeinstallprompt, so offer the manual route instead.
        if (installButton) installButton.classList.add('hidden');
        if (hint) hint.textContent = 'Tap Share, then "Add to Home Screen" to install.';
        showBanner();
    }

    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        deferredPrompt = event;
        showBanner();
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        hideBanner();
        try {
            window.localStorage.setItem(DISMISS_KEY, '1');
        } catch (error) {
            /* private mode: nothing to remember */
        }
    });

    if (installButton) {
        installButton.addEventListener('click', function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function () {
                deferredPrompt = null;
                hideBanner();
            });
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', function () {
            hideBanner();
            try {
                window.localStorage.setItem(DISMISS_KEY, '1');
            } catch (error) {
                /* private mode: nothing to remember */
            }
        });
    }
})();
