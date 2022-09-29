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
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "../patient-card/PatientCard";
import GroupDisplayHeader from "./group-display-header";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext, {
  GroupFormWorkflowProvider,
} from "../context/GroupFormWorkflowContext";
import GroupSearchHeader from "./group-search-header";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import FormBootstrap from "../FormBootstrap";
import useStartVisit from "../hooks/useStartVisit";
import { AttendanceTable } from "./attendance-table";

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

const NewGroupWorkflowButtons = () => {
  const { t } = useTranslation();
  const { workflowState, patientUuids } = useContext(GroupFormWorkflowContext);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  if (workflowState !== "NEW_GROUP_SESSION") return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button kind="secondary" type="submit" disabled={!patientUuids.length}>
          {t("createNewSession", "Create New Session")}
        </Button>
        <Button
          kind="tertiary"
          onClick={() => {
            setCancelModalOpen(true);
          }}
        >
          {t("cancel", "Cancel")}
        </Button>
      </div>
      <CancelModal open={cancelModalOpen} setOpen={setCancelModalOpen} />
    </>
  );
};

const WorkflowNavigationButtons = () => {
  const {
    activeFormUuid,
    validateForNext,
    patientUuids,
    activePatientUuid,
    workflowState,
  } = useContext(GroupFormWorkflowContext);
  const store = useStore(formStore);
  const formState = store[activeFormUuid];
  const navigationDisabled =
    formState !== "ready" || workflowState !== "EDIT_FORM";
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const { t } = useTranslation();

  const isLastPatient =
    activePatientUuid === patientUuids[patientUuids.length - 1];

  const handleClickNext = () => {
    if (workflowState === "EDIT_FORM") {
      validateForNext();
    }
  };

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button
          kind="primary"
          onClick={handleClickNext}
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

const SessionDetails = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className={styles.formSection}>
      <h4>{t("sessionDetails", "1. Session details")}</h4>
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
                {...register("sessionName", { required: true })}
                invalid={errors.sessionName}
                invalidText={"This field is required"}
              />
              <TextInput
                id="text"
                type="text"
                labelText={t("practitionerName", "Practitioner Name")}
                {...register("practitionerName", { required: true })}
                invalid={errors.practitionerName}
                invalidText={"This field is required"}
              />
              <Controller
                name="sessionDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    datePickerType="single"
                    size="md"
                    maxDate={new Date()}
                    {...field}
                  >
                    <DatePickerInput
                      id="session-date"
                      labelText={t("sessionDate", "Session Date")}
                      placeholder="mm/dd/yyyy"
                      size="md"
                      invalid={errors.sessionDate}
                      invalidText={"This field is required"}
                    />
                  </DatePicker>
                )}
              />
              <TextArea
                id="text"
                type="text"
                labelText={t("sessionNotes", "Session Notes")}
                {...register("sessionNotes", { required: true })}
                invalid={errors.sessionNotes}
                invalidText={"This field is required"}
              />
            </div>
          </Layer>
        </Tile>
      </Layer>
      <h4>{t("sessionParticipants", "2. Session participants")}</h4>
      <div>
        <p>
          {t(
            "markAbsentPatients",
            "The patients in this group. Patients that are not present in the session should be marked as absent."
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
              <AttendanceTable />
            </div>
          </Layer>
        </Tile>
      </Layer>
    </div>
  );
};

const GroupIdField = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { activeGroupUuid } = useContext(GroupFormWorkflowContext);

  useEffect(() => {
    if (activeGroupUuid) setValue("groupUuid", activeGroupUuid);
  }, [activeGroupUuid, setValue]);

  return (
    <>
      <input
        hidden
        {...register("groupUuid", {
          value: activeGroupUuid,
          required: t("chooseGroupError", "Please choose a group."),
        })}
      />
      {errors.groupUuid && !activeGroupUuid && (
        <div className={styles.formError}>
          {errors.groupUuid.message as string}
        </div>
      )}
    </>
  );
};

const SessionMetaWorkspace = () => {
  const { t } = useTranslation();
  const { setSessionMeta } = useContext(GroupFormWorkflowContext);
  const methods = useForm();

  const onSubmit = (data) => {
    const { sessionDate, ...rest } = data;
    setSessionMeta({ ...rest, sessionDate: sessionDate[0] });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className={styles.workspace}>
          <div className={styles.formMainContent}>
            <div className={styles.formContainer}>
              <SessionDetails />
            </div>
            <div className={styles.rightPanel}>
              <h4>{t("newGroupSession", "New Group Session")}</h4>
              <GroupIdField />
              <hr style={{ width: "100%" }} />
              <NewGroupWorkflowButtons />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
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
    activeVisitUuid,
    activeFormUuid,
    saveEncounter,
    activeSessionMeta,
    groupVisitTypeUuid,
    updateVisitUuid,
    submitForNext,
    workflowState,
  } = useContext(GroupFormWorkflowContext);

  const { saveVisit, success: visitSaveSuccess } = useStartVisit({
    showSuccessNotification: false,
    showErrorNotification: true,
  });

  // 0. user clicks "next patient" in WorkflowNavigationButtons
  // which triggers validateForNext() if workflowState === "EDIT_FORM"

  // 1. validate the form
  // if the form is valid, save a visit for the user
  // handleOnValidate is a callback passed to the form engine.
  const handleOnValidate = useCallback(
    (valid) => {
      if (valid && !activeVisitUuid) {
        // make a visit
        // we will not persist this state or update the reducer
        const date = new Date(activeSessionMeta.sessionDate);
        date.setHours(date.getHours() + 1);
        saveVisit({
          patientUuid: activePatientUuid,
          startDatetime: activeSessionMeta.sessionDate,
          stopDatetime: date.toISOString(),
          visitType: groupVisitTypeUuid,
        });
      } else if (valid && activeVisitUuid) {
        // there is already a visit for this form
        submitForNext();
      }
    },
    [
      activePatientUuid,
      activeSessionMeta,
      groupVisitTypeUuid,
      saveVisit,
      activeVisitUuid,
      submitForNext,
    ]
  );

  // 2. save the new visit uuid and start form submission
  useEffect(() => {
    if (visitSaveSuccess) {
      const visitUuid = visitSaveSuccess?.data?.uuid;
      if (!activeVisitUuid) {
        updateVisitUuid(visitUuid);
      }
      if (workflowState === "VALIDATE_FOR_NEXT") {
        submitForNext();
      }
    }
  }, [
    visitSaveSuccess,
    updateVisitUuid,
    submitForNext,
    workflowState,
    activeVisitUuid,
  ]);

  // 3. on form payload creation inject the activeVisitUuid
  const handleEncounterCreate = useCallback(
    (payload) => {
      const obsTime = new Date(activeSessionMeta.sessionDate);
      obsTime.setMinutes(obsTime.getMinutes() + 1);
      // handleEncounterCreate mutates the payload object and should return nothing
      // Object.entries(activeSessionMeta).forEach((key, value) => {
      //   payload[key as unknown as string] = value;
      // });
      payload.obs.forEach((item, index) => {
        payload.obs[index] = {
          ...item,
          groupMembers: item.groupMembers?.map((mem) => ({
            ...mem,
            obsDatetime: obsTime.toISOString(),
          })),
          obsDatetime: obsTime.toISOString(),
        };
      });
      payload.visit = activeVisitUuid;
      payload.encounterDatetime = obsTime.toISOString();
    },
    [activeVisitUuid, activeSessionMeta]
  );

  // 4. Once form has been posted, save the new encounter uuid so we can edit it later
  const handlePostResponse = useCallback(
    (encounter) => {
      if (encounter && encounter.uuid) {
        saveEncounter(encounter.uuid);
      }
    },
    [saveEncounter]
  );

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
      <GroupDisplayHeader />
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
