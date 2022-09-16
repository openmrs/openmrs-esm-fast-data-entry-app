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
} from "@carbon/react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "../patient-card/PatientCard";
import GroupBanner from "./group-banner";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext, {
  GroupFormWorkflowProvider,
} from "../context/GroupFormWorkflowContext";
import GroupSearchHeader from "./group-search-header";
import FormBootstrap from "../FormBootstrap";
import SessionMetaWorkspace from "./session-meta-workspace/SessionMetaWorkspace";
import { usePostVisit } from "../hooks";

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
  const { activeFormUuid, validateForNext, patientUuids, activePatientUuid } =
    useContext(GroupFormWorkflowContext);
  const store = useStore(formStore);
  const formState = store[activeFormUuid];
  const navigationDisabled = formState !== "ready";
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const { t } = useTranslation();

  const isLastPatient =
    activePatientUuid === patientUuids[patientUuids.length - 1];

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button
          kind="primary"
          onClick={() => validateForNext()}
          disabled={navigationDisabled}
        >
          {isLastPatient
            ? t("saveForm", "Save Form")
            : t("nextPatient", "Next Patient")}
        </Button>
        <Button kind="secondary" onClick={() => setCompleteModalOpen(true)}>
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

const GroupSessionWorkspace = () => {
  const { t } = useTranslation();
  const {
    patientUuids,
    activePatientUuid,
    editEncounter,
    encounters,
    activeEncounterUuid,
    activeFormUuid,
    saveEncounter,
    visitTypeUuid,
    submitForNext,
    activeVisitUuid,
    workflowState,
    createVisitForNext,
    updateVisitAndSubmitForNext,
    // activeSessionMeta,
  } = useContext(GroupFormWorkflowContext);
  const { post: createVisit, result, error } = usePostVisit();

  // const handleEncounterCreate = (payload: Record<string, unknown>) => {
  //   console.log("payload", payload);
  //   Object.entries(activeSessionMeta).forEach((key, value) => {
  //     payload[key as unknown as string] = value;
  //   });
  // };

  const handlePostResponse = (encounter) => {
    if (encounter && encounter.uuid) {
      saveEncounter(encounter.uuid);
    }
  };

  const handleOnValidate = (valid: boolean) => {
    if (!visitTypeUuid) {
      console.error(
        "Missing visit type. This will not be able to save the form with a visit"
      );
    } else if (valid) {
      // I'm worried about this being synchronous
      if (valid) {
        createVisit({
          patient: activePatientUuid,
          visitType: visitTypeUuid,
        });
        createVisitForNext();
      }
    }
  };

  useEffect(() => {
    if (result && workflowState === "CREATING_VISIT_FOR_NEXT") {
      // trigger form post
      updateVisitAndSubmitForNext(result.uuid);
    }
    if (error) {
      console.log("error");
    }
  }, [
    result,
    error,
    submitForNext,
    updateVisitAndSubmitForNext,
    workflowState,
  ]);

  const handleEncounterCreate = (encounter) => {
    encounter.visitUuid = activeVisitUuid;
  };

  return (
    <div className={styles.workspace}>
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
          <h4>{t("formsFilled", "Forms filled")}</h4>
          <div className={styles.patientCardsSection}>
            {patientUuids?.map((patientUuid) => (
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
    </div>
  );
};

const GroupFormEntryWorkflow = () => {
  const { workflowState } = useContext(GroupFormWorkflowContext);

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      <GroupSearchHeader />
      <GroupBanner />
      {workflowState === "NEW_GROUP_SESSION" && (
        <div className={styles.workspaceWrapper}>
          <SessionMetaWorkspace />
        </div>
      )}
      {workflowState !== "NEW_GROUP_SESSION" && (
        <div className={styles.workspaceWrapper}>
          <GroupSessionWorkspace />
        </div>
      )}
      workflowState: {workflowState}
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
export { CancelModal };
