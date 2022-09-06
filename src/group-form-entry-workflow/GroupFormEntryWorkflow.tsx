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
  Layer,
  Tile,
  TextInput,
  TextArea,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "../patient-card/PatientCard";
import GroupBanner from "./group-banner";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext, {
  GroupFormWorkflowProvider,
} from "../context/GroupFormWorkflowContext";
import GroupSearchHeader from "./group-search-header";

const formStore = getGlobalStore("ampath-form-state");

const CancelModal = ({ open, setOpen }) => {
  const { destroySession, closeSession } = useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const discard = async () => {
    await destroySession();
    setOpen(false);
    navigate("../");
  };

  const saveAndClose = async () => {
    await closeSession();
    setOpen(false);
    navigate("../");
  };

  return (
    <ComposedModal open={open}>
      <ModalHeader>{t("areYouSure", "Are you sure?")}</ModalHeader>
      <ModalBody>
        {t(
          "cancelExplanation",
          "You will lose any unsaved changes on the current form. Do you want to discard the current session?"
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => setOpen(false)}>
          {t("cancel", "Cancel")}
        </Button>
        <Button kind="danger" onClick={discard}>
          {t("discard", "Discard")}
        </Button>
        <Button kind="primary" onClick={saveAndClose}>
          {t("saveSession", "Save Session")}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

const CompleteModal = ({ open, setOpen }) => {
  const { submitForComplete } = useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();

  const completeSession = () => {
    submitForComplete();
    setOpen(false);
  };

  return (
    <ComposedModal open={open}>
      <ModalHeader>{t("areYouSure", "Are you sure?")}</ModalHeader>
      <ModalBody>
        {t(
          "saveExplanation",
          "Do you want to save the current form and exit the workflow?"
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => setOpen(false)}>
          {t("cancel", "Cancel")}
        </Button>
        <Button kind="primary" onClick={completeSession}>
          {t("complete", "Complete")}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

const WorkflowNavigationButtons = () => {
  const { activeFormUuid, submitForNext, workflowState, destroySession } =
    useContext(GroupFormWorkflowContext);
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
      <CancelModal open={cancelModalOpen} setOpen={setCancelModalOpen} />
      <CompleteModal open={completeModalOpen} setOpen={setCompleteModalOpen} />
    </>
  );
};

const SessionDetails = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.formSection}>
      <h4>{t("sessionDetails", "Session details")}</h4>
      <div>
        <p>
          {t(
            "allFieldsRequired",
            "All fields are required unless marked optional"
          )}
        </p>
      </div>
      <Layer>
        <Tile className={styles.formSectionTile}>
          <Layer>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "1.5rem",
              }}
            >
              <TextInput
                id="text"
                type="text"
                labelText={t("sessionName", "Session Name")}
              />
              <TextInput
                id="text"
                type="text"
                labelText={t("practitionerName", "Practitioner Name")}
              />
              <DatePicker datePickerType="single" size="md">
                <DatePickerInput
                  id="session-date"
                  labelText={t("sessionDate", "Session Date")}
                  placeholder="mm/dd/yyyy"
                  size="md"
                />
              </DatePicker>
              <TextArea
                id="text"
                type="text"
                labelText={t("description", "Description")}
              />
            </div>
          </Layer>
        </Tile>
      </Layer>
    </div>
  );
};

const GroupFormWorkspace = () => {
  const { patientUuids } = useContext(GroupFormWorkflowContext);

  return (
    <div className={styles.workspace}>
      <div className={styles.formMainContent}>
        <div className={styles.formContainer}>
          <SessionDetails />
        </div>
        <div className={styles.rightPanel}>
          <h4>Forms filled</h4>
          <div className={styles.patientCardsSection}>
            {patientUuids?.map((patientUuid) => (
              <PatientCard patientUuid={patientUuid} key={patientUuid} />
            ))}
          </div>
          <WorkflowNavigationButtons />
        </div>
      </div>
    </div>
  );
};

const GroupFormEntryWorkflow = () => {
  const { workflowState, activeGroupUuid } = useContext(
    GroupFormWorkflowContext
  );

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      {workflowState !== "REVIEW" && (
        <>
          <GroupSearchHeader />
          <GroupBanner />
          <div className={styles.workspaceWrapper}>
            <GroupFormWorkspace />
          </div>
        </>
      )}
      WorkflowState: {workflowState}
      Group: {activeGroupUuid}
    </>
  );
};

const GroupFormEntryWorkflowWrapper = () => {
  return (
    <GroupFormWorkflowProvider>
      <GroupFormEntryWorkflow />
    </GroupFormWorkflowProvider>
  );
};

export default GroupFormEntryWorkflowWrapper;
