import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Menu } from './components/Menu';
import { Footer } from './components/Footer';
import { ThemeProvider, useTheme } from './ThemeContext';
import { CartProvider } from './CartContext';
import { CartSidebar } from './components/CartSidebar';
import { Toaster } from 'sonner';
import 'react-day-picker/dist/style.css'; // Add react-day-picker styles

function AppContent() {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen bg-white font-sans ${theme.selectionBg} ${theme.selectionText}`}>
      <Header />
      
      {/* Pre-order Disclaimer Banner */}
      <div className={`pt-20 bg-yellow-50 border-b border-yellow-200 text-yellow-800 px-4 py-3 text-sm text-center font-medium`}>
        🍰 Please note: All our bakes are strictly for <strong>Pre-order only</strong>. Freshly baked for your chosen date!
      </div>

      <main>
        <Hero />
        <Menu />
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Toaster position="top-center" />
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}