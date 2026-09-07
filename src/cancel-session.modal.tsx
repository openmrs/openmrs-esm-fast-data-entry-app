import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CancelSessionModalProps {
  close: () => void;
  onDiscard: () => void | Promise<void>;
  onSaveAndClose: () => void | Promise<void>;
}

const CancelModal: React.FC<CancelSessionModalProps> = ({ close, onDiscard, onSaveAndClose }) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader closeModal={close}>{t('areYouSure', 'Are you sure?')}</ModalHeader>
      <ModalBody>
        {t(
          'cancelExplanation',
          'You will lose any unsaved changes on the current form. Do you want to discard the current session?',
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={async () => {
            await onDiscard();
            close();
          }}
        >
          {t('discard', 'Discard')}
        </Button>
        <Button
          kind="primary"
          onClick={async () => {
            await onSaveAndClose();
            close();
          }}
        >
          {t('saveSession', 'Save Session')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default CancelModal;
