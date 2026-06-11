import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  // Léger feedback (action rapide)
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available');
    }
  },

  // Medium feedback (action standard)
  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
  },

  // Strong feedback (action importante)
  strong: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available');
    }
  },

  // Erreur
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not available');
    }
  },

  // Selection (selection action picker)
  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available');
    }
  },
};
