'use client';

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from 'react';

import { Cross2Icon } from '@radix-ui/react-icons';
import * as Toast from '@radix-ui/react-toast';
import { Flex } from '@radix-ui/themes';

import './Toast.scss'; // We'll create this file for styles

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info'; // Add variants as needed
  duration?: number;
}

interface ToastContextProps {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastState extends ToastOptions {
  id: string;
  open: boolean;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString(); // Simple unique ID
    const newToast: ToastState = {
      ...options,
      id,
      open: true,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const handleOpenChange = (id: string, open: boolean) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) => (toast.id === id ? { ...toast, open } : toast))
    );
    // Optional: Remove toast from state after it's closed and animation finishes
    if (!open) {
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, 500); // Adjust timeout based on animation duration
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map(
          ({
            id,
            open,
            title,
            description,
            variant = 'info',
            duration = 5000,
          }) => (
            <Toast.Root
              key={id}
              className={`ToastRoot ToastRoot--${variant}`}
              open={open}
              onOpenChange={(isOpen) => handleOpenChange(id, isOpen)}
              duration={duration}
            >
              <Flex direction="column" gap="1">
                <Toast.Title className="ToastTitle">{title}</Toast.Title>
                {description && (
                  <Toast.Description className="ToastDescription">
                    {description}
                  </Toast.Description>
                )}
              </Flex>
              <Toast.Close className="ToastClose" aria-label="Close">
                <Cross2Icon />
              </Toast.Close>
            </Toast.Root>
          )
        )}
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const ToastViewport = () => <Toast.Viewport className="ToastViewport" />;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
