import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from '../../context/GroupFormWorkflowContext';
import GroupSearchHeader from './GroupSearchHeader';

let selectedGroup;

jest.mock('../group-search/CompactGroupSearch', () => ({
  __esModule: true,
  default: ({ selectGroupAction }) => (
    <button data-testid="compact-group-search" onClick={() => selectGroupAction(selectedGroup)}>
      Select group
    </button>
  ),
}));

jest.mock('../../add-group-modal/AddGroupModal', () => ({
  __esModule: true,
  default: ({ isOpen }) => (isOpen ? <div data-testid="add-group-modal" /> : null),
}));

const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked(useConfig);
const mockUseSession = jest.mocked(useSession);

const renderGroupSearchHeader = (contextOverrides = {}) =>
  render(
    <GroupFormWorkflowContext.Provider
      value={
        {
          activeGroupUuid: null,
          setGroup: jest.fn(),
          destroySession: jest.fn(),
          ...contextOverrides,
        } as never
      }
    >
      <GroupSearchHeader />
    </GroupFormWorkflowContext.Provider>,
  );

describe('GroupSearchHeader', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'session-location',
        display: 'General Hospital',
      },
    } as never);
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
    } as never);
  });

  it('blocks group selection when location enforcement is enabled and locations mismatch', async () => {
    const user = userEvent.setup();
    const setGroup = jest.fn();
    selectedGroup = {
      uuid: 'group-1',
      location: {
        uuid: 'other-location',
        display: 'Remote Clinic',
      },
    };

    renderGroupSearchHeader({ setGroup });

    await user.click(screen.getByTestId('compact-group-search'));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: 'Cannot select group from Remote Clinic for a session at General Hospital',
      }),
    );
    expect(setGroup).not.toHaveBeenCalled();
  });

  it('sorts cohort members by display name before storing the selected group', async () => {
    const user = userEvent.setup();
    const setGroup = jest.fn();
    selectedGroup = {
      uuid: 'group-1',
      location: {
        uuid: 'session-location',
        display: 'General Hospital',
      },
      cohortMembers: [
        { patient: { person: { names: [{ display: 'zoe zebra' }] } } },
        { patient: { person: { names: [{ display: 'Alice Able' }] } } },
        { patient: { person: { names: [{ display: 'ben Brown' }] } } },
      ],
    };

    renderGroupSearchHeader({ setGroup });

    await user.click(screen.getByTestId('compact-group-search'));

    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup.mock.calls[0][0].cohortMembers.map((member) => member.patient.person.names[0].display)).toEqual([
      'Alice Able',
      'ben Brown',
      'zoe zebra',
    ]);
  });

  it('opens the add-group modal and lets the user cancel the session', async () => {
    const user = userEvent.setup();
    const destroySession = jest.fn();
    renderGroupSearchHeader({ destroySession });

    await user.click(screen.getByRole('button', { name: 'Create New Group' }));
    expect(screen.getByTestId('add-group-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(destroySession).toHaveBeenCalledTimes(1);
  });
});
