import React, { useEffect, useState } from 'react';
import { modalService } from '../../services/modalService';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';

const GlobalModalProvider: React.FC = () => {
  const [modalState, setModalState] = useState(modalService.getState());

  useEffect(() => {
    const unsubscribe = modalService.subscribe(setModalState);
    return unsubscribe;
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (modalState.alert.isOpen) {
          modalService.hideAlert();
        } else if (modalState.confirm.isOpen) {
          modalService.hideConfirm();
        }
      }
    };

    if (modalState.alert.isOpen || modalState.confirm.isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [modalState.alert.isOpen, modalState.confirm.isOpen]);

  return (
    <>
      {/* Alert Modal */}
      {modalState.alert.isOpen && modalState.alert.options && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => modalService.hideAlert()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AlertModal
              isOpen={modalState.alert.isOpen}
              onClose={() => modalService.hideAlert()}
              type={modalState.alert.options.type}
              title={modalState.alert.options.title}
              message={modalState.alert.options.message}
              buttonText={modalState.alert.options.buttonText}
            />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {modalState.confirm.isOpen && modalState.confirm.options && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => modalService.hideConfirm()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ConfirmModal
              isOpen={modalState.confirm.isOpen}
              onClose={() => modalService.hideConfirm()}
              onConfirm={modalState.confirm.onConfirm || (() => {})}
              title={modalState.confirm.options.title}
              message={modalState.confirm.options.message}
              confirmText={modalState.confirm.options.confirmText}
              cancelText={modalState.confirm.options.cancelText}
              type={modalState.confirm.options.type}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalModalProvider; 