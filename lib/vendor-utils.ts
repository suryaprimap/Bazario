// app/lib/vendor-utils.ts
import { useState, useEffect } from 'react';

// Type definitions
export type Language = 'ms' | 'en';

export interface TranslationMap {
  dashboard: string;
  inventory: string;
  analytics: string;
  alerts: string;
  pos: string;
  prepare: string;
  portions: string;
  stock: string;
  low: string;
  sales: string;
  today: string;
  revenue: string;
  items: string;
  connected: string;
  notConnected: string;
  connectPos: string;
  automated: string;
  manual: string;
  briefing: string;
  waste: string;
  performance: string;
  daily: string;
  weekly: string;
  monthly: string;
  profit: string;
  wasteCost: string;
  forecastAccuracy: string;
  itemsSold: string;
  turnover: string;
  efficiency: string;
  growth: string;
  reduction: string;
  export: string;
  filter: string;
}

export interface Translations {
  ms: TranslationMap;
  en: TranslationMap;
}

// Complete translations
export const translations: Translations = {
  ms: {
    dashboard: "Papan Pemuka",
    inventory: "Inventori",
    analytics: "Analitik",
    alerts: "Amaran",
    pos: "Sistem POS",
    prepare: "Sediakan",
    portions: "hidangan",
    stock: "Stok",
    low: "Rendah",
    sales: "Jualan",
    today: "Hari Ini",
    revenue: "Pendapatan",
    items: "Item",
    connected: "Tersambung",
    notConnected: "Tidak Tersambung",
    connectPos: "Sambung POS",
    automated: "Automatik",
    manual: "Manual",
    briefing: "Ringkasan Harian",
    waste: "Sisa",
    performance: "Prestasi",
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    profit: "Keuntungan",
    wasteCost: "Kos Sisa",
    forecastAccuracy: "Ketepatan Ramalan",
    itemsSold: "Item Terjual",
    turnover: "Pusingan Inventori",
    efficiency: "Kecekapan",
    growth: "Pertumbuhan",
    reduction: "Pengurangan",
    export: "Eksport Data",
    filter: "Tapis",
  },
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    analytics: "Analytics",
    alerts: "Alerts",
    pos: "POS System",
    prepare: "Prepare",
    portions: "portions",
    stock: "Stock",
    low: "Low",
    sales: "Sales",
    today: "Today",
    revenue: "Revenue",
    items: "Items",
    connected: "Connected",
    notConnected: "Not Connected",
    connectPos: "Connect POS",
    automated: "Automated",
    manual: "Manual",
    briefing: "Daily Briefing",
    waste: "Waste",
    performance: "Performance",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    profit: "Profit",
    wasteCost: "Waste Cost",
    forecastAccuracy: "Forecast Accuracy",
    itemsSold: "Items Sold",
    turnover: "Inventory Turnover",
    efficiency: "Efficiency",
    growth: "Growth",
    reduction: "Reduction",
    export: "Export Data",
    filter: "Filter",
  },
};

// Shared language state management
let globalLanguage: Language = 'ms';

export const getLanguage = (): Language => globalLanguage;
export const setLanguage = (lang: Language): void => {
  globalLanguage = lang;
};

// Custom hook for language management
export const useLanguage = () => {
  const [language, setLanguageLocal] = useState<Language>(getLanguage());

  useEffect(() => {
    // Sync with global state
    setLanguageLocal(getLanguage());
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ms' ? 'en' : 'ms';
    setLanguage(newLang);
    setLanguageLocal(newLang);
  };

  const t = translations[language];
  return { language, toggleLanguage, t };
};