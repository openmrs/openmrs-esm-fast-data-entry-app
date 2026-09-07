import { useCallback, useEffect, useRef } from 'react';
import { showModal } from '@openmrs/esm-framework';

export default function useModalLauncher(ownerKey?: string) {
  const dispose = useRef<(notifyOnClose?: boolean) => void>();
  const owner = useRef({ active: true });

  useEffect(() => {
    const currentOwner = { active: true };
    owner.current = currentOwner;
    return () => {
      currentOwner.active = false;
      dispose.current?.(true);
    };
  }, [ownerKey]);

  return useCallback((name: string, props: Parameters<typeof showModal>[1] = {}, onClose?: () => void) => {
    dispose.current?.();
    const currentOwner = owner.current;
    let closed = false;
    const close = showModal(name, { ...props, isOwnerMounted: () => currentOwner.active }, () => {
      const dismissedByUser = !closed;
      closed = true;
      if (dispose.current === disposeModal) {
        dispose.current = undefined;
      }
      if (dismissedByUser) {
        onClose?.();
      }
    });
    // Effect cleanup may replace a dialog without cancelling the pending selection.
    const disposeModal = (notifyOnClose = false) => {
      if (!closed) {
        closed = true;
        close();
        if (notifyOnClose) {
          onClose?.();
        }
      }
    };
    dispose.current = disposeModal;
    return disposeModal;
  }, []);
}
