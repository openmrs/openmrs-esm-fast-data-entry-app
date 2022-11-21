import {
  ExtensionSlot,
  getGlobalStore,
  useStore,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import FormBootstrap from "../FormBootstrap";
import PatientCard from "../patient-card/PatientCard";
import styles from "./styles.scss";
import PatientSearchHeader from "./patient-search-header";
import { useTranslation } from "react-i18next";
import FormWorkflowContext, {
  FormWorkflowProvider,
} from "../context/FormWorkflowContext";
import WorkflowReview from "./workflow-review";
import PatientBanner from "./patient-banner";
import CompleteModal from "../CompleteModal";
import CancelModal from "../CancelModal";
import useStartVisit from "../hooks/useStartVisit";

const formStore = getGlobalStore("ampath-form-state");

const WorkflowNavigationButtons = () => {
  const context = useContext(FormWorkflowContext);
  const { activeFormUuid, submitForNext, workflowState, destroySession } =
    context;
  const store = useStore(formStore);
  const formState = store[activeFormUuid];
  const navigationDisabled = formState !== "ready";
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const { t } = useTranslation();

  if (!workflowState) return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button
          kind="primary"
          onClick={() => submitForNext()}
          disabled={navigationDisabled || workflowState === "NEW_PATIENT"}
        >
          {t("nextPatient", "Next Patient")}
        </Button>
        <Button
          kind="secondary"
          onClick={
            workflowState === "NEW_PATIENT"
              ? () => destroySession()
              : () => setCompleteModalOpen(true)
          }
        >
          {t("saveAndComplet", "Save & Complete 123")}
        </Button>
        <Button kind="tertiary" onClick={() => setCancelModalOpen(true)}>
          {t("cancel", "Cancel")}
        </Button>
      </div>
      <CancelModal
        open={cancelModalOpen}
        setOpen={setCancelModalOpen}
        context={context}
      />
      <CompleteModal
        open={completeModalOpen}
        setOpen={setCompleteModalOpen}
        context={context}
        validateFirst={true}
      />
    </>
  );
};

const FormWorkspace = () => {
  const {
    patientUuids,
    activePatientUuid,
    activeEncounterUuid,
    activeVisitUuid,
    saveEncounter,
    updateVisitUuid,
    activeFormUuid,
    editEncounter,
    encounters,
    submitForComplete,
    workflowState,
    singleSessionVisitTypeUuid,
  } = useContext(FormWorkflowContext);
  const { t } = useTranslation();

  const [isCreatingVisit, setIsCreatingVisit] = useState(false);

  const {
    saveVisit,
    updateVisit,
    success: visitSaveSuccess,
    isSubmitting,
  } = useStartVisit({
    showSuccessNotification: false,
    showErrorNotification: true,
  });

  const handlePostResponse = (encounter) => {
    if (encounter && encounter.uuid) {
      saveEncounter(encounter.uuid);
    }
  };

  const handleOnValidate = useCallback(
    (valid) => {
      if (valid && !activeVisitUuid && !isCreatingVisit) {
        setIsCreatingVisit(true);
        const visitStartDatetime = new Date();
        const visitStopDatetime = new Date();
        visitStartDatetime.setFullYear(visitStartDatetime.getFullYear() - 1);
        visitStopDatetime.setMinutes(visitStartDatetime.getMinutes() + 1);
        saveVisit({
          patientUuid: activePatientUuid,
          startDatetime: visitStartDatetime.toISOString(),
          stopDatetime: visitStopDatetime.toISOString(),
          visitType: "7b0f5697-27e3-40c4-8bae-f4049abfb4ed",
        });
      }
    },
    [
      activePatientUuid,
      activeVisitUuid,
      isCreatingVisit,
      singleSessionVisitTypeUuid,
    ]
  );

  // 2. save the new visit uuid and start form submission
  useEffect(() => {
    if (visitSaveSuccess) {
      const visitUuid = visitSaveSuccess?.data?.uuid;
      if (!activeVisitUuid) {
        updateVisitUuid(visitUuid);
        submitForComplete();
      }
    }
  }, [visitSaveSuccess]);

  const handleEncounterCreate = useCallback(
    (payload) => {
      payload.visit = activeVisitUuid;

      const visitStartDate = new Date(payload.encounterDatetime);
      const visitEndDate = new Date(payload.encounterDatetime);
      visitStartDate.setFullYear(visitEndDate.getFullYear() - 1);
      visitEndDate.setHours(visitEndDate.getHours() + 1);
      updateVisit({
        uuid: activeVisitUuid,
        patientUuid: activePatientUuid,
        startDatetime: visitStartDate.toISOString(),
        stopDatetime: visitEndDate.toISOString(),
        visitType: "7b0f5697-27e3-40c4-8bae-f4049abfb4ed",
      });
    },
    [activeVisitUuid]
  );

  return (
    <div className={styles.workspace}>
      {!patientUuids.length && (
        <div className={styles.selectPatientMessage}>
          {t("selectPatientFirst", "Please select a patient first")}
        </div>
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
                handleOnValidate,
                handleEncounterCreate,
              }}
            />
          </div>
          <div className={styles.rightPanel}>
            <h4>Forms filled</h4>
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
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      {workflowState === "REVIEW" && <WorkflowReview />}
      {workflowState !== "REVIEW" && (
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
