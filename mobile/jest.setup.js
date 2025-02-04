// jest.setup.js
import { describe, expect, it, jest } from '@jest/globals';

// Mock Expo config
process.env.EXPO_OS = 'ios';

jest.mock('i18n-js', () => {
  const I18n = jest.fn().mockImplementation(() => ({
    t: jest.fn((key) => key), // Mock translation function
    locale: 'en',
    enableFallback: true,
    defaultLocale: 'en',
  }));

  return { I18n };
});

jest.mock('@react-native-async-storage/async-storage', () => {
    return {
      getItem: jest.fn(() => Promise.resolve(null)),
      setItem: jest.fn(() => Promise.resolve()),
      removeItem: jest.fn(() => Promise.resolve()),
      mergeItem: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
      getAllKeys: jest.fn(() => Promise.resolve([])),
      multiGet: jest.fn(() => Promise.resolve([])),
      multiSet: jest.fn(() => Promise.resolve()),
      multiRemove: jest.fn(() => Promise.resolve()),
    };
  });

// Explicitly mock react-native-background-geolocation
jest.mock('react-native-background-geolocation');

// Mock react-native-localize if used
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'en' }]),
}));

const locales = require('react-native-localize').getLocales();

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons', // You can mock this as a simple string for now
}));
