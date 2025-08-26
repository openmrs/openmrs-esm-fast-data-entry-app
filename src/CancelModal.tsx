import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CancelModal = ({ open, setOpen, context }) => {
  const { t } = useTranslation();

  const onCancel = () => setOpen(false);

  const onDiscard = async () => {
    await context.destroySession();
  };

  const onSaveAndClose = async () => {
    await context.closeSession();
  };

  return (
    <ComposedModal open={open} preventCloseOnClickOutside={true} onClose={onCancel}>
      <ModalHeader>{t('areYouSure', 'Are you sure?')}</ModalHeader>
      <ModalBody>
        {t(
          'cancelExplanation',
          'You will lose any unsaved changes on the current form. Do you want to discard the current session?',
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onDiscard}>
          {t('discard', 'Discard')}
        </Button>
        <Button kind="primary" onClick={onSaveAndClose}>
          {t('saveSession', 'Save Session')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default CancelModal;
