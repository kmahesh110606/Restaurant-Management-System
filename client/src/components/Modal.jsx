/**
 * Modal — Reusable modal dialog with backdrop.
 */  // Header docstring describing reusable modal component

import { useEffect } from 'react';  // Import useEffect hook from React
import { IoClose } from 'react-icons/io5';  // Import IoClose icon from react-icons/io5

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {  // Export Modal component receiving isOpen, onClose, title, children, and size props
  useEffect(() => {  // Effect hook to prevent body background scrolling when modal is open
    if (isOpen) {  // Check if modal dialog is currently open
      document.body.style.overflow = 'hidden';  // Disable scrolling on document body
    } else {  // If modal is closed
      document.body.style.overflow = '';  // Restore default body scrolling behavior
    }  // End conditional
    return () => {  // Cleanup function on unmount
      document.body.style.overflow = '';  // Ensure body scroll restriction is removed on unmount
    };  // End cleanup callback
  }, [isOpen]);  // Re-run effect when isOpen boolean changes

  if (!isOpen) return null;  // Return null (render nothing) if modal is not open

  const sizes = {  // Define CSS max-width class mapping for modal size variants
    sm: 'max-w-md',  // Small modal width class
    md: 'max-w-lg',  // Medium default modal width class
    lg: 'max-w-2xl',  // Large modal width class
    xl: 'max-w-4xl',  // Extra large modal width class
    full: 'max-w-6xl',  // Full width modal class
  };  // End sizes map object

  return (  // Return modal JSX structure
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>  {/* Fixed overlay container handling backdrop click */}
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />  {/* Semi-transparent dark blurred backdrop element */}

      {/* Modal */}
      <div  {/* Modal dialog content box */}
        className={`relative ${sizes[size]} w-full card-elevated p-0 animate-slide-up max-h-[90vh] flex flex-col`}  {/* Layout, sizing, and entry animation styling */}
        onClick={(e) => e.stopPropagation()}  {/* Prevent click inside modal box from bubbling up to backdrop click handler */}
      >  {/* Close modal wrapper tag */}
        {/* Header */}
        {title && (  {/* Conditionally render modal header if title is provided */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-light)]">  {/* Header container bar */}
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">{title}</h2>  {/* Modal header title heading */}
            <button onClick={onClose} className="btn-icon btn-ghost">  {/* Close button triggering onClose callback */}
              <IoClose size={20} />  {/* Render close 'X' icon */}
            </button>  {/* Close button tag */}
          </div>  {/* Close header container bar */}
        )}  {/* End conditional title check */}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">  {/* Scrollable modal body content wrapper */}
          {children}  {/* Render passed child elements inside modal body */}
        </div>  {/* Close content wrapper */}
      </div>  {/* Close modal container element */}
    </div>  {/* Close fixed backdrop overlay element */}
  );  // End return statement
}  // End Modal component

