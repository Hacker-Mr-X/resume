/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PortfolioData {
  defaultLanguage: string;
  settings?: {
    cardSound?: string;
    sectionSound?: string;
    enableLightRays?: boolean;
  };
  hero: any;
  education: any[];
  internships: any[];
  projects: any[];
  exchanges: any[];
  volunteers: any[];
  skills: any[];
}

interface PortfolioContextType {
  data: PortfolioData | null;
  loading: boolean;
  saveData: (newData: PortfolioData) => Promise<boolean>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Check user override in localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // 2. Check system preference for dark mode (highest device/OS priority)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Fallback to time-based judgment:
    // If local hour is >= 18 (6:00 PM) or < 6 (6:00 AM), default to dark mode.
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      return 'dark';
    }

    // 4. Default fallback is light mode
    return 'light';
  });
  const { i18n } = useTranslation();

  useEffect(() => {
    let themeColor = '#f8fafc'; // light slate-50 background
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      themeColor = '#020617'; // dark slate-950 background
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamically update theme-color meta tag for seamless status bar coloring on mobile in-app browsers
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', themeColor);
    } catch (e) {
      console.error('Error updating theme-color meta tag:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/portfolio.json`);
        const json = await response.json();
        setData(json);
        i18n.changeLanguage(json.defaultLanguage || 'en');
      } catch (error) {
        console.error('Error loading portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveData = async (newData: PortfolioData) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (response.ok) {
        setData(newData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  return (
    <PortfolioContext.Provider value={{ data, loading, saveData, theme, toggleTheme }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
