import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PatientLocationMismatchModal = ({ open, setOpen, onConfirm, onCancel, sessionLocation, hsuLocation }) => {
  const { t } = useTranslation();

  const hsuDisplay = hsuLocation?.display || t('unknown', 'Unknown');
  const sessionDisplay = sessionLocation?.display || t('unknown', 'Unknown');

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  return (
    <ComposedModal open={open} onClose={handleCancel}>
      <ModalHeader>{t('confirmPatientSelection', 'Confirm patient selection')}</ModalHeader>
      <ModalBody>
        {t(
          'patientLocationMismatch',
          `The selected HSU location (${hsuLocation}) does not match the current session location (${sessionLocation}). Are you sure you want to proceed?`,
          {
            hsuLocation: hsuDisplay,
            sessionLocation: sessionDisplay,
          },
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={handleCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleConfirm}>
          {t('continue', 'Continue')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default PatientLocationMismatchModal;
