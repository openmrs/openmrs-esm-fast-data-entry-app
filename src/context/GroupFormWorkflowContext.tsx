import React, { useEffect, useMemo, useReducer } from "react";
import reducer from "./GroupFormWorkflowReducer";
import { useParams } from "react-router-dom";
import { Type } from "@openmrs/esm-framework";
import useGetSystemSettings from "../hooks/useGetSystemSettings";
interface ParamTypes {
  formUuid?: string;
}

export interface GroupType {
  id: string;
  name: string;
  members: Array<Type.Object>;
}
export interface MetaType {
  sessionName: string;
  sessionDate: string;
  practitionerName: string;
  sessionNotes: string;
}

const initialActions = {
  setGroup: (group: GroupType) => undefined,
  setSessionMeta: (meta: MetaType) => undefined,
  openPatientSearch: () => undefined,
  saveEncounter: (encounterUuid: string | number) => undefined,
  editEncounter: (patientUuid: string | number) => undefined,
  submitForNext: () => undefined,
  validateForNext: () => undefined,
  submitForReview: () => undefined,
  submitForComplete: () => undefined,
  goToReview: () => undefined,
  updateVisitAndSubmitForNext: (activeVisitUuid: string) => undefined,
  createVisitForNext: () => undefined,
  destroySession: () => undefined,
  closeSession: () => undefined,
};

export const initialWorkflowState = {
  // activeFormUuid and forms are the only two real values stored at state root level
  activeFormUuid: null, // the corrently open form
  forms: {}, // object containing all forms session data
  // the following fields will be available in context but are not stored at the
  //     state root level, but refer to nested values for the current
  //     aciveFormUuid
  workflowState: null, // pseudo field from state[activeFormUuid].workflowState
  activePatientUuid: null, // pseudo field from state[activeFormUuid].activePatientUuid
  activeEncounterUuid: null, // pseudo field from state[activeFormUuid].encounterUuid
  activeVisitUuid: null, // pseudo field from state[activeFormUuid].activeVisitUuid
  patientUuids: [], // pseudo field from state[activeFormUuid].patientUuids
  encounters: {}, // pseudo field from state[activeFormUuid].encounters
  activeGroupUuid: null, // pseudo field from state[activeFormUuid].groupUuid
  activeGroupName: null, // pseudo field from state[activeFormUuid].groupname
  activeSessionMeta: {
    sessionName: null,
    practitionerName: null,
    sessionDate: null,
    sessionNotes: null,
  },
};

const GroupFormWorkflowContext = React.createContext({
  ...initialWorkflowState,
  ...initialActions,
  visitTypeUuid: null, // this is a system setting which needs to be fetched
});

const GroupFormWorkflowProvider = ({ children }) => {
  const { formUuid } = useParams() as ParamTypes;
  const activeFormUuid = formUuid.split("&")[0];
  const [state, dispatch] = useReducer(reducer, {
    ...initialWorkflowState,
    ...initialActions,
  });
  const { results, error: fetchVisitTypeUuidError } = useGetSystemSettings(
    "@openmrs/esm-fast-data-entry-app.groupSessionVisitTypeUuid"
  );
  const visitTypeUuid = results?.[0]?.value;

  const actions = useMemo(
    () => ({
      initializeWorkflowState: ({ activeFormUuid }) =>
        dispatch({
          type: "INITIALIZE_WORKFLOW_STATE",
          activeFormUuid,
        }),
      setGroup: (group) => dispatch({ type: "SET_GROUP", group }),
      setSessionMeta: (meta: MetaType) =>
        dispatch({ type: "SET_SESSION_META", meta }),
      openPatientSearch: () => dispatch({ type: "OPEN_PATIENT_SEARCH" }),
      saveEncounter: (encounterUuid: string) =>
        dispatch({
          type: "SAVE_ENCOUNTER",
          encounterUuid,
        }),
      submitForNext: () => dispatch({ type: "SUBMIT_FOR_NEXT" }),
      validateForNext: () => dispatch({ type: "VALIDATE_FOR_NEXT" }),
      createVisitForNext: () => dispatch({ type: "CREATE_VISIT_FOR_NEXT" }),
      submitForComplete: () => dispatch({ type: "SUBMIT_FOR_COMPLETE" }),
      editEncounter: (patientUuid: string) =>
        dispatch({ type: "EDIT_ENCOUNTER", patientUuid }),
      goToReview: () => dispatch({ type: "GO_TO_REVIEW" }),
      updateVisitAndSubmitForNext: (activeVisitUuid: string) =>
        dispatch({
          type: "UPDATE_ACTIVE_VISIT_SUBMIT_FOR_NEXT",
          activeVisitUuid,
        }),
      destroySession: () => dispatch({ type: "DESTROY_SESSION" }),
      closeSession: () => dispatch({ type: "CLOSE_SESSION" }),
    }),
    []
  );

  // if formUuid isn't a part of state yet, grab it from the url params
  // this is the entry into the workflow system
  useEffect(() => {
    if (state?.workflowState === null && activeFormUuid) {
      actions.initializeWorkflowState({ activeFormUuid });
    }
  }, [activeFormUuid, state?.workflowState, actions]);

  useEffect(() => {
    if (fetchVisitTypeUuidError) {
      console.error(
        "Error fetching systemsetting @openmrs/esm-fast-data-entry-app.groupVisitTypeUuid. This will prevent being able to save a group visit"
      );
    }
  }, [fetchVisitTypeUuidError]);

  return (
    <GroupFormWorkflowContext.Provider
      value={{
        ...state,
        ...actions,
        visitTypeUuid,
        workflowState:
          state.forms?.[state.activeFormUuid]?.workflowState ??
          initialWorkflowState.workflowState,
        activePatientUuid:
          state.forms?.[state.activeFormUuid]?.activePatientUuid ??
          initialWorkflowState.activePatientUuid,
        activeEncounterUuid:
          state.forms?.[state.activeFormUuid]?.activeEncounterUuid ??
          initialWorkflowState.activeEncounterUuid,
        patientUuids:
          state.forms?.[state.activeFormUuid]?.patientUuids ??
          initialWorkflowState.patientUuids,
        encounters:
          state.forms?.[state.activeFormUuid]?.encounters ??
          initialWorkflowState.encounters,
        activeGroupUuid:
          state.forms?.[state.activeFormUuid]?.groupUuid ??
          initialWorkflowState.activeGroupUuid,
        activeGroupName:
          state.forms?.[state.activeFormUuid]?.groupName ??
          initialWorkflowState.activeGroupName,
        activeSessionMeta:
          state.forms?.[state.activeFormUuid]?.sessionMeta ??
          initialWorkflowState.activeSessionMeta,
        activeVisitUuid:
          state.forms?.[state.activeFormUuid]?.activeVisitUuid ??
          initialWorkflowState.activeVisitUuid,
      }}
    >
      {children}
    </GroupFormWorkflowContext.Provider>
  );
};

export default GroupFormWorkflowContext;
export { GroupFormWorkflowProvider };
