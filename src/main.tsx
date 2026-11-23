import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CatalogProvider } from './context/CatalogContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <CatalogProvider>
            <CartProvider>
              <WishlistProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </WishlistProvider>
            </CartProvider>
          </CatalogProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
