import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGlobalStore, useConfig, useSession, useStore } from '@openmrs/esm-framework';
import FormBootstrap from '../FormBootstrap';
import GroupFormWorkflowContext from '../context/GroupFormWorkflowContext';
import GroupSessionWorkspace from './GroupSessionWorkspace';

jest.mock('@openmrs/esm-framework', () => ({
  getGlobalStore: jest.fn(),
  useConfig: jest.fn(),
  useSession: jest.fn(),
  useStore: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-visit-uuid'),
}));

jest.mock('../FormBootstrap', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="form-bootstrap" />),
}));

jest.mock('../patient-card/PatientCard', () => ({
  __esModule: true,
  default: ({ patientUuid, editEncounter }) => (
    <button data-testid={`patient-card-${patientUuid}`} onClick={() => editEncounter(patientUuid)}>
      {patientUuid}
    </button>
  ),
}));

jest.mock('../CancelModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../CompleteModal', () => ({
  __esModule: true,
  default: () => null,
}));

const mockGetGlobalStore = jest.mocked(getGlobalStore);
const mockUseConfig = jest.mocked(useConfig);
const mockUseSession = jest.mocked(useSession);
const mockUseStore = jest.mocked(useStore);
const mockFormBootstrap = FormBootstrap as jest.Mock;

const renderWorkspace = (contextOverrides = {}) => {
  const defaultContext = {
    workflowState: 'EDIT_FORM',
    patientUuids: ['patient-a', 'patient-b'],
    activePatientUuid: 'patient-a',
    activeEncounterUuid: null,
    activeVisitUuid: null,
    activeFormUuid: 'group-form',
    activeGroupUuid: 'group-1',
    activeGroupName: 'Nutrition Cohort',
    activeSessionUuid: 'session-1',
    activeSessionMeta: {
      sessionName: 'April Session',
      practitionerName: 'Alice',
      sessionDate: '2026-04-15',
      sessionNotes: 'Bring notebooks',
    },
    groupVisitTypeUuid: 'visit-type-1',
    encounters: {},
    saveEncounter: jest.fn(),
    updateVisitUuid: jest.fn(),
    submitForNext: jest.fn(),
  };

  return render(
    <GroupFormWorkflowContext.Provider value={{ ...defaultContext, ...contextOverrides } as never}>
      <GroupSessionWorkspace />
    </GroupFormWorkflowContext.Provider>,
  );
};

describe('GroupSessionWorkspace', () => {
  beforeEach(() => {
    mockGetGlobalStore.mockReturnValue('ampath-form-state' as never);
    mockUseStore.mockReturnValue({
      'group-form': 'ready',
    } as never);
    mockUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'session-location',
        display: 'General Hospital',
      },
    } as never);
    mockUseConfig.mockReturnValue({
      groupSessionConcepts: {
        sessionName: 'concept-session-name',
        practitionerName: 'concept-practitioner',
        sessionNotes: 'concept-notes',
        sessionDate: 'concept-date',
        cohortId: 'concept-cohort-id',
        cohortName: 'concept-cohort-name',
        sessionUuid: 'concept-session-uuid',
      },
    } as never);
  });

  it('builds encounter payloads with group-session metadata when no visit exists yet', () => {
    const updateVisitUuid = jest.fn();
    renderWorkspace({ updateVisitUuid });

    const [formBootstrapProps] = mockFormBootstrap.mock.calls[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      obs: [
        {
          concept: 'weight-concept',
          value: '70',
          groupMembers: [{ concept: 'height-concept', value: '175' }],
        },
      ],
    };

    act(() => {
      formBootstrapProps.handleEncounterCreate(payload);
    });

    const expectedObsDatetime = new Date('2026-04-15').toISOString();

    expect(payload.location).toBe('session-location');
    expect(payload.encounterDatetime).toBe(expectedObsDatetime);
    expect(payload.obs[0]).toEqual(
      expect.objectContaining({
        obsDatetime: expectedObsDatetime,
        groupMembers: [
          expect.objectContaining({
            concept: 'height-concept',
            value: '175',
            obsDatetime: expectedObsDatetime,
          }),
        ],
      }),
    );
    expect(payload.obs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ concept: 'concept-session-name', value: 'April Session' }),
        expect.objectContaining({ concept: 'concept-practitioner', value: 'Alice' }),
        expect.objectContaining({ concept: 'concept-notes', value: 'Bring notebooks' }),
        expect.objectContaining({ concept: 'concept-date', value: '2026-04-15' }),
        expect.objectContaining({ concept: 'concept-cohort-id', value: 'group-1' }),
        expect.objectContaining({ concept: 'concept-cohort-name', value: 'Nutrition Cohort' }),
        expect.objectContaining({ concept: 'concept-session-uuid', value: 'session-1' }),
      ]),
    );
    expect(payload.visit).toEqual({
      startDatetime: '2026-04-15',
      stopDatetime: '2026-04-15',
      uuid: 'generated-visit-uuid',
      patient: {
        uuid: 'patient-a',
      },
      location: {
        uuid: 'session-location',
      },
      visitType: {
        uuid: 'visit-type-1',
      },
    });
    expect(updateVisitUuid).toHaveBeenCalledWith('generated-visit-uuid');
  });

  it('wires patient switching and save actions through the workflow callbacks', async () => {
    const user = userEvent.setup();
    const saveEncounter = jest.fn();
    const submitForNext = jest.fn();
    renderWorkspace({ saveEncounter, submitForNext });

    const [formBootstrapProps] = mockFormBootstrap.mock.calls[0];

    act(() => {
      formBootstrapProps.handlePostResponse({ uuid: 'encounter-1' });
    });

    expect(saveEncounter).toHaveBeenCalledWith('encounter-1');

    await user.click(screen.getByTestId('patient-card-patient-b'));
    expect(submitForNext).toHaveBeenCalledWith('patient-b');

    await user.click(screen.getByRole('button', { name: 'Next patient' }));
    expect(submitForNext).toHaveBeenCalledWith();
  });
});
