import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showModal, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from '../../context/GroupFormWorkflowContext';
import GroupSearchHeader from './GroupSearchHeader';

let selectedGroup;

vi.mock('../group-search/CompactGroupSearch', () => ({
  __esModule: true,
  default: ({ selectGroupAction }) => (
    <button data-testid="compact-group-search" onClick={() => selectGroupAction(selectedGroup)}>
      Select group
    </button>
  ),
}));

const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConfig = vi.mocked(useConfig);
const mockUseSession = vi.mocked(useSession);

const renderGroupSearchHeader = (contextOverrides = {}) =>
  render(
    <GroupFormWorkflowContext.Provider
      value={
        {
          activeGroupUuid: null,
          setGroup: vi.fn(),
          destroySession: vi.fn(),
          ...contextOverrides,
        } as never
      }
    >
      <GroupSearchHeader />
    </GroupFormWorkflowContext.Provider>,
  );

describe('GroupSearchHeader', () => {
  beforeEach(() => {
    vi.mocked(showModal).mockReturnValue(vi.fn());
    mockUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'session-location',
        display: 'General Hospital',
      },
    } as never);
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
    });
  });

  it('blocks group selection when location enforcement is enabled and locations mismatch', async () => {
    const user = userEvent.setup();
    const setGroup = vi.fn();

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
    const setGroup = vi.fn();

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
    const destroySession = vi.fn();

    renderGroupSearchHeader({ destroySession });

    await user.click(screen.getByRole('button', { name: 'Create New Group' }));

    expect(showModal).toHaveBeenCalledWith(
      'fde-add-group-modal',
      expect.objectContaining({ isCreate: true, onSave: expect.any(Function) }),
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(destroySession).toHaveBeenCalledTimes(1);
  });

  it.each(['unmount', 'workflow change'])('ignores a pending save after %s', async (change) => {
    const user = userEvent.setup();
    const setGroup = vi.fn();
    const dispose = vi.fn();
    vi.mocked(showModal).mockReturnValue(dispose);
    const content = (activeFormUuid: string) => (
      <GroupFormWorkflowContext.Provider value={{ activeFormUuid, setGroup } as never}>
        <GroupSearchHeader />
      </GroupFormWorkflowContext.Provider>
    );

    const { rerender, unmount } = render(content('first-form'));

    await user.click(screen.getByRole('button', { name: 'Create New Group' }));

    const onSave = vi.mocked(showModal).mock.calls.at(-1)[1].onSave as (group: { uuid: string }) => void;

    if (change === 'unmount') {
      unmount();
    } else {
      rerender(content('second-form'));
    }

    expect(dispose).toHaveBeenCalledOnce();

    onSave({ uuid: 'saved-group' });

    expect(setGroup).not.toHaveBeenCalled();
  });

  it('applies a save after the dialog closes while the workflow is still active', async () => {
    const user = userEvent.setup();
    const setGroup = vi.fn();

    renderGroupSearchHeader({ setGroup });

    await user.click(screen.getByRole('button', { name: 'Create New Group' }));

    const onSave = vi.mocked(showModal).mock.calls.at(-1)[1].onSave as (group: { uuid: string }) => void;

    vi.mocked(showModal).mock.results.at(-1).value();
    onSave({ uuid: 'saved-group' });

    expect(setGroup).toHaveBeenCalledWith({ uuid: 'saved-group' });
  });
});
