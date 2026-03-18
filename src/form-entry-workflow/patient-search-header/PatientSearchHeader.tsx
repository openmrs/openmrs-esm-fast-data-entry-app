import { Add, Close } from '@carbon/react/icons';
import { ExtensionSlot, interpolateUrl, navigate, useConfig, useSession, showSnackbar } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';
import { useHsuIdIdentifier } from '../../hooks/location-tag.resource';
import PatientLocationMismatchModal from './PatienMismatchedLocationModal';

const PatientSearchHeader = () => {
  const [patientLocationMismatchModalOpen, setPatientLocationMismatchModalOpen] = useState(false);
  const [selectedPatientUuid, setSelectedPatientUuid] = useState();
  const { hsuIdentifier } = useHsuIdIdentifier(selectedPatientUuid);
  const { sessionLocation } = useSession();
  const config = useConfig();
  const { addPatient, workflowState, activeFormUuid } = useContext(FormWorkflowContext);
  const { t } = useTranslation();

  const onPatientMismatchedLocationModalConfirm = useCallback(() => {
    addPatient(selectedPatientUuid);
    setSelectedPatientUuid(null);
  }, [addPatient, selectedPatientUuid]);

  const onPatientMismatchedLocationModalCancel = useCallback(() => {
    setPatientLocationMismatchModalOpen(false);
    setSelectedPatientUuid(null);
  }, []);

  const handleSelectPatient = useCallback((patientUuid) => {
    setSelectedPatientUuid(patientUuid);
  }, []);

  useEffect(() => {
    if (!selectedPatientUuid || !hsuIdentifier) return;

    const locationMismatch = sessionLocation.uuid !== hsuIdentifier.location.uuid;

    if (config.enforcePatientListLocationMatch && locationMismatch) {
      showSnackbar({
        kind: 'error',
        title: t('locationMismatch', 'Location Mismatch'),
        subtitle: t(
          'patientLocationMismatchEnforced',
          'Cannot add patient from {{hsuLocation}} to a session at {{sessionLocation}}',
          {
            hsuLocation: hsuIdentifier.location?.display,
            sessionLocation: sessionLocation?.display,
          },
        ),
      });
      setSelectedPatientUuid(null);
    } else if (config.patientLocationMismatchCheck && locationMismatch) {
      setPatientLocationMismatchModalOpen(true);
    } else {
      addPatient(selectedPatientUuid);
      setSelectedPatientUuid(null);
    }
  }, [
    selectedPatientUuid,
    sessionLocation,
    hsuIdentifier,
    addPatient,
    config.patientLocationMismatchCheck,
    config.enforcePatientListLocationMatch,
    t,
  ]);

  if (workflowState !== 'NEW_PATIENT') return null;

  const afterUrl = encodeURIComponent(`\${openmrsSpaBase}/forms/form/${activeFormUuid}?patientUuid=\${patientUuid}`);
  const patientRegistrationUrl = interpolateUrl(`\${openmrsSpaBase}/patient-registration?afterUrl=${afterUrl}`);

  return (
    <>
      <div className={styles.searchHeaderContainer}>
        <span className={styles.padded}>{t('nextPatient', 'Next patient')}:</span>
        <span className={styles.searchBarWrapper}>
          <ExtensionSlot
            name="patient-search-bar-slot"
            state={{
              selectPatientAction: handleSelectPatient,
              buttonProps: {
                kind: 'primary',
              },
            }}
          />
        </span>
        <span className={styles.padded}>{t('or', 'or')}</span>
        <span>
          <Button onClick={() => navigate({ to: patientRegistrationUrl })}>
            {t('createNewPatient', 'Create new patient')} <Add size={20} />
          </Button>
        </span>
        <span style={{ flexGrow: 1 }} />
        <span>
          <Link to="../">
            <Button kind="ghost">
              {t('cancel', 'Cancel')} <Close size={20} />
            </Button>
          </Link>
        </span>
      </div>
      <PatientLocationMismatchModal
        open={patientLocationMismatchModalOpen}
        setOpen={setPatientLocationMismatchModalOpen}
        onConfirm={onPatientMismatchedLocationModalConfirm}
        onCancel={onPatientMismatchedLocationModalCancel}
        sessionLocation={sessionLocation}
        hsuLocation={hsuIdentifier?.location}
      />
    </>
  );
};

export default PatientSearchHeader;
