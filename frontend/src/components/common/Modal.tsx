import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
}: ModalProps) => {
  const [modalElement, setModalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create modal container element
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    document.body.appendChild(modalContainer);
    setModalElement(modalContainer);

    // Add body overflow hidden when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
      if (modalContainer && modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    };
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Get modal size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-full max-h-full';
      default: return 'max-w-md';
    }
  };

  if (!isOpen || !modalElement) return null;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black bg-opacity-50
        backdrop-blur-sm
        ${overlayClassName}
      `}
      onClick={handleOverlayClick}
    >
      <div
        className={`
          bg-white
          rounded-lg
          shadow-xl
          overflow-hidden
          ${getSizeStyles()}
          w-full
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="modal-content p-4">
          {children}
        </div>
      </div>
    </div>
  , modalElement);
};

// Modal footer component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = ''
}) => (
  <div className={`modal-footer p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

