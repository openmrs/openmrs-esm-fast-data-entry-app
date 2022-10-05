import {
  ExtensionSlot,
  getGlobalStore,
  useStore,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useContext, useState } from "react";
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
          {t("saveAndComplete", "Save & Complete")}
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
      />
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
  } = useContext(FormWorkflowContext);
  const { t } = useTranslation();

  const handlePostResponse = (encounter) => {
    if (encounter && encounter.uuid) {
      saveEncounter(encounter.uuid);
    }
  };

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
