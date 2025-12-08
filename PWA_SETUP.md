# Lyro Maths PWA Setup

## Progressive Web App Features

Your Lyro Maths application is now a fully functional PWA with the following features:

### ✅ Installed Features

1. **Service Worker** (`/public/sw.js`)
   - Offline caching strategy
   - Network-first with cache fallback
   - Push notification support
   - Auto-updates cache on new versions

2. **Web App Manifest** (`/public/manifest.json`)
   - App name: "Lyro Maths - Grade 12 Success"
   - Theme color: #1abc9c (teal)
   - Background color: #222a3a (dark blue)
   - Display mode: Standalone (fullscreen app experience)
   - App icon: `/images/lyro.png`

3. **PWA Meta Tags** (in `views/index.ejs`)
   - Theme color for browser chrome
   - Apple mobile web app capable
   - Mobile web app capable
   - App icons for iOS and Android

### 📱 Installation

#### On Mobile (iOS/Android):
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button (iOS) or menu (Android)
3. Select "Add to Home Screen"
4. The app will install with the Lyro logo

#### On Desktop (Chrome/Edge):
1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. The app will open in its own window

### 🔧 Technical Details

**Service Worker Registration:**
- Registered at `/sw.js`
- Caches all static assets on install
- Updates automatically when new version is deployed

**Cached Resources:**
- All CSS files (styles.css, index.css, onboarding.css, learn.css)
- All JavaScript files
- Images (logo and icons)
- External libraries (Font Awesome, KaTeX)

**Offline Support:**
- App works offline after first visit
- Cached pages load instantly
- Network requests update cache in background

### 🎨 Customization

To change the PWA appearance, edit `/public/manifest.json`:
- `name`: Full app name
- `short_name`: Name shown on home screen
- `theme_color`: Browser chrome color
- `background_color`: Splash screen color
- `icons`: App icons (currently using `/images/lyro.png`)

### 🔔 Push Notifications (Optional)

The service worker includes push notification support. To enable:
1. Request notification permission from user
2. Subscribe to push notifications
3. Send notifications from your server

### 📊 Testing

Test your PWA:
1. Open Chrome DevTools
2. Go to "Application" tab
3. Check "Service Workers" - should show registered
4. Check "Manifest" - should show all app details
5. Use "Lighthouse" to audit PWA score

### 🚀 Deployment

When deploying, ensure:
- Service worker is served from root (`/sw.js`)
- Manifest is accessible at `/manifest.json`
- All cached resources are available
- HTTPS is enabled (required for PWA)

---

**Note:** The app icon is currently set to `/images/lyro.png`. For best results, create multiple icon sizes (192x192, 512x512) and update the manifest accordingly.
