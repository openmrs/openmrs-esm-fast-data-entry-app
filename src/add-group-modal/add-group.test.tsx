import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch, showSnackbar, useConfig, usePatient, useSession } from '@openmrs/esm-framework';
import AddGroupModal from './add-group.modal';

vi.mock('../hooks/location-tag.resource', () => ({ useHsuIdIdentifier: () => ({ hsuIdentifier: null }) }));

beforeEach(() => {
  vi.mocked(useConfig).mockReturnValue({ groupSessionConcepts: { cohortTypeId: 'cohort-type' } });
  vi.mocked(useSession).mockReturnValue({ sessionLocation: { uuid: 'clinic' } } as ReturnType<typeof useSession>);
  vi.mocked(usePatient).mockReturnValue({ patient: null, error: null, isLoading: true } as ReturnType<
    typeof usePatient
  >);
});

describe('group modal', () => {
  it('reports a successful save after dismissal', async () => {
    const user = userEvent.setup();
    let resolve: (value: unknown) => void;
    vi.mocked(openmrsFetch).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const onSave = vi.fn();
    const close = vi.fn();

    const { unmount } = render(
      <AddGroupModal close={close} onSave={onSave} isCreate patients={[{ uuid: 'patient-1' }]} groupName="Nutrition" />,
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

    expect(onSave).toHaveBeenCalledWith({
      uuid: 'group-1',
      name: 'Nutrition',
      cohortMembers: [{ patient: { uuid: 'patient-1' } }],
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it.each([
    new Error('Save failed'),
    { responseBody: { message: 'Save failed', fieldErrors: { name: [{ message: 'Name already exists' }] } } },
    {
      responseBody: { error: { message: 'Save failed', fieldErrors: { name: [{ message: 'Name already exists' }] } } },
    },
  ])('keeps the modal open and reports save errors: %j', async (error) => {
    const user = userEvent.setup();
    vi.mocked(openmrsFetch).mockRejectedValueOnce(error);
    const close = vi.fn();
    const onSave = vi.fn();

    render(
      <AddGroupModal close={close} onSave={onSave} isCreate patients={[{ uuid: 'patient-1' }]} groupName="Nutrition" />,
    );

    await user.click(screen.getByRole('button', { name: 'Create Group' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Group' })).toBeEnabled());
    expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error', subtitle: 'Save failed' }));

    if ('responseBody' in error) {
      expect(screen.getByText('Name already exists')).toBeInTheDocument();
    }

    expect(close).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('updates an existing cohort and applies the saved group', async () => {
    const user = userEvent.setup();
    vi.mocked(openmrsFetch).mockResolvedValueOnce(
      Object.assign(new Response(), { data: { uuid: 'group-1', name: 'Nutrition' } }),
    );
    const close = vi.fn();
    const onSave = vi.fn();

    render(
      <AddGroupModal
        close={close}
        onSave={onSave}
        cohortUuid="group-1"
        patients={[{ uuid: 'patient-1' }]}
        groupName="Nutrition"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(openmrsFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/cohortm\/cohort\/group-1$/),
      expect.objectContaining({ method: 'POST', body: expect.objectContaining({ uuid: 'group-1' }) }),
    );
    expect(onSave).toHaveBeenCalledWith({
      uuid: 'group-1',
      name: 'Nutrition',
      cohortMembers: [{ patient: { uuid: 'patient-1' } }],
    });
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
        onSave={vi.fn()}
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
