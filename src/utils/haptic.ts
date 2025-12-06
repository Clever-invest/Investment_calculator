/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for mobile devices using the Vibration API
 * Falls back gracefully on unsupported devices
 */

// Check if vibration API is supported
const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Haptic feedback patterns for different interactions
 */
export const haptic = {
  /**
   * Light tap - for subtle UI feedback (tab switch, selection)
   */
  light: () => {
    if (canVibrate) {
      navigator.vibrate(5);
    }
  },

  /**
   * Medium tap - for confirmations (button press, toggle)
   */
  medium: () => {
    if (canVibrate) {
      navigator.vibrate(10);
    }
  },

  /**
   * Success pattern - double tap for positive feedback
   */
  success: () => {
    if (canVibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Warning pattern - attention-getting vibration
   */
  warning: () => {
    if (canVibrate) {
      navigator.vibrate([30, 30, 30]);
    }
  },

  /**
   * Error pattern - distinctive pattern for errors
   */
  error: () => {
    if (canVibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  },

  /**
   * Heavy impact - for significant actions (delete, important toggle)
   */
  heavy: () => {
    if (canVibrate) {
      navigator.vibrate(20);
    }
  },

  /**
   * Selection change - for picker/slider changes
   */
  selection: () => {
    if (canVibrate) {
      navigator.vibrate(3);
    }
  },

  /**
   * Notification pattern - for alerts and notifications
   */
  notification: () => {
    if (canVibrate) {
      navigator.vibrate([20, 100, 20, 100, 20]);
    }
  },
};

/**
 * Check if device supports haptic feedback
 */
export const supportsHaptic = () => canVibrate;

/**
 * HOC to add haptic feedback to event handlers
 * @param handler - Original event handler
 * @param type - Type of haptic feedback
 */
export const withHaptic = <T extends (...args: unknown[]) => void>(
  handler: T,
  type: keyof typeof haptic = 'light'
): T => {
  return ((...args: unknown[]) => {
    haptic[type]();
    handler(...args);
  }) as T;
};

export default haptic;
