import {
  getGlobalStore,
  useConfig,
  useSession,
  useStore,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import PatientCard from "../patient-card/PatientCard";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import FormBootstrap from "../FormBootstrap";
import useStartVisit from "../hooks/useStartVisit";
import CompleteModal from "../CompleteModal";
import CancelModal from "../CancelModal";

const formStore = getGlobalStore("ampath-form-state");

const WorkflowNavigationButtons = () => {
  const context = useContext(GroupFormWorkflowContext);
  const {
    activeFormUuid,
    submitForNext,
    patientUuids,
    activePatientUuid,
    workflowState,
  } = context;
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
      submitForNext();
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
      <CancelModal
        open={cancelModalOpen}
        setOpen={setCancelModalOpen}
        context={context}
      />
      <CompleteModal
        open={completeModalOpen}
        setOpen={setCompleteModalOpen}
        context={context}
        validateFirst={false}
      />
    </>
  );
};

const GroupSessionWorkspace = () => {
  const { groupSessionConcepts } = useConfig();
  const { t } = useTranslation();
  const {
    patientUuids,
    activePatientUuid,
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

  const { sessionLocation } = useSession();
  const [encounter, setEncounter] = useState(null);
  const [visit, setVisit] = useState(null);

  const {
    saveVisit,
    updateEncounter,
    success: visitSaveSuccess,
  } = useStartVisit({
    showSuccessNotification: false,
    showErrorNotification: true,
  });

  // 0. user clicks "next patient" in WorkflowNavigationButtons
  // which triggers submitForNext() if workflowState === "EDIT_FORM"

  // 1. save the new visit uuid and start form submission
  useEffect(() => {
    if (
      visitSaveSuccess &&
      visitSaveSuccess.data.patient.uuid === activePatientUuid
    ) {
      setVisit(visitSaveSuccess.data);
      // Update visit UUID on workflow
      updateVisitUuid(visitSaveSuccess.data.uuid);
    }
  }, [
    visitSaveSuccess,
    updateVisitUuid,
    activeVisitUuid,
    activePatientUuid,
    visit,
    setVisit,
  ]);

  // 2. If there's no active visit, trigger the creation of a new one
  const handleEncounterCreate = useCallback(
    (payload) => {
      // Create a visit with the same date as the encounter being saved
      if (!activeVisitUuid) {
        saveVisit({
          patientUuid: activePatientUuid,
          startDatetime: activeSessionMeta.sessionDate,
          stopDatetime: activeSessionMeta.sessionDate,
          visitType: groupVisitTypeUuid,
          location: sessionLocation?.uuid,
        });
      }
      const obsTime = new Date(activeSessionMeta.sessionDate);
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
      // If this is a newly created encounter and visit, add session concepts to encounter payload.
      if (!activeVisitUuid) {
        Object.entries(groupSessionConcepts).forEach(([field, uuid]) => {
          payload.obs.push({
            concept: uuid,
            value: activeSessionMeta?.[field],
          });
        });
      }
      payload.location = sessionLocation?.uuid;
      payload.encounterDatetime = obsTime.toISOString();
    },
    [
      activePatientUuid,
      activeVisitUuid,
      activeSessionMeta,
      groupSessionConcepts,
      groupVisitTypeUuid,
      saveVisit,
      sessionLocation,
    ]
  );

  // 3. Update encounter so that it belongs to the created visit
  useEffect(() => {
    if (encounter && encounter.patient?.uuid === visit.patient?.uuid) {
      updateEncounter({ uuid: encounter.uuid, visit: visit.uuid });
    }
  }, [encounter, updateEncounter, visit]);

  // 4. Once form has been posted, save the new encounter uuid so we can edit it later
  const handlePostResponse = useCallback(
    (encounter) => {
      if (encounter && encounter.uuid) {
        saveEncounter(encounter.uuid);
        setEncounter(encounter);
      }
    },
    [saveEncounter]
  );

  const switchPatient = useCallback(
    (patientUuid) => {
      submitForNext(patientUuid);
    },
    [submitForNext]
  );

  if (workflowState === "NEW_GROUP_SESSION") return null;

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
                  editEncounter: switchPatient,
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

export default GroupSessionWorkspace;
