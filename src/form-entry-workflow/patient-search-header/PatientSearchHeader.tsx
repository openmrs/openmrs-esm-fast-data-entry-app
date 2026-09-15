import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@carbon/react';
import { Add, Close } from '@carbon/react/icons';
import {
  ExtensionSlot,
  interpolateUrl,
  navigate,
  showModal,
  showSnackbar,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import { useHsuIdIdentifier } from '../../hooks/location-tag.resource';
import styles from './styles.scss';

const PatientSearchHeader = () => {
  const [selectedPatientUuid, setSelectedPatientUuid] = useState();
  const { hsuIdentifier } = useHsuIdIdentifier(selectedPatientUuid);
  const { sessionLocation } = useSession();
  const { uuid: sessionLocationUuid, display: sessionLocationDisplay } = sessionLocation ?? {};
  const { uuid: hsuLocationUuid, display: hsuLocationDisplay } = hsuIdentifier?.location ?? {};
  const config = useConfig();
  const { addPatient, workflowState, activeFormUuid } = useContext(FormWorkflowContext);
  const { t } = useTranslation();

  const onPatientMismatchedLocationModalConfirm = useCallback(() => {
    addPatient(selectedPatientUuid);
    setSelectedPatientUuid(null);
  }, [addPatient, selectedPatientUuid]);

  useEffect(() => {
    setSelectedPatientUuid(null);
  }, [activeFormUuid]);

  const handleSelectPatient = useCallback((patientUuid) => {
    setSelectedPatientUuid(patientUuid);
  }, []);

  useEffect(() => {
    if (!selectedPatientUuid || !hsuLocationUuid) return;

    const locationMismatch = sessionLocationUuid !== hsuLocationUuid;

    if (config.enforcePatientListLocationMatch && locationMismatch) {
      showSnackbar({
        kind: 'error',
        title: t('locationMismatch', 'Location Mismatch'),
        subtitle: t(
          'patientLocationMismatchEnforced',
          'Cannot add patient from {{hsuLocation}} to a session at {{sessionLocation}}',
          {
            hsuLocation: hsuLocationDisplay,
            sessionLocation: sessionLocationDisplay,
          },
        ),
      });
      setSelectedPatientUuid(null);
    } else if (config.patientLocationMismatchCheck && locationMismatch) {
      let active = true;
      const dispose = showModal(
        'fde-patient-location-mismatch-modal',
        {
          onConfirm: onPatientMismatchedLocationModalConfirm,
          sessionLocation: { uuid: sessionLocationUuid, display: sessionLocationDisplay },
          hsuLocation: { uuid: hsuLocationUuid, display: hsuLocationDisplay },
        },
        () => {
          if (active) setSelectedPatientUuid(null);
        },
      );
      return () => {
        active = false;
        dispose();
      };
    } else {
      addPatient(selectedPatientUuid);
      setSelectedPatientUuid(null);
    }
  }, [
    selectedPatientUuid,
    sessionLocationUuid,
    sessionLocationDisplay,
    hsuLocationUuid,
    hsuLocationDisplay,
    addPatient,
    config.patientLocationMismatchCheck,
    config.enforcePatientListLocationMatch,
    t,
    onPatientMismatchedLocationModalConfirm,
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
    </>
  );
};

export default PatientSearchHeader;
