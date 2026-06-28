import api from './api';

/**
 * Push Notification Service using Capacitor PushNotifications.
 * Handles token generation, backend registration, and foreground/background listener setup.
 */
export const PushNotificationService = {
  listenersInitialized: false,

  /**
   * Initializes Push Notifications, requests permission, and sets up token event handlers.
   */
  async init() {
    console.log('[PushService] init() triggered');

    // Check if we are running in a Capacitor Native environment (Android/iOS)
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const { PushNotifications } = window.Capacitor.Plugins;

        if (!PushNotifications) {
          console.warn('[PushService] Capacitor PushNotifications plugin is not loaded');
          return;
        }

        // Request permission
        console.log('[PushService] Checking permissions...');
        let perm = await PushNotifications.checkPermissions();
        console.log('[PushService] Current permission state:', perm.receive);

        if (perm.receive !== 'granted') {
          console.log('[PushService] Requesting permissions...');
          perm = await PushNotifications.requestPermissions();
          console.log('[PushService] Permission request result:', perm.receive);
        }

        if (perm.receive === 'granted') {
          // Register with FCM / APNS services
          console.log('[PushService] Registering with native platform...');
          await PushNotifications.register();

          // Setup listeners only once
          this.setupListeners(PushNotifications);
        } else {
          console.warn('[PushService] Push notification permissions denied by user.');
        }
      } catch (err) {
        console.error('[PushService] CRITICAL: Error initializing Push Notifications:', err);
      }
    } else {
      console.log('[PushService] Skipping native Push Notification setup: Running on standard Web platform.');
    }
  },

  /**
   * Sets up token and reception event listeners.
   */
  async setupListeners(PushNotifications) {
    if (this.listenersInitialized) {
      console.log('[PushService] Listeners already initialized, skipping setup.');
      return;
    }

    console.log('[PushService] Setting up native listeners...');

    try {
      // Remove any existing listeners first to ensure a clean state
      await PushNotifications.removeAllListeners();

      // Listener for successful token registration
      PushNotifications.addListener('registration', async (token) => {
        console.log('[PushService] FCM Registration Token generated successfully:', token.value);
        try {
          await this.registerTokenWithBackend(token.value);
        } catch (e) {
          console.error('[PushService] Failed to send token to backend:', e);
        }
      });

      // Listener for registration errors
      PushNotifications.addListener('registrationError', (err) => {
        console.error('[PushService] FCM Token Registration Error:', err);
      });

      // Listener for received notifications while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[PushService] Push Notification Received in Foreground:', notification);
        // Trigger a local toast/alert UI event if needed
      });

      // Listener for action clicks on push notifications
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[PushService] Push Notification clicked/action performed:', action);
        // Route user to appropriate page (e.g. /dashboard or notifications panel)
      });

      this.listenersInitialized = true;
      console.log('[PushService] Native listeners setup successful.');
    } catch (err) {
      console.error('[PushService] Error during listener setup:', err);
    }
  },

  /**
   * Sends the FCM token to the backend server to associate it with the authenticated user profile.
   */
  async registerTokenWithBackend(token) {
    console.log('[PushService] Synchronizing token with backend...');
    try {
      const res = await api.post('/users/me/fcm-token', { token });
      if (res.data && res.data.success) {
        console.log('[PushService] FCM token successfully synchronized with backend database.');
      } else {
        console.warn('[PushService] Backend synchronization returned non-success response:', res.data);
      }
    } catch (e) {
      console.error('[PushService] Failed to register FCM token with backend:', e.response?.data?.error || e.message);
    }
  }
};

export default PushNotificationService;
