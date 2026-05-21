import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const ConfirmContext = createContext(null);

/**
 * Promise-based confirmation dialog.
 * Usage:  const confirm = useConfirm();
 *         if (await confirm({ title, message, danger: true })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        danger: options.danger || false,
      });
    });
  }, []);

  const settle = (result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal isOpen={!!dialog} onClose={() => settle(false)} title={dialog?.title || ''}>
        {dialog && (
          <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed">{dialog.message}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => settle(false)}>
                {dialog.cancelLabel}
              </Button>
              <Button
                variant={dialog.danger ? 'danger' : 'primary'}
                onClick={() => settle(true)}
              >
                {dialog.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
