import { useState, useCallback } from 'react';
import { AlertType } from '../components/ui/AlertModal';

interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  buttonText?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const useModal = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions | null;
  }>({
    isOpen: false,
    options: null
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    options: null,
    onConfirm: null
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      options
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState({
      isOpen: false,
      options: null
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions, onConfirm: () => void) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        onConfirm: () => {
          onConfirm();
          resolve(true);
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState({
      isOpen: false,
      options: null,
      onConfirm: null
    });
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, buttonText?: string) => {
    showAlert({ type: 'success', title, message, buttonText });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, buttonText?: string) => {
    showAlert({ type: 'error', title, message, buttonText });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, buttonText?: string) => {
    showAlert({ type: 'warning', title, message, buttonText });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, buttonText?: string) => {
    showAlert({ type: 'info', title, message, buttonText });
  }, [showAlert]);

  const confirmAction = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<ConfirmOptions>
  ) => {
    return showConfirm({ title, message, ...options }, onConfirm);
  }, [showConfirm]);

  const confirmDelete = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm Delete'
  ) => {
    return showConfirm({
      title,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }, onConfirm);
  }, [showConfirm]);

  return {
    // Alert state and methods
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Confirm state and methods
    confirmState,
    showConfirm,
    hideConfirm,
    confirmAction,
    confirmDelete
  };
}; 