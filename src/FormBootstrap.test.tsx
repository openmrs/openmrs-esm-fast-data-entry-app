import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { detach, ExtensionSlot } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from './context/GroupFormWorkflowContext';
import useGetPatient from './hooks/useGetPatient';
import FormBootstrap from './FormBootstrap';

vi.mock('./hooks/useGetPatient', () => ({ default: vi.fn() }));

const mockDetach = vi.mocked(detach);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockUseGetPatient = useGetPatient as MockedFunction<typeof useGetPatient>;

const renderFormBootstrap = (props = {}) =>
  render(
    <GroupFormWorkflowContext.Provider
      value={
        {
          activeSessionMeta: {
            sessionName: 'April Session',
            practitionerName: 'Alice',
            sessionDate: '2026-04-15',
            sessionNotes: 'Follow-up notes',
          },
        } as never
      }
    >
      <FormBootstrap
        formUuid="triage-form"
        patientUuid="patient-1"
        visitUuid="visit-1"
        visitTypeUuid="visit-type-1"
        encounterUuid="encounter-1"
        handlePostResponse={vi.fn()}
        handleEncounterCreate={vi.fn()}
        handleOnValidate={vi.fn()}
        hidePatientBanner={true}
        {...props}
      />
    </GroupFormWorkflowContext.Provider>,
  );

describe('FormBootstrap', () => {
  beforeEach(() => {
    mockExtensionSlot.mockImplementation(() => <div data-testid="form-widget-slot" />);
    mockUseGetPatient.mockReturnValue({
      id: 'patient-1',
      name: [{ given: ['Ada'], family: 'Lovelace' }],
    } as fhir.Patient);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('passes the expected widget state once the patient is available', () => {
    renderFormBootstrap();

    expect(screen.getByTestId('form-widget-slot')).toBeInTheDocument();

    const [{ name, state }] = mockExtensionSlot.mock.calls[0];
    expect(name).toBe('form-widget-slot');
    expect(state).toEqual(
      expect.objectContaining({
        view: 'form',
        formUuid: 'triage-form',
        visitUuid: 'visit-1',
        visitTypeUuid: 'visit-type-1',
        patientUuid: 'patient-1',
        patient: expect.objectContaining({ id: 'patient-1' }),
        encounterUuid: 'encounter-1',
        showDiscardSubmitButtons: false,
        hideControls: true,
        hidePatientBanner: true,
        preFilledQuestions: {
          sessionName: 'April Session',
          practitionerName: 'Alice',
          sessionDate: '2026-04-15',
          sessionNotes: 'Follow-up notes',
          encDate: '2026-04-15',
        },
      }),
    );
  });

  it('refreshes the widget after submit and detaches it on unmount', () => {
    vi.useFakeTimers();
    const handlePostResponse = vi.fn();
    const { unmount } = renderFormBootstrap({ handlePostResponse });

    const [{ state }] = mockExtensionSlot.mock.calls[0];
    const handlePostResponseFromState = state.handlePostResponse as (encounter: { uuid: string }) => void;

    act(() => {
      handlePostResponseFromState({ uuid: 'encounter-2' });
    });

    expect(handlePostResponse).toHaveBeenCalledWith({ uuid: 'encounter-2' });
    expect(screen.queryByTestId('form-widget-slot')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByTestId('form-widget-slot')).toBeInTheDocument();
    expect(mockExtensionSlot).toHaveBeenCalledTimes(2);

    unmount();

    expect(mockDetach).toHaveBeenCalledWith('form-widget-slot', 'form-widget-slot');
  });
});
