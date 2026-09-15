import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Button } from '@carbon/react';
import { ExtensionSlot, showModal, useSession } from '@openmrs/esm-framework';
import FormWorkflowContext, { FormWorkflowProvider } from '../context/FormWorkflowContext';
import FormBootstrap from '../FormBootstrap';
import useStartVisit from '../hooks/useStartVisit';
import PatientCard from '../patient-card/PatientCard';
import PatientBanner from './patient-banner';
import PatientSearchHeader from './patient-search-header';
import WorkflowReview from './workflow-review';
import styles from './styles.scss';

const WorkflowNavigationButtons = () => {
  const context = useContext(FormWorkflowContext);
  const { workflowState, destroySession } = context;
  const disposeModal = useRef<() => void>();
  useEffect(
    () => () => {
      disposeModal.current?.();
    },
    [context.activeFormUuid],
  );
  const { t } = useTranslation();

  if (!workflowState) return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button
          kind="secondary"
          onClick={
            workflowState === 'NEW_PATIENT'
              ? () => destroySession()
              : () => {
                  disposeModal.current?.();
                  disposeModal.current = showModal('fde-complete-session-modal', {
                    onComplete: context.submitForComplete,
                  });
                }
          }
        >
          {t('saveAndComplete', 'Save & Complete')}
        </Button>
        <Button
          kind="tertiary"
          onClick={() => {
            disposeModal.current?.();
            disposeModal.current = showModal('fde-cancel-session-modal', {
              onDiscard: context.destroySession,
              onSaveAndClose: context.closeSession,
            });
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </>
  );
};

const FormWorkspace = () => {
  const {
    patientUuids,
    activePatientUuid,
    activeEncounterUuid,
    saveEncounter,
    activeFormUuid,
    editEncounter,
    encounters,
    singleSessionVisitTypeUuid,
  } = useContext(FormWorkflowContext);
  const { t } = useTranslation();

  const [encounter, setEncounter] = useState(null);
  const [visit, setVisit] = useState(null);
  const { sessionLocation } = useSession();

  const { updateEncounter, success: visitSaveSuccess } = useStartVisit({
    showSuccessNotification: false,
    showErrorNotification: true,
  });

  const handlePostResponse = (encounter) => {
    if (encounter && encounter.uuid) {
      saveEncounter(encounter.uuid);
      setEncounter(encounter);
    }
  };

  useEffect(() => {
    if (encounter && visit) {
      // Update the encounter so that it belongs to the created visit
      updateEncounter({ uuid: encounter.uuid, visit: visit.uuid });
    }
  }, [encounter, visit, updateEncounter]);

  useEffect(() => {
    if (visitSaveSuccess) {
      setVisit(visitSaveSuccess.data);
    }
  }, [visitSaveSuccess]);

  const handleEncounterCreate = useCallback(
    (payload) => {
      payload.location = sessionLocation?.uuid;
      payload.encounterDatetime = payload.encounterDatetime ? payload.encounterDatetime : new Date().toISOString();
      // Create a visit with the same date as the encounter being saved
      const visitStartDatetime = new Date(payload.encounterDatetime);
      const visitStopDatetime = new Date(payload.encounterDatetime);
      const visitInfo = {
        startDatetime: visitStartDatetime,
        stopDatetime: visitStopDatetime,
        uuid: uuid(),
        patient: {
          uuid: activePatientUuid,
        },
        location: {
          uuid: sessionLocation?.uuid,
        },
        visitType: {
          uuid: singleSessionVisitTypeUuid,
        },
      };

      payload.visit = visitInfo;
    },
    [activePatientUuid, singleSessionVisitTypeUuid, sessionLocation],
  );

  return (
    <div className={styles.workspace}>
      {!patientUuids.length && (
        <div className={styles.selectPatientMessage}>{t('selectPatientFirst', 'Please select a patient first')}</div>
      )}
      {!!patientUuids.length && (
        <div className={styles.formMainContent}>
          <div className={styles.formContainer}>
            <FormBootstrap
              patientUuid={activePatientUuid}
              encounterUuid={activeEncounterUuid}
              {...{
                formUuid: activeFormUuid,
                handlePostResponse,
                handleEncounterCreate,
              }}
              hidePatientBanner={true}
            />
          </div>
          <div className={styles.rightPanel}>
            <h4>{t('formsFilled', 'Forms filled')}</h4>
            <div className={styles.patientCardsSection}>
              {patientUuids.map((patientUuid) => (
                <PatientCard
                  key={patientUuid}
                  {...{
                    patientUuid,
                    activePatientUuid,
                    editEncounter,
                    encounters,
                  }}
                />
              ))}
            </div>
            <WorkflowNavigationButtons />
          </div>
        </div>
      )}
    </div>
  );
};

const FormEntryWorkflow = () => {
  const { workflowState } = useContext(FormWorkflowContext);
  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot name="breadcrumbs-slot" />
      </div>
      {workflowState === 'REVIEW' && <WorkflowReview />}
      {workflowState !== 'REVIEW' && (
        <>
          <PatientSearchHeader />
          <PatientBanner />
          <div className={styles.workspaceWrapper}>
            <FormWorkspace />
          </div>
        </>
      )}
    </>
  );
};

const FormEntryWorkflowWrapper = () => {
  return (
    <FormWorkflowProvider>
      <FormEntryWorkflow />
    </FormWorkflowProvider>
  );
};

export default FormEntryWorkflowWrapper;
