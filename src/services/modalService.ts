import { AlertType } from '../components/ui/AlertModal';

type AlertOptions = {
  type: AlertType;
  title: string;
  message: string;
  buttonText?: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
};

type ModalState = {
  alert: {
    isOpen: boolean;
    options: AlertOptions | null;
  };
  confirm: {
    isOpen: boolean;
    options: ConfirmOptions | null;
    onConfirm: (() => void) | null;
  };
};

class ModalService {
  private listeners: ((state: ModalState) => void)[] = [];
  private state: ModalState = {
    alert: { isOpen: false, options: null },
    confirm: { isOpen: false, options: null, onConfirm: null }
  };

  subscribe(listener: (state: ModalState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Alert methods
  showAlert(options: AlertOptions) {
    this.state = {
      ...this.state,
      alert: { isOpen: true, options }
    };
    this.notify();
  }

  hideAlert() {
    this.state = {
      ...this.state,
      alert: { isOpen: false, options: null }
    };
    this.notify();
  }

  showSuccess(title: string, message: string, buttonText?: string) {
    this.showAlert({ type: 'success', title, message, buttonText });
  }

  showError(title: string, message: string, buttonText?: string) {
    this.showAlert({ type: 'error', title, message, buttonText });
  }

  showWarning(title: string, message: string, buttonText?: string) {
    this.showAlert({ type: 'warning', title, message, buttonText });
  }

  showInfo(title: string, message: string, buttonText?: string) {
    this.showAlert({ type: 'info', title, message, buttonText });
  }

  // Confirm methods
  showConfirm(options: ConfirmOptions, onConfirm: () => void) {
    this.state = {
      ...this.state,
      confirm: { isOpen: true, options, onConfirm }
    };
    this.notify();
  }

  hideConfirm() {
    this.state = {
      ...this.state,
      confirm: { isOpen: false, options: null, onConfirm: null }
    };
    this.notify();
  }

  confirmAction(
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<ConfirmOptions>
  ) {
    this.showConfirm({ title, message, ...options }, onConfirm);
  }

  confirmDelete(
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm Delete'
  ) {
    this.showConfirm({
      title,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }, onConfirm);
  }

  getState() {
    return this.state;
  }
}

// Create a singleton instance
export const modalService = new ModalService();

// Export convenience functions that can be imported individually
export const showSuccess = modalService.showSuccess.bind(modalService);
export const showError = modalService.showError.bind(modalService);
export const showWarning = modalService.showWarning.bind(modalService);
export const showInfo = modalService.showInfo.bind(modalService);
export const confirmDelete = modalService.confirmDelete.bind(modalService);
export const confirmAction = modalService.confirmAction.bind(modalService); 