import {
  ExtensionSlot,
  getGlobalStore,
  useStore,
} from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import FormBootstrap from "../FormBootstrap";
import PatientCard from "../patient-card/PatientCard";
import PatientBanner from "../patient-banner";
import styles from "./styles.scss";
import PatientSearchHeader from "../patient-search-header";
import { useTranslation } from "react-i18next";
import FormWorkflowContext, {
  FormWorkflowProvider,
} from "../context/FormWorkflowContext";
import WorkflowReview from "../workflow-review";

const formStore = getGlobalStore("ampath-form-state");

const WorkflowNavigationButtons = () => {
  const {
    activeFormUuid,
    submitForReview,
    submitForNext,
    workflowState,
    goToReview,
  } = useContext(FormWorkflowContext);
  const history = useHistory();
  const store = useStore(formStore);
  const formState = store[activeFormUuid];
  const navigationDisabled = formState !== "ready";
  const { t } = useTranslation();

  if (!workflowState) return null;

  return (
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
        disabled={navigationDisabled}
        onClick={
          workflowState === "NEW_PATIENT"
            ? () => goToReview()
            : () => submitForReview()
        }
      >
        {t("reviewSave", "Review & Save")}
      </Button>
      <Button
        kind="tertiary"
        onClick={() => history.push("/")}
        disabled={navigationDisabled}
      >
        {t("cancel", "Cancel")}
      </Button>
    </div>
  );
};

const FormWorkspace = () => {
  const {
    patientUuids,
    activePatientUuid,
    activeEncounterUuid,
    saveEncounter,
    activeFormUuid,
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
                <PatientCard patientUuid={patientUuid} key={patientUuid} />
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
