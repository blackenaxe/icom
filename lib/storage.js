import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = Platform.OS === 'web'
  ? {
      getItem: async (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: async (key, value) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: async (key) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
    };

export default Storage;
