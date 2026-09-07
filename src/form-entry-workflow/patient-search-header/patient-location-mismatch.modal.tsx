import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PatientLocationMismatchModal = ({ close, onConfirm, sessionLocation, hsuLocation }) => {
  const { t } = useTranslation();

  const hsuDisplay = hsuLocation?.display || t('unknown', 'Unknown');
  const sessionDisplay = sessionLocation?.display || t('unknown', 'Unknown');

  const handleConfirm = () => {
    onConfirm?.();
    close();
  };

  return (
    <>
      <ModalHeader closeModal={close}>{t('confirmPatientSelection', 'Confirm patient selection')}</ModalHeader>
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
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleConfirm}>
          {t('continue', 'Continue')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default PatientLocationMismatchModal;
