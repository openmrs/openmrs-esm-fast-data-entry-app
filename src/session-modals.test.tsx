import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CancelSessionModal from './cancel-session.modal';
import CompleteSessionModal from './complete-session.modal';
import PatientLocationMismatchModal from './form-entry-workflow/patient-search-header/patient-location-mismatch.modal';

describe('workflow modals', () => {
  it('cancels without modifying a session', async () => {
    const user = userEvent.setup();
    const close = vi.fn(),
      onDiscard = vi.fn(),
      onSaveAndClose = vi.fn();
    render(<CancelSessionModal {...{ close, onDiscard, onSaveAndClose }} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledOnce();
    expect(onDiscard).not.toHaveBeenCalled();
    expect(onSaveAndClose).not.toHaveBeenCalled();
  });

  it.each(['Discard', 'Save Session'])('waits for %s before closing', async (action) => {
    const user = userEvent.setup();
    let resolve: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    const callback = vi.fn(() => pending),
      close = vi.fn();
    render(<CancelSessionModal close={close} onDiscard={callback} onSaveAndClose={callback} />);
    await user.click(screen.getByRole('button', { name: new RegExp(action) }));
    expect(callback).toHaveBeenCalledOnce();
    expect(close).not.toHaveBeenCalled();
    resolve();
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
  });

  it('completes using the supplied workflow action', async () => {
    const user = userEvent.setup();
    const close = vi.fn(),
      onComplete = vi.fn();
    render(<CompleteSessionModal {...{ close, onComplete }} />);
    await user.click(screen.getByRole('button', { name: 'Complete' }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('only confirms a mismatched patient when Continue is chosen', async () => {
    const user = userEvent.setup();
    const close = vi.fn(),
      onConfirm = vi.fn();
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
