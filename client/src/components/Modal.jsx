import { useId } from 'react';
import { createPortal } from 'react-dom';
import { DismissRegular } from '@fluentui/react-icons';
import useDialog from './useDialog';

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const titleId = useId();
  const ref = useDialog(isOpen, onClose);
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' };
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }} style={{ background: 'rgba(15,23,42,.45)' }}>
      <section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : 'Dialog'} className={`bg-white rounded-xl p-6 w-full ${sizes[size] || sizes.md} max-h-[85dvh] overflow-y-auto shadow-xl`}>
        {(title || showClose) && <div className="flex items-center justify-between gap-4 mb-5">{title && <h2 id={titleId} className="text-lg font-bold text-gray-900">{title}</h2>}{showClose && <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 ml-auto" aria-label="Close dialog"><DismissRegular fontSize={20} /></button>}</div>}
        {children}
      </section>
    </div>, document.body,
  );
}
