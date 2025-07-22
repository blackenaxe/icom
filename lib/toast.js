import { Platform } from 'react-native';

let Toast;

if (Platform.OS === 'web') {
  // Web'de named export
  Toast = require('react-native-toast-message').Toast;
} else {
  // Mobilde default export
  Toast = require('react-native-toast-message').default;
}

export default Toast;