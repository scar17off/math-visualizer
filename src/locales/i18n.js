import { en_US } from './en_US';
import { uk_UA } from './uk_UA';
import { ru_RU } from './ru_RU';

const locales = {
  en_US,
  uk_UA,
  ru_RU
};

let currentLocale = 'en_US';

export const i18n = {
  t(key) {
    const keys = key.split('.');
    let value = locales[currentLocale];
    
    for (const k of keys) {
      if (!value[k]) return key;
      value = value[k];
    }
    
    return value;
  },

  setLocale(locale) {
    if (locales[locale]) {
      currentLocale = locale;
    }
  },

  getCurrentLocale() {
    return currentLocale;
  }
}; 