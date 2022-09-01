import React, { useEffect, useMemo, useReducer } from "react";
import reducer from "./FormWorkflowReducer";
import { useParams, useLocation } from "react-router-dom";
interface ParamTypes {
  formUuid?: string;
}

const initialActions = {
  addPatient: (uuid: string | number) => undefined,
  openPatientSearch: () => undefined,
  saveEncounter: (encounterUuid: string | number) => undefined,
  editEncounter: (patientUuid: string | number) => undefined,
  submitForNext: () => undefined,
  submitForReview: () => undefined,
  submitForComplete: () => undefined,
  goToReview: () => undefined,
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
  patientUuids: [], // pseudo field from state[activeFormUuid].patientUuids
  encounters: {}, // pseudo field from state[activeFormUuid].encounters
};

const GroupFormWorkflowContext = React.createContext({
  ...initialWorkflowState,
  ...initialActions,
});

const GroupFormWorkflowProvider = ({ children }) => {
  const { formUuid } = useParams() as ParamTypes;
  const activeFormUuid = formUuid.split("&")[0];
  const [state, dispatch] = useReducer(reducer, {
    ...initialWorkflowState,
    ...initialActions,
  });

  const actions = useMemo(
    () => ({
      initializeWorkflowState: ({ activeFormUuid }) =>
        dispatch({
          type: "INITIALIZE_WORKFLOW_STATE",
          activeFormUuid,
        }),
      addPatient: (patientUuid) =>
        dispatch({ type: "ADD_PATIENT", patientUuid }),
      openPatientSearch: () => dispatch({ type: "OPEN_PATIENT_SEARCH" }),
      saveEncounter: (encounterUuid) =>
        dispatch({
          type: "SAVE_ENCOUNTER",
          encounterUuid,
        }),
      submitForNext: () => dispatch({ type: "SUBMIT_FOR_NEXT" }),
      submitForReview: () => dispatch({ type: "SUBMIT_FOR_REVIEW" }),
      submitForComplete: () => dispatch({ type: "SUBMIT_FOR_COMPLETE" }),
      editEncounter: (patientUuid) =>
        dispatch({ type: "EDIT_ENCOUNTER", patientUuid }),
      goToReview: () => dispatch({ type: "GO_TO_REVIEW" }),
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

  return (
    <GroupFormWorkflowContext.Provider
      value={{
        ...state,
        ...actions,
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
      }}
    >
      {children}
    </GroupFormWorkflowContext.Provider>
  );
};

export default GroupFormWorkflowContext;
export { GroupFormWorkflowProvider };
