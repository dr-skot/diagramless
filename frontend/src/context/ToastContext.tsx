import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; duration: number; key: number } | null>(null);

  useEffect(() => {
    // This effect is intentionally left empty to track toast state changes
  }, [toast]);

  const showToast = (message: string, duration = 3000) => {
    // Use functional form of setState to avoid stale closures
    setToast(prevToast => {
      // If showing the same message, increment the key to trigger animation
      if (prevToast && prevToast.message === message) {
        return { message, duration, key: prevToast.key + 1 };
      } else {
        // New message, start with key 1
        return { message, duration, key: 1 };
      }
    });
  };

  const handleClose = () => {
    setToast(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (toast) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toast]);
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          duration={toast.duration}
          onClose={handleClose}
          animationKey={toast.key}
        />
      )}
    </ToastContext.Provider>
  );
};
