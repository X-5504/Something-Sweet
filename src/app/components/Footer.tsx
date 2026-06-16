import React from 'react';
import { Instagram, Facebook, Heart } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`${theme.bgLight} pt-16 pb-8 border-t ${theme.borderLight} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <a href="#" className={`text-3xl font-bold ${theme.textPrimary} tracking-tighter lowercase mb-6 transition-colors duration-500`}>
            something sweet
          </a>
          
          <p className="text-gray-500 max-w-sm mb-8">
            The modern neighborhood bakery serving up cloud-like treats and layered moments of joy.
          </p>

          <div className="flex space-x-6 mb-12">
            <a href="#" className={`${theme.textMedium} ${theme.hoverTextDark} transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md`}>
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className={`${theme.textMedium} ${theme.hoverTextDark} transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md`}>
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
          </div>

          <div className={`border-t ${theme.borderMedium} w-full max-w-md mb-8 transition-colors duration-500`}></div>

          <p className="text-gray-400 text-sm flex items-center justify-center">
            Made with <Heart className={`h-4 w-4 mx-1 ${theme.fillCurrent} transition-colors duration-500`} /> by something sweet © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}