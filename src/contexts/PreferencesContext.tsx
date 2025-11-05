import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n';
import { getApiUrl } from '@/lib/api';
import { format, subMonths } from 'date-fns';

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
  monthlyInvoicesCount: number;
  refreshInvoicesCount: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'es',
    currency: 'COP',
    timezone: 'America/Bogota',
    dateFormat: 'DD/MM/YYYY',
  });
  const [monthlyInvoicesCount, setMonthlyInvoicesCount] = useState(0);

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

  const refreshInvoicesCount = async () => {
    const companyId = localStorage.getItem("companyId");
    const authToken = localStorage.getItem("authToken");

    if (!companyId || !authToken) {
      return;
    }

    try {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      const fechaInicial = format(lastMonth, 'yyyy-MM-dd');
      const fechaFinal = format(now, 'yyyy-MM-dd');

      const response = await fetch(
        getApiUrl(`/Documento/TraerDatosDocumentosPeriodo?IdEmpresa=${companyId}&FechaInicial=${fechaInicial}&FechaFinal=${fechaFinal}`),
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.codResponse === 1 && data.basePresentationList) {
          setMonthlyInvoicesCount(data.basePresentationList.length);
        }
      }
    } catch (error) {
      console.error("Error fetching monthly invoices:", error);
    }
  };

  useEffect(() => {
    refreshInvoicesCount();
    
    // Refresh every 5 minutes
    const interval = setInterval(refreshInvoicesCount, 300000);
    return () => clearInterval(interval);
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
        monthlyInvoicesCount,
        refreshInvoicesCount,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
