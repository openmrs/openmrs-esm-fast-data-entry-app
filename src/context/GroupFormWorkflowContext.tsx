import React, { useEffect, useMemo, useReducer } from 'react';
import reducer from './GroupFormWorkflowReducer';
import { useParams } from 'react-router-dom';
import { type Type, useSession } from '@openmrs/esm-framework';
import useGetSystemSetting from '../hooks/useGetSystemSetting';
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
  unsetGroup: () => undefined,
  setSessionMeta: (meta: MetaType) => undefined,
  openPatientSearch: () => undefined,
  saveEncounter: (encounterUuid: string | number) => undefined,
  editEncounter: (patientUuid: string | number) => undefined,
  validateForNext: () => undefined,
  validateForComplete: () => undefined,
  updateVisitUuid: (visitUuid: string) => undefined,
  submitForNext: (nextPatientUuid: string = null) => undefined,
  submitForReview: () => undefined,
  submitForComplete: () => undefined,
  addPatientUuid: (patientUuid: string) => undefined,
  removePatientUuid: (patientUuid: string) => undefined,
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
  activeEncounterUuid: null, // pseudo field from state[activeFormUuid].activeEncounterUuid
  activeSessionUuid: null, // pseudo field from state[activeFormUuid].activeSessionUuid
  activeVisitUuid: null, // pseudo field from state[activeFormUuid].activeVisitUuid
  patientUuids: [], // pseudo field from state[activeFormUuid].patientUuids
  encounters: {}, // pseudo field from state[activeFormUuid].encounters
  visits: {}, // pseudo field from state[activeFormUuid].visits
  activeGroupUuid: null, // pseudo field from state[activeFormUuid].groupUuid
  activeGroupName: null, // pseudo field from state[activeFormUuid].groupName
  activeGroupMembers: [], // pseudo field from state[activeFormUuid].groupMembers
  activeSessionMeta: {
    sessionName: null,
    practitionerName: null,
    sessionDate: null,
    sessionNotes: null,
  },
  groupVisitTypeUuid: null,
  userUuid: null, // UUID of the user to which this workflow state belongs to
};

const GroupFormWorkflowContext = React.createContext({
  ...initialWorkflowState,
  ...initialActions,
});

const GroupFormWorkflowProvider = ({ children }) => {
  const { user } = useSession();
  const { formUuid } = useParams() as ParamTypes;
  const activeFormUuid = formUuid.split('&')[0];
  const systemSetting = useGetSystemSetting('@openmrs/esm-fast-data-entry-app.groupSessionVisitTypeUuid');
  const groupVisitTypeUuid = systemSetting?.result?.data?.results?.[0]?.value;
  const [state, dispatch] = useReducer(reducer, {
    ...initialWorkflowState,
    ...initialActions,
  });

  const actions = useMemo(
    () => ({
      initializeWorkflowState: ({ activeFormUuid }) =>
        dispatch({
          type: 'INITIALIZE_WORKFLOW_STATE',
          activeFormUuid,
          userUuid: user.uuid,
        }),
      setGroup: (group) => dispatch({ type: 'SET_GROUP', group }),
      unsetGroup: () => dispatch({ type: 'UNSET_GROUP' }),
      setSessionMeta: (meta) => dispatch({ type: 'SET_SESSION_META', meta }),
      addPatientUuid: (patientUuid) => dispatch({ type: 'ADD_PATIENT_UUID', patientUuid }),
      removePatientUuid: (patientUuid) => dispatch({ type: 'REMOVE_PATIENT_UUID', patientUuid }),
      openPatientSearch: () => dispatch({ type: 'OPEN_PATIENT_SEARCH' }),
      saveEncounter: (encounterUuid) =>
        dispatch({
          type: 'SAVE_ENCOUNTER',
          encounterUuid,
        }),
      validateForNext: () => dispatch({ type: 'VALIDATE_FOR_NEXT' }),
      validateForComplete: () => dispatch({ type: 'VALIDATE_FOR_COMPLETE' }),
      updateVisitUuid: (visitUuid) => dispatch({ type: 'UPDATE_VISIT_UUID', visitUuid }),
      submitForNext: (nextPatientUuid) => dispatch({ type: 'SUBMIT_FOR_NEXT', nextPatientUuid }),
      submitForComplete: () => dispatch({ type: 'SUBMIT_FOR_COMPLETE' }),
      editEncounter: (patientUuid) => dispatch({ type: 'EDIT_ENCOUNTER', patientUuid }),
      goToReview: () => dispatch({ type: 'GO_TO_REVIEW' }),
      destroySession: () => dispatch({ type: 'DESTROY_SESSION' }),
      closeSession: () => dispatch({ type: 'CLOSE_SESSION' }),
    }),
    [user],
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
        groupVisitTypeUuid,
        ...state,
        ...actions,
        workflowState: state.forms?.[state.activeFormUuid]?.workflowState ?? initialWorkflowState.workflowState,
        activeSessionUuid:
          state.forms?.[state.activeFormUuid]?.activeSessionUuid ?? initialWorkflowState.activeSessionUuid,
        activePatientUuid:
          state.forms?.[state.activeFormUuid]?.activePatientUuid ?? initialWorkflowState.activePatientUuid,
        activeEncounterUuid:
          state.forms?.[state.activeFormUuid]?.activeEncounterUuid ?? initialWorkflowState.activeEncounterUuid,
        activeVisitUuid: state.forms?.[state.activeFormUuid]?.activeVisitUuid ?? initialWorkflowState.activeVisitUuid,
        patientUuids: state.forms?.[state.activeFormUuid]?.patientUuids ?? initialWorkflowState.patientUuids,
        encounters: state.forms?.[state.activeFormUuid]?.encounters ?? initialWorkflowState.encounters,
        activeGroupUuid: state.forms?.[state.activeFormUuid]?.groupUuid ?? initialWorkflowState.activeGroupUuid,
        activeGroupName: state.forms?.[state.activeFormUuid]?.groupName ?? initialWorkflowState.activeGroupName,
        activeGroupMembers:
          state.forms?.[state.activeFormUuid]?.groupMembers ?? initialWorkflowState.activeGroupMembers,
        activeSessionMeta: state.forms?.[state.activeFormUuid]?.sessionMeta ?? initialWorkflowState.activeSessionMeta,
      }}
    >
      {children}
    </GroupFormWorkflowContext.Provider>
  );
};

export default GroupFormWorkflowContext;
export { GroupFormWorkflowProvider };
