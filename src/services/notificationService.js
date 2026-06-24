import api from './api';

/**
 * Push Notification Service using Capacitor PushNotifications.
 * Handles token generation, backend registration, and foreground/background listener setup.
 */
export const PushNotificationService = {
  /**
   * Initializes Push Notifications, requests permission, and sets up token event handlers.
   */
  async init() {
    // Check if we are running in a Capacitor Native environment (Android/iOS)
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const { PushNotifications } = window.Capacitor.Plugins;

        if (!PushNotifications) {
          console.warn('Capacitor PushNotifications plugin is not loaded');
          return;
        }

        // Request permission
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive !== 'granted') {
          perm = await PushNotifications.requestPermissions();
        }

        if (perm.receive === 'granted') {
          // Register with FCM / APNS services
          await PushNotifications.register();
          this.setupListeners(PushNotifications);
        } else {
          console.warn('Push notification permissions denied by user.');
        }
      } catch (err) {
        console.error('Error initializing Push Notifications:', err);
      }
    } else {
      console.log('Skipping native Push Notification setup: Running on standard Web platform.');
    }
  },

  /**
   * Sets up token and reception event listeners.
   */
  setupListeners(PushNotifications) {
    // Listener for successful token registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Registration Token generated successfully:', token.value);
      await this.registerTokenWithBackend(token.value);
    });

    // Listener for registration errors
    PushNotifications.addListener('registrationError', (err) => {
      console.error('FCM Token Registration Error:', err);
    });

    // Listener for received notifications while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push Notification Received in Foreground:', notification);
      // Trigger a local toast/alert UI event if needed
    });

    // Listener for action clicks on push notifications
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push Notification clicked/action performed:', action);
      // Route user to appropriate page (e.g. /dashboard or notifications panel)
    });
  },

  /**
   * Sends the FCM token to the backend server to associate it with the authenticated user profile.
   */
  async registerTokenWithBackend(token) {
    try {
      const res = await api.post('/users/me/fcm-token', { token });
      if (res.data.success) {
        console.log('FCM token successfully synchronized with backend database.');
      }
    } catch (e) {
      console.error('Failed to register FCM token with backend:', e.response?.data?.error || e.message);
    }
  }
};
export default PushNotificationService;
