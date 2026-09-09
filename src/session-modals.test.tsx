import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CancelSessionModal from './cancel-session.modal';
import CompleteSessionModal from './complete-session.modal';
import PatientLocationMismatchModal from './form-entry-workflow/patient-search-header/patient-location-mismatch.modal';

describe('workflow modals', () => {
  it('cancels without modifying a session', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onDiscard = vi.fn();
    const onSaveAndClose = vi.fn();

    render(<CancelSessionModal {...{ close, onDiscard, onSaveAndClose }} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(close).toHaveBeenCalledOnce();
    expect(onDiscard).not.toHaveBeenCalled();
    expect(onSaveAndClose).not.toHaveBeenCalled();
  });

  it.each(['Discard', 'Save Session'])('dispatches %s and closes', async (action) => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const onSaveAndClose = vi.fn();
    const close = vi.fn();

    render(<CancelSessionModal {...{ close, onDiscard, onSaveAndClose }} />);

    await user.click(screen.getByRole('button', { name: new RegExp(action) }));

    const selected = action === 'Discard' ? onDiscard : onSaveAndClose;
    const other = action === 'Discard' ? onSaveAndClose : onDiscard;

    expect(selected).toHaveBeenCalledOnce();
    expect(other).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledOnce();
    expect(selected.mock.invocationCallOrder[0]).toBeLessThan(close.mock.invocationCallOrder[0]);
  });

  it('completes using the supplied workflow action', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onComplete = vi.fn();

    render(<CompleteSessionModal {...{ close, onComplete }} />);

    await user.click(screen.getByRole('button', { name: 'Complete' }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('only confirms a mismatched patient when Continue is chosen', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onConfirm = vi.fn();

    render(
      <PatientLocationMismatchModal
        {...{ close, onConfirm }}
        sessionLocation={{ display: 'Clinic' }}
        hsuLocation={{ display: 'Other clinic' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledTimes(2);
  });
});
