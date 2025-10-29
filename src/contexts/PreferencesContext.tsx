import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '@/i18n';

interface Preferences {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (newPreferences: Partial<Preferences>) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'es',
    currency: 'COP',
    timezone: 'America/Bogota',
    dateFormat: 'DD/MM/YYYY',
  });

  useEffect(() => {
    // Load preferences from localStorage on mount
    const savedLanguage = localStorage.getItem('language') || 'es';
    const savedCurrency = localStorage.getItem('currency') || 'COP';
    const savedTimezone = localStorage.getItem('timezone') || 'America/Bogota';
    const savedDateFormat = localStorage.getItem('dateFormat') || 'DD/MM/YYYY';

    setPreferences({
      language: savedLanguage,
      currency: savedCurrency,
      timezone: savedTimezone,
      dateFormat: savedDateFormat,
    });

    // Apply language
    i18n.changeLanguage(savedLanguage);
  }, []);

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      
      // Save to localStorage
      localStorage.setItem('language', updated.language);
      localStorage.setItem('currency', updated.currency);
      localStorage.setItem('timezone', updated.timezone);
      localStorage.setItem('dateFormat', updated.dateFormat);
      
      // Apply language change
      if (newPreferences.language) {
        i18n.changeLanguage(newPreferences.language);
      }
      
      return updated;
    });
  };

  const formatCurrency = (amount: number): string => {
    const currencySymbols: Record<string, { symbol: string; locale: string }> = {
      COP: { symbol: '$', locale: 'es-CO' },
      USD: { symbol: '$', locale: 'en-US' },
      EUR: { symbol: '€', locale: 'es-ES' },
      GBP: { symbol: '£', locale: 'en-GB' },
    };

    const currencyInfo = currencySymbols[preferences.currency] || currencySymbols.COP;
    
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: preferences.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback if currency formatting fails
      return `${currencyInfo.symbol}${amount.toLocaleString()}`;
    }
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (preferences.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
