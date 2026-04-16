import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import GroupFormWorkflowContext from '../context/GroupFormWorkflowContext';
import SessionMetaWorkspace from './SessionMetaWorkspace';

jest.mock('../CancelModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./SessionDetailsForm', () => ({
  __esModule: true,
  default: function MockSessionDetailsForm() {
    const { register, setValue } = useFormContext();

    useEffect(() => {
      setValue('sessionName', 'April Session');
      setValue('practitionerName', 'Alice');
      setValue('sessionDate', ['2026-04-15']);
      setValue('sessionNotes', 'Bring notebooks');
    }, [setValue]);

    return (
      <>
        <input aria-label="Session Name" {...register('sessionName', { required: true })} />
        <input aria-label="Practitioner Name" {...register('practitionerName', { required: true })} />
        <input aria-label="Session Notes" {...register('sessionNotes', { required: true })} />
      </>
    );
  },
}));

const renderSessionMetaWorkspace = (contextOverrides = {}) =>
  render(
    <GroupFormWorkflowContext.Provider
      value={
        {
          workflowState: 'NEW_GROUP_SESSION',
          patientUuids: ['patient-a'],
          activeGroupUuid: 'group-1',
          setSessionMeta: jest.fn(),
          ...contextOverrides,
        } as never
      }
    >
      <SessionMetaWorkspace />
    </GroupFormWorkflowContext.Provider>,
  );

describe('SessionMetaWorkspace', () => {
  it('submits the session metadata with the normalized session date', async () => {
    const user = userEvent.setup();
    const setSessionMeta = jest.fn();
    renderSessionMetaWorkspace({ setSessionMeta });

    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => {
      expect(setSessionMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          groupUuid: 'group-1',
          sessionName: 'April Session',
          practitionerName: 'Alice',
          sessionDate: '2026-04-15',
          sessionNotes: 'Bring notebooks',
        }),
      );
    });
  });

  it('shows the group selection error when submitted without a chosen group', async () => {
    const user = userEvent.setup();
    const setSessionMeta = jest.fn();
    renderSessionMetaWorkspace({
      activeGroupUuid: null,
      setSessionMeta,
    });

    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    expect(await screen.findByText('Please choose a group.')).toBeInTheDocument();
    expect(setSessionMeta).not.toHaveBeenCalled();
  });

  it('disables session creation until the participant list is populated', () => {
    renderSessionMetaWorkspace({
      patientUuids: [],
    });

    expect(screen.getByRole('button', { name: 'Create New Session' })).toBeDisabled();
  });
});
