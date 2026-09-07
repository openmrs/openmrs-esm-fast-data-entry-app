import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CompleteSessionModalProps {
  close: () => void;
  onComplete: () => void;
}

const CompleteModal: React.FC<CompleteSessionModalProps> = ({ close, onComplete }) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader closeModal={close}>{t('areYouSure', 'Are you sure?')}</ModalHeader>
      <ModalBody>{t('saveExplanation', 'Do you want to save the current form and exit the workflow?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            onComplete();
            close();
          }}
        >
          {t('complete', 'Complete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default CompleteModal;
