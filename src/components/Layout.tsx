import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Moon, Sun, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import StarBorder from './StarBorder';
import { useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = usePortfolio();
  const { i18n } = useTranslation();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className={isAdmin ? "relative w-full min-h-screen bg-slate-50 dark:bg-slate-950" : "relative h-[100dvh] w-screen overflow-hidden min-h-screen min-h-[-webkit-fill-available]"}>
      {/* Floating Action Buttons (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-4">
        <StarBorder
          as="button"
          onClick={toggleLanguage}
          thickness={2}
          className="rounded-full shadow-lg"
          innerClassName="p-3 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
          color={theme === 'dark' ? 'cyan' : '#0ea5e9'}
          aria-label="Toggle Language"
        >
          <Languages className="w-6 h-6" />
        </StarBorder>
        <StarBorder
          as="button"
          onClick={toggleTheme}
          thickness={2}
          className="rounded-full shadow-lg"
          innerClassName="p-3 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
          color={theme === 'dark' ? 'cyan' : '#0ea5e9'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </StarBorder>
      </div>

      {/* Main Content */}
      <motion.main 
        className="relative z-10 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
