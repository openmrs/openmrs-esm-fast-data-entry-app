import React, { useEffect, useMemo, useReducer } from 'react';
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
  /* ──────────────────────────────
   * TRACE: provider render
   * ────────────────────────────── */
  // eslint-disable-next-line no-console
  console.debug('[FDE TRACE] FormWorkflowProvider render');

  const { user } = useSession();
  const { formUuid } = useParams() as ParamTypes;
  const activeFormUuid = formUuid?.split('&')[0] ?? null;

  const { search } = useLocation();
  const newPatientUuid = new URLSearchParams(search).get('patientUuid');

  // eslint-disable-next-line no-console
  console.debug('[FDE TRACE] URL + session info', {
    rawFormUuid: formUuid,
    activeFormUuid,
    newPatientUuid,
    userUuid: user?.uuid,
  });

  const [state, dispatch] = useReducer(reducer, {
    ...initialWorkflowState,
    ...initialActions,
  });

  const systemSetting = useGetSystemSetting('@openmrs/esm-fast-data-entry-app.groupSessionVisitTypeUuid');

  const singleSessionVisitTypeUuid = systemSetting?.result?.data?.results?.[0]?.value ?? null;

  const actions = useMemo(
    () => ({
      initializeWorkflowState: ({ activeFormUuid, newPatientUuid }) => {
        // eslint-disable-next-line no-console
        console.debug('[FDE ACTION] INITIALIZE_WORKFLOW_STATE', {
          activeFormUuid,
          newPatientUuid,
          userUuid: user?.uuid,
        });

        dispatch({
          type: 'INITIALIZE_WORKFLOW_STATE',
          activeFormUuid,
          newPatientUuid,
          userUuid: user?.uuid,
        });
      },

      addPatient: (patientUuid) => dispatch({ type: 'ADD_PATIENT', patientUuid }),

      openPatientSearch: () => dispatch({ type: 'OPEN_PATIENT_SEARCH' }),

      saveEncounter: (encounterUuid) => {
        // eslint-disable-next-line no-console
        console.debug('[FDE ACTION] SAVE_ENCOUNTER', { encounterUuid });

        dispatch({
          type: 'SAVE_ENCOUNTER',
          encounterUuid,
        });
      },

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

  /* ──────────────────────────────
   * EFFECT: workflow initialization
   * ────────────────────────────── */
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[FDE EFFECT] Workflow init check', {
      workflowState: state.workflowState,
      activeFormUuid,
      newPatientUuid,
      formsKeys: Object.keys(state.forms ?? {}),
    });

    if (state.workflowState === null && activeFormUuid) {
      actions.initializeWorkflowState({
        activeFormUuid,
        newPatientUuid,
      });
    }
  }, [activeFormUuid, newPatientUuid, state.workflowState, state.forms, actions]);

  /* ──────────────────────────────
   * EFFECT: patient context diagnostics
   * ────────────────────────────── */
  useEffect(() => {
    const currentPatient = state.forms?.[state.activeFormUuid]?.activePatientUuid ?? null;

    // eslint-disable-next-line no-console
    console.debug('[FDE DIAGNOSTIC] Patient context snapshot', {
      activeFormUuid: state.activeFormUuid,
      patientUuidFromUrl: newPatientUuid,
      patientUuidInWorkflow: currentPatient,
      workflowState: state.forms?.[state.activeFormUuid]?.workflowState ?? null,
      fullFormState: state.forms?.[state.activeFormUuid],
    });

    if (newPatientUuid && !currentPatient) {
      // eslint-disable-next-line no-console
      console.warn('[FDE WARNING] Patient created but not present in workflow state', {
        newPatientUuid,
        activeFormUuid: state.activeFormUuid,
      });
    }
  }, [state.forms, state.activeFormUuid, newPatientUuid]);

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
