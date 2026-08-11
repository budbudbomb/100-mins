import React, { createContext, useContext, useState, useCallback } from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from '../i18n/en.json';
import hiMessages from '../i18n/hi.json';
import { storage } from '../lib/utils';

const messages = { en: enMessages, hi: hiMessages };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => storage.get('locale', 'en'));

  const toggleLanguage = useCallback(() => {
    setLocale(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      storage.set('locale', next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang) => {
    storage.set('locale', lang);
    setLocale(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, setLanguage }}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en">
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
