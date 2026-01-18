import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import reducer from './FormWorkflowReducer';
import { useParams, useLocation } from 'react-router-dom';
import useGetSystemSetting from '../hooks/useGetSystemSetting';
import { useSession } from '@openmrs/esm-framework';

interface ParamTypes {
  formUuid?: string;
}

const initialActions = {
  addPatient: (_uuid: string | number) => undefined,
  openPatientSearch: () => undefined,
  saveEncounter: (_encounterUuid: string | number) => undefined,
  editEncounter: (_patientUuid: string | number) => undefined,
  submitForNext: () => undefined,
  submitForReview: () => undefined,
  submitForComplete: () => undefined,
  goToReview: () => undefined,
  destroySession: () => undefined,
  closeSession: () => undefined,
};

export const initialWorkflowState = {
  activeFormUuid: null,
  forms: {},

  workflowState: null,
  activePatientUuid: null,
  activeEncounterUuid: null,
  patientUuids: [],
  encounters: {},
  singleSessionVisitTypeUuid: null,
  userUuid: null,
};

const FormWorkflowContext = React.createContext({
  ...initialWorkflowState,
  ...initialActions,
});

const FormWorkflowProvider = ({ children }) => {
  const { user } = useSession();
  const { formUuid } = useParams() as ParamTypes;
  const activeFormUuid = formUuid?.split('&')[0] ?? null;

  const { search } = useLocation();
  const newPatientUuid = new URLSearchParams(search).get('patientUuid');

  const [state, dispatch] = useReducer(reducer, {
    ...initialWorkflowState,
    ...initialActions,
  });

  const systemSetting = useGetSystemSetting('@openmrs/esm-fast-data-entry-app.groupSessionVisitTypeUuid');

  const singleSessionVisitTypeUuid = systemSetting?.result?.data?.results?.[0]?.value ?? null;

  /**
   * Refs for diagnostic logging (no behavior changes)
   */
  const lastSeenPatientUuidRef = useRef<string | null>(null);
  const hasLoggedPatientLossRef = useRef(false);

  const actions = useMemo(
    () => ({
      initializeWorkflowState: ({ activeFormUuid, newPatientUuid }) =>
        dispatch({
          type: 'INITIALIZE_WORKFLOW_STATE',
          activeFormUuid,
          newPatientUuid,
          userUuid: user.uuid,
        }),
      addPatient: (patientUuid) => dispatch({ type: 'ADD_PATIENT', patientUuid }),
      openPatientSearch: () => dispatch({ type: 'OPEN_PATIENT_SEARCH' }),
      saveEncounter: (encounterUuid) =>
        dispatch({
          type: 'SAVE_ENCOUNTER',
          encounterUuid,
        }),
      submitForNext: () => dispatch({ type: 'SUBMIT_FOR_NEXT' }),
      submitForReview: () => dispatch({ type: 'SUBMIT_FOR_REVIEW' }),
      submitForComplete: () => dispatch({ type: 'SUBMIT_FOR_COMPLETE' }),
      editEncounter: (patientUuid) => dispatch({ type: 'EDIT_ENCOUNTER', patientUuid }),
      goToReview: () => dispatch({ type: 'GO_TO_REVIEW' }),
      destroySession: () => dispatch({ type: 'DESTROY_SESSION' }),
      closeSession: () => dispatch({ type: 'CLOSE_SESSION' }),
    }),
    [user],
  );

  /**
   * ENTRY POINT — workflow initialization
   */
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[FDE TRACE] Workflow initialization check', {
      workflowState: state?.workflowState,
      activeFormUuid,
      newPatientUuid,
    });

    if (state?.workflowState === null && activeFormUuid) {
      actions.initializeWorkflowState({
        activeFormUuid,
        newPatientUuid,
      });
    }
  }, [activeFormUuid, newPatientUuid, state?.workflowState, actions]);

  /**
   * DIAGNOSTIC ONLY:
   * Detect when a patient is created but not retained in workflow state
   * Logs ONCE per workflow to avoid noise
   */
  useEffect(() => {
    const currentPatient = state.forms?.[state.activeFormUuid]?.activePatientUuid ?? null;

    // eslint-disable-next-line no-console
    console.debug('[FDE DIAGNOSTIC] Patient context snapshot', {
      activeFormUuid: state.activeFormUuid,
      patientUuidFromUrl: newPatientUuid,
      patientUuidInWorkflow: currentPatient,
      workflowState: state?.workflowState,
    });

    if (newPatientUuid) {
      lastSeenPatientUuidRef.current = newPatientUuid;
    }

    if (
      lastSeenPatientUuidRef.current &&
      !currentPatient &&
      state?.workflowState === null &&
      activeFormUuid &&
      !hasLoggedPatientLossRef.current
    ) {
      hasLoggedPatientLossRef.current = true;

      // eslint-disable-next-line no-console
      console.warn('[FDE WARNING] Patient created but not present in workflow state', {
        patientUuid: lastSeenPatientUuidRef.current,
        activeFormUuid,
      });
    }
  }, [state.activeFormUuid, state.forms, state.workflowState, activeFormUuid, newPatientUuid]);

  return (
    <FormWorkflowContext.Provider
      value={{
        ...state,
        ...actions,

        workflowState: state.forms?.[state.activeFormUuid]?.workflowState ?? initialWorkflowState.workflowState,

        activePatientUuid:
          state.forms?.[state.activeFormUuid]?.activePatientUuid ?? initialWorkflowState.activePatientUuid,

        activeEncounterUuid:
          state.forms?.[state.activeFormUuid]?.activeEncounterUuid ?? initialWorkflowState.activeEncounterUuid,

        patientUuids: state.forms?.[state.activeFormUuid]?.patientUuids ?? initialWorkflowState.patientUuids,

        encounters: state.forms?.[state.activeFormUuid]?.encounters ?? initialWorkflowState.encounters,

        singleSessionVisitTypeUuid,
      }}
    >
      {children}
    </FormWorkflowContext.Provider>
  );
};

export default FormWorkflowContext;
export { FormWorkflowProvider };
