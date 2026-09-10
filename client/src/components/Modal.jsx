/**
 * Modal — Glassmorphic modal dialog with backdrop blur.
 * Supports configurable sizes, close on backdrop/escape, and Framer Motion animations.
 */

import { useEffect, useCallback } from 'react';
import { DismissRegular } from '@fluentui/react-icons';

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 glass-overlay animate-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative glass-modal w-full ${sizeClasses[size]} max-h-[85vh] overflow-y-auto p-6 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-5">
            {title && (
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors ml-auto"
                aria-label="Close"
              >
                <DismissRegular fontSize={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
