import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CompleteModal = ({ open, setOpen, context, validateFirst = false }) => {
  const { t } = useTranslation();

  const onCancel = () => setOpen(false);

  const onComplete = () => {
    if (validateFirst) {
      context.validateForComplete();
    } else {
      context.submitForComplete();
    }
    setOpen(false);
  };

  return (
    <ComposedModal open={open}>
      <ModalHeader>{t('areYouSure', 'Are you sure?')}</ModalHeader>
      <ModalBody>{t('saveExplanation', 'Do you want to save the current form and exit the workflow?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={onComplete}>
          {t('complete', 'Complete')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default CompleteModal;
