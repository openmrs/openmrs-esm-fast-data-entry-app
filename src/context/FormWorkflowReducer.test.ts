import { navigate } from '@openmrs/esm-framework';
import { initialWorkflowState } from './FormWorkflowContext';
import reducer, { fdeWorkflowStorageName, fdeWorkflowStorageVersion } from './FormWorkflowReducer';

const mockNavigate = jest.mocked(navigate);

const buildState = (formStateOverrides = {}) => ({
  ...initialWorkflowState,
  activeFormUuid: 'triage-form',
  userUuid: 'user-1',
  forms: {
    'triage-form': {
      workflowState: 'NEW_PATIENT',
      activePatientUuid: null,
      activeEncounterUuid: null,
      patientUuids: [],
      encounters: {},
      ...formStateOverrides,
    },
  },
});

describe('FormWorkflowReducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes a fresh workflow state when there is no saved session', () => {
    const state = reducer(initialWorkflowState, {
      type: 'INITIALIZE_WORKFLOW_STATE',
      activeFormUuid: 'triage-form',
      userUuid: 'user-1',
    });

    expect(state.activeFormUuid).toBe('triage-form');
    expect(state.forms['triage-form']).toMatchObject({
      workflowState: 'NEW_PATIENT',
      activePatientUuid: null,
      activeEncounterUuid: null,
      patientUuids: [],
      encounters: {},
    });

    expect(JSON.parse(localStorage.getItem(`${fdeWorkflowStorageName}:user-1`))).toMatchObject({
      _storageVersion: fdeWorkflowStorageVersion,
      activeFormUuid: 'triage-form',
    });
  });

  it('restores a saved workflow and applies a patient from the URL when provided', () => {
    localStorage.setItem(
      `${fdeWorkflowStorageName}:user-1`,
      JSON.stringify({
        _storageVersion: fdeWorkflowStorageVersion,
        activeFormUuid: 'triage-form',
        userUuid: 'user-1',
        forms: {
          'triage-form': {
            workflowState: 'REVIEW',
            activePatientUuid: null,
            activeEncounterUuid: null,
            patientUuids: ['patient-a'],
            encounters: {},
          },
        },
      }),
    );

    const state = reducer(initialWorkflowState, {
      type: 'INITIALIZE_WORKFLOW_STATE',
      activeFormUuid: 'triage-form',
      newPatientUuid: 'patient-b',
      userUuid: 'user-1',
    });

    expect(state.forms['triage-form']).toMatchObject({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-b',
    });
    expect(state.forms['triage-form'].patientUuids).toEqual(['patient-a', 'patient-b']);
  });

  it('dispatches the submit event and moves the workflow into SUBMIT_FOR_NEXT', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const state = buildState({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-a',
    });

    const nextState = reducer(state, {
      type: 'SUBMIT_FOR_NEXT',
    });

    expect(nextState.forms['triage-form'].workflowState).toBe('SUBMIT_FOR_NEXT');
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('ampath-form-action');
    expect(event.detail).toEqual({
      formUuid: 'triage-form',
      patientUuid: 'patient-a',
      action: 'onSubmit',
    });
  });

  it('stores the encounter and returns to NEW_PATIENT after saving for next', () => {
    const state = buildState({
      workflowState: 'SUBMIT_FOR_NEXT',
      activePatientUuid: 'patient-a',
    });

    const nextState = reducer(state, {
      type: 'SAVE_ENCOUNTER',
      encounterUuid: 'encounter-1',
    });

    expect(nextState.forms['triage-form']).toMatchObject({
      workflowState: 'NEW_PATIENT',
      activePatientUuid: null,
      activeEncounterUuid: null,
      encounters: {
        'patient-a': 'encounter-1',
      },
    });
  });

  it('destroys the active form session and navigates back to the forms page after complete', () => {
    const state = buildState({
      workflowState: 'SUBMIT_FOR_COMPLETE',
      activePatientUuid: 'patient-a',
    });

    const nextState = reducer(state, {
      type: 'SAVE_ENCOUNTER',
      encounterUuid: 'encounter-1',
    });

    expect(nextState.activeFormUuid).toBeNull();
    expect(nextState.forms).toEqual({});
    expect(mockNavigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/forms' });
  });
});
