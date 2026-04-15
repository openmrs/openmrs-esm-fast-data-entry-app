import { navigate } from '@openmrs/esm-framework';
import { initialWorkflowState } from './GroupFormWorkflowContext';
import reducer, { fdeGroupWorkflowStorageName, fdeGroupWorkflowStorageVersion } from './GroupFormWorkflowReducer';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-session-uuid'),
}));

const mockNavigate = jest.mocked(navigate);

const buildState = (formStateOverrides = {}, rootStateOverrides = {}) => ({
  ...initialWorkflowState,
  activeFormUuid: 'group-form',
  userUuid: 'user-1',
  forms: {
    'group-form': {
      workflowState: 'NEW_GROUP_SESSION',
      groupUuid: null,
      groupName: null,
      groupMembers: [],
      activePatientUuid: null,
      activeEncounterUuid: null,
      activeVisitUuid: null,
      activeSessionUuid: null,
      patientUuids: [],
      encounters: {},
      visits: {},
      ...formStateOverrides,
    },
  },
  ...rootStateOverrides,
});

describe('GroupFormWorkflowReducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes a fresh group workflow state when there is no saved session', () => {
    const state = reducer(initialWorkflowState, {
      type: 'INITIALIZE_WORKFLOW_STATE',
      activeFormUuid: 'group-form',
      userUuid: 'user-1',
    });

    expect(state.activeFormUuid).toBe('group-form');
    expect(state.forms['group-form']).toMatchObject({
      workflowState: 'NEW_GROUP_SESSION',
      groupUuid: null,
      patientUuids: [],
      encounters: {},
      visits: {},
    });

    expect(JSON.parse(localStorage.getItem(`${fdeGroupWorkflowStorageName}:user-1`))).toMatchObject({
      _storageVersion: fdeGroupWorkflowStorageVersion,
      activeFormUuid: 'group-form',
    });
  });

  it('restores a saved workflow and derives the current patient and visit state', () => {
    localStorage.setItem(
      `${fdeGroupWorkflowStorageName}:user-1`,
      JSON.stringify({
        _storageVersion: fdeGroupWorkflowStorageVersion,
        activeFormUuid: 'group-form',
        userUuid: 'user-1',
        forms: {
          'group-form': {
            workflowState: 'EDIT_FORM',
            patientUuids: ['patient-a', 'patient-b'],
            encounters: {
              'patient-a': 'encounter-a',
            },
            visits: {
              'patient-a': 'visit-a',
            },
          },
        },
      }),
    );

    const state = reducer(initialWorkflowState, {
      type: 'INITIALIZE_WORKFLOW_STATE',
      activeFormUuid: 'group-form',
      userUuid: 'user-1',
    });

    expect(state.forms['group-form']).toMatchObject({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-a',
      activeEncounterUuid: 'encounter-a',
      activeVisitUuid: 'visit-a',
      activeSessionUuid: 'generated-session-uuid',
    });
  });

  it('stores the selected group and clears the active patient state', () => {
    const state = buildState({
      activePatientUuid: 'patient-z',
      activeEncounterUuid: 'encounter-z',
      activeVisitUuid: 'visit-z',
      activeSessionUuid: 'session-z',
    });

    const nextState = reducer(state, {
      type: 'SET_GROUP',
      group: {
        uuid: 'cohort-1',
        name: 'Nutrition Cohort',
        cohortMembers: [{ patient: { uuid: 'patient-a' } }, { patient: { uuid: 'patient-b' } }],
      },
    });

    expect(nextState.forms['group-form']).toMatchObject({
      groupUuid: 'cohort-1',
      groupName: 'Nutrition Cohort',
      groupMembers: ['patient-a', 'patient-b'],
      patientUuids: ['patient-a', 'patient-b'],
      activePatientUuid: null,
      activeEncounterUuid: null,
      activeVisitUuid: null,
      activeSessionUuid: null,
    });
  });

  it('sets session metadata and moves to the first patient in edit mode', () => {
    const state = buildState({
      patientUuids: ['patient-a', 'patient-b'],
      encounters: {
        'patient-a': 'encounter-a',
      },
      visits: {
        'patient-a': 'visit-a',
      },
    });

    const nextState = reducer(state, {
      type: 'SET_SESSION_META',
      meta: {
        sessionName: 'April Session',
        practitionerName: 'Alice',
        sessionDate: '2026-04-15',
        sessionNotes: 'Notes',
      },
    });

    expect(nextState.forms['group-form']).toMatchObject({
      sessionMeta: {
        sessionName: 'April Session',
        practitionerName: 'Alice',
        sessionDate: '2026-04-15',
        sessionNotes: 'Notes',
      },
      activePatientUuid: 'patient-a',
      activeEncounterUuid: 'encounter-a',
      activeVisitUuid: 'visit-a',
      activeSessionUuid: 'generated-session-uuid',
      workflowState: 'EDIT_FORM',
    });
  });

  it('adds and removes patient UUIDs without duplicating entries', () => {
    const state = buildState({
      patientUuids: ['patient-a'],
    });

    const unchangedState = reducer(state, {
      type: 'ADD_PATIENT_UUID',
      patientUuid: 'patient-a',
    });
    expect(unchangedState).toBe(state);

    const addedState = reducer(state, {
      type: 'ADD_PATIENT_UUID',
      patientUuid: 'patient-b',
    });
    expect(addedState.forms['group-form'].patientUuids).toEqual(['patient-a', 'patient-b']);

    const removedState = reducer(addedState, {
      type: 'REMOVE_PATIENT_UUID',
      patientUuid: 'patient-a',
    });
    expect(removedState.forms['group-form'].patientUuids).toEqual(['patient-b']);
  });

  it('dispatches validate events and stores the visit UUID for the active patient', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const state = buildState({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-a',
    });

    const validatingState = reducer(state, {
      type: 'VALIDATE_FOR_NEXT',
    });

    expect(validatingState.forms['group-form'].workflowState).toBe('VALIDATE_FOR_NEXT');
    const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      formUuid: 'group-form',
      patientUuid: 'patient-a',
      action: 'validateForm',
    });

    const visitState = reducer(state, {
      type: 'UPDATE_VISIT_UUID',
      visitUuid: 'visit-a',
    });

    expect(visitState.forms['group-form']).toMatchObject({
      activeVisitUuid: 'visit-a',
      visits: {
        'patient-a': 'visit-a',
      },
    });
  });

  it('submits for next and advances to the requested patient after saving', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const state = buildState(
      {
        workflowState: 'EDIT_FORM',
        activePatientUuid: 'patient-a',
        patientUuids: ['patient-a', 'patient-b', 'patient-c'],
        visits: {
          'patient-c': 'visit-c',
        },
      },
      {
        nextPatientUuid: null,
      },
    );

    const submittingState = reducer(state, {
      type: 'SUBMIT_FOR_NEXT',
      nextPatientUuid: 'patient-c',
    });

    expect(submittingState.forms['group-form'].workflowState).toBe('SUBMIT_FOR_NEXT');
    expect(submittingState.nextPatientUuid).toBe('patient-c');
    const submitEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    expect(submitEvent.detail).toEqual({
      formUuid: 'group-form',
      patientUuid: 'patient-a',
      action: 'onSubmit',
    });

    const savedState = reducer(submittingState, {
      type: 'SAVE_ENCOUNTER',
      encounterUuid: 'encounter-a',
    });

    expect(savedState.forms['group-form']).toMatchObject({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-c',
      activeEncounterUuid: null,
      activeVisitUuid: 'visit-c',
      encounters: {
        'patient-a': 'encounter-a',
      },
    });
  });

  it('clears the active session pointers when going to review', () => {
    const state = buildState({
      workflowState: 'EDIT_FORM',
      activePatientUuid: 'patient-a',
      activeEncounterUuid: 'encounter-a',
      activeVisitUuid: 'visit-a',
      activeSessionUuid: 'session-a',
    });

    const nextState = reducer(state, {
      type: 'GO_TO_REVIEW',
    });

    expect(nextState.forms['group-form']).toMatchObject({
      workflowState: 'REVIEW',
      activePatientUuid: null,
      activeEncounterUuid: null,
      activeVisitUuid: null,
      activeSessionUuid: null,
    });
  });

  it('destroys the active group session and navigates back to forms', () => {
    const state = buildState({
      workflowState: 'SUBMIT_FOR_COMPLETE',
      activePatientUuid: 'patient-a',
    });

    const nextState = reducer(state, {
      type: 'DESTROY_SESSION',
    });

    expect(nextState.activeFormUuid).toBeNull();
    expect(nextState.forms).toEqual({});
    expect(nextState.formDestroyed).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/forms' });
  });
});
