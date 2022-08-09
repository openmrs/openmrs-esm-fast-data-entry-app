import {
  ExtensionSlot,
  getGlobalStore,
  useStore,
} from "@openmrs/esm-framework";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "carbon-components-react";
import React, { useContext, useState } from "react";
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
    destroySession,
    closeSession,
  } = useContext(FormWorkflowContext);
  const history = useHistory();
  const store = useStore(formStore);
  const formState = store[activeFormUuid];
  const navigationDisabled = formState !== "ready";
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const discard = () => {
    destroySession();
    setModalOpen(false);
    history.push("/");
  };

  const saveAndClose = () => {
    closeSession();
    setModalOpen(false);
    history.push("/");
  };

  if (!workflowState) return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        formState {formState}
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
              ? () => goToReview()
              : () => submitForReview()
          }
        >
          {t("reviewSave", "Review & Save")}
        </Button>
        <Button kind="tertiary" onClick={() => setModalOpen(true)}>
          {t("cancel", "Cancel")}
        </Button>
      </div>
      <ComposedModal open={modalOpen}>
        <ModalHeader>Confirm</ModalHeader>
        <ModalBody>Are you sure?</ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={discard}>
            Discard
          </Button>
          <Button kind="primary" onClick={saveAndClose}>
            Save Session
          </Button>
        </ModalFooter>
      </ComposedModal>
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
      WorkflowState: {workflowState}
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
