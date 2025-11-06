import { Alert, Platform, ToastAndroid } from 'react-native';

export function showApplicationFeedback(jobTitle: string) {
  const message = `Votre candidature pour "${jobTitle}" a bien été envoyée.`;

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Candidature envoyée', message, [{ text: 'Fermer' }]);
  }
}
