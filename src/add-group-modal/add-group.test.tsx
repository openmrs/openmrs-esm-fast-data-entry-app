import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, openmrsFetch, useConfig, useSession, usePatient } from '@openmrs/esm-framework';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddGroupModal from './add-group.modal';

vi.mock('../hooks', async () => ({ usePostCohort: (await import('../hooks/usePostEndpoint')).usePostCohort }));
vi.mock('../hooks/location-tag.resource', () => ({ useHsuIdIdentifier: () => ({ hsuIdentifier: null }) }));

beforeEach(() => {
  vi.mocked(useConfig).mockReturnValue({ groupSessionConcepts: { cohortTypeId: 'cohort-type' } });
  vi.mocked(useSession).mockReturnValue({ sessionLocation: { uuid: 'clinic' } } as ReturnType<typeof useSession>);
  vi.mocked(usePatient).mockReturnValue({ patient: null, error: null, isLoading: true } as ReturnType<
    typeof usePatient
  >);
});

describe('group modal', () => {
  it.each([true, false])('handles a save after dismissal when the owner is active: %s', async (ownerActive) => {
    const user = userEvent.setup();
    let resolve: (value: unknown) => void;
    vi.mocked(openmrsFetch).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const setGroup = vi.fn(),
      close = vi.fn();
    const { unmount } = render(
      <AddGroupModal
        close={close}
        setGroup={setGroup}
        isOwnerMounted={() => ownerActive}
        isCreate
        patients={[{ uuid: 'patient-1' }]}
        groupName="Nutrition"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Create Group' }));
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create Group' })).toBeDisabled();
    expect(openmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cohortm/cohort'),
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          name: 'Nutrition',
          cohortMembers: [{ patient: 'patient-1', startDate: expect.any(String) }],
        }),
      }),
    );
    unmount();
    await act(async () => {
      resolve({ data: { uuid: 'group-1', name: 'Nutrition' } });
      await vi.mocked(openmrsFetch).mock.results[0].value;
    });
    if (!ownerActive) {
      expect(setGroup).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
      return;
    }
    expect(setGroup).toHaveBeenCalledWith({
      uuid: 'group-1',
      name: 'Nutrition',
      cohortMembers: [{ patient: { uuid: 'patient-1' } }],
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('keeps the modal open on a failed save', async () => {
    const user = userEvent.setup();
    vi.mocked(openmrsFetch).mockRejectedValueOnce(new Error('Save failed'));
    const close = vi.fn(),
      setGroup = vi.fn();
    render(
      <AddGroupModal
        close={close}
        setGroup={setGroup}
        isCreate
        patients={[{ uuid: 'patient-1' }]}
        groupName="Nutrition"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Create Group' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Group' })).toBeEnabled());
    expect(close).not.toHaveBeenCalled();
    expect(setGroup).not.toHaveBeenCalled();
  });
  it('reports a group save failure after dismissal', async () => {
    let reject: (error: Error) => void;
    const pending = new Promise<never>((_, fail) => {
      reject = fail;
    });
    vi.mocked(openmrsFetch).mockReturnValueOnce(pending);
    const user = userEvent.setup();
    const { unmount } = render(
      <AddGroupModal
        close={vi.fn()}
        setGroup={vi.fn()}
        isCreate
        patients={[{ uuid: 'patient-1' }]}
        groupName="Nutrition"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Create Group' }));
    unmount();
    await act(async () => {
      reject(new Error('Save failed'));
      await pending.catch(() => {});
    });
    expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
  });
});
