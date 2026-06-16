import React from 'react';
import { Menu as MenuIcon, X, Palette, ShoppingBag } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { themeClasses, ThemeMode } from '../theme';
import { useCart } from '../CartContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
  const { theme, themeMode, setThemeMode } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b ${theme.borderLight}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className={`text-2xl font-bold ${theme.textPrimary} tracking-tighter lowercase`}>
              something sweet
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className={`text-gray-600 ${theme.hoverTextPrimary} font-medium transition-colors`}>
              About
            </a>
            <a href="#menu" className={`text-gray-600 ${theme.hoverTextPrimary} font-medium transition-colors`}>
              Our Menu
            </a>
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 text-gray-600 ${theme.hoverTextPrimary} transition-colors`}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className={`absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 ${theme.bgPrimary} text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm`}>
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* Palette Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                className={`p-2 rounded-full text-gray-400 ${theme.hoverTextPrimary} ${theme.hoverBgLight} transition-colors focus:outline-none`}
                title="Change Theme"
              >
                <Palette className="w-5 h-5" />
              </button>
              
              {isPaletteOpen && (
                <div className={`absolute right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border ${theme.borderLight} flex gap-3 z-50`}>
                  {(Object.keys(themeClasses) as ThemeMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setThemeMode(mode); setIsPaletteOpen(false); }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${themeMode === mode ? 'border-gray-800 scale-110' : 'border-transparent'} ${themeClasses[mode].bgPrimary}`}
                      title={themeClasses[mode].name}
                    />
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 mr-2 text-gray-600 ${theme.hoverTextPrimary}`}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className={`absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 ${theme.bgPrimary} text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full`}>
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              onClick={() => { 
                const modes: ThemeMode[] = ['pink', 'matcha', 'lavender', 'butter'];
                const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
                setThemeMode(modes[nextIndex]);
              }} 
              className={`p-2 text-gray-400 ${theme.hoverTextPrimary}`}
            >
               <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`text-gray-600 ${theme.hoverTextPrimary} focus:outline-none`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden bg-white border-b ${theme.borderLight} px-4 pt-2 pb-4 space-y-1 shadow-lg`}>
          <a 
            href="#about" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 ${theme.hoverTextPrimary} ${theme.hoverBgLight}`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
          <a 
            href="#menu" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 ${theme.hoverTextPrimary} ${theme.hoverBgLight}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Our Menu
          </a>
        </div>
      )}
    </header>
  );
}