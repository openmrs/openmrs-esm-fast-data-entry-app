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
import { v4 as uuid } from "uuid";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import FormBootstrap from "../FormBootstrap";
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
    (formState !== "ready" || workflowState !== "EDIT_FORM") &&
    formState !== "readyWithValidationErrors";
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const { t } = useTranslation();

  const isLastPatient =
    activePatientUuid === patientUuids[patientUuids.length - 1];

  const handleClickNext = () => {
    if (
      workflowState === "EDIT_FORM" ||
      formState === "readyWithValidationErrors"
    ) {
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
            : t("nextPatient", "Next patient")}
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
    activeGroupUuid,
    activeGroupName,
    activeSessionUuid,
    saveEncounter,
    activeSessionMeta,
    groupVisitTypeUuid,
    updateVisitUuid,
    submitForNext,
    workflowState,
  } = useContext(GroupFormWorkflowContext);

  const { sessionLocation } = useSession();

  useEffect(() => {
    if (activeVisitUuid) {
      updateVisitUuid(activeVisitUuid);
    }
  }, [updateVisitUuid, activeVisitUuid, activePatientUuid]);

  // If there's no active visit, trigger the creation of a new one
  const handleEncounterCreate = useCallback(
    (payload) => {
      // Create a visit with the same date as the encounter being saved
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
      const visitUuid = activeVisitUuid ? activeVisitUuid : uuid();
      if (!activeVisitUuid) {
        Object.entries(groupSessionConcepts).forEach(([field, uuid]) => {
          if (activeSessionMeta?.[field] != null) {
            payload.obs.push({
              concept: uuid,
              value: activeSessionMeta[field],
            });
          }
        });

        const otherIdentifiers = [
          { concept: groupSessionConcepts.cohortId, value: activeGroupUuid },
          { concept: groupSessionConcepts.cohortName, value: activeGroupName },
          {
            concept: groupSessionConcepts.sessionUuid,
            value: activeSessionUuid,
          },
        ];
        payload.obs.push(...otherIdentifiers);
        // If this is a newly created encounter and visit, add session concepts to encounter payload.
        const visitInfo = {
          startDatetime: activeSessionMeta.sessionDate,
          stopDatetime: activeSessionMeta.sessionDate,
          uuid: visitUuid,
          patient: {
            uuid: activePatientUuid,
          },
          location: {
            uuid: sessionLocation?.uuid,
          },
          visitType: {
            uuid: groupVisitTypeUuid,
          },
        };
        payload.visit = visitInfo;
        updateVisitUuid(visitUuid);
      }
      payload.location = sessionLocation?.uuid;
      payload.encounterDatetime = obsTime.toISOString();
    },
    [
      activeSessionMeta,
      activeVisitUuid,
      sessionLocation?.uuid,
      groupSessionConcepts,
      activeGroupUuid,
      activeGroupName,
      activeSessionUuid,
      activePatientUuid,
      groupVisitTypeUuid,
      updateVisitUuid,
    ]
  );

  // Once form has been posted, save the new encounter uuid so we can edit it later
  const handlePostResponse = useCallback(
    (encounter) => {
      if (encounter && encounter.uuid) {
        saveEncounter(encounter.uuid);
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
