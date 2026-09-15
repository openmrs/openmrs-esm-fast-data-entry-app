import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import {
  type ConfigSchema,
  type Session,
  showModal,
  showSnackbar,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import { useHsuIdIdentifier } from '../../hooks/location-tag.resource';
import PatientSearchHeader from './PatientSearchHeader';

vi.mock('@openmrs/esm-framework', () => ({
  showModal: vi.fn(() => vi.fn()),
  ExtensionSlot: ({ state }) => (
    <button data-testid="mock-search-select" onClick={() => state.selectPatientAction('patient-123')}>
      Select Patient
    </button>
  ),
  interpolateUrl: vi.fn((url) => url),
  navigate: vi.fn(),
  showSnackbar: vi.fn(),
  useConfig: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('../../hooks/location-tag.resource', () => ({
  useHsuIdIdentifier: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children }) => <div>{children}</div>,
}));

const mockShowSnackbar = showSnackbar as MockedFunction<typeof showSnackbar>;
const mockUseConfig = useConfig as MockedFunction<typeof useConfig>;
const mockUseSession = useSession as MockedFunction<typeof useSession>;
const mockUseHsuIdIdentifier = useHsuIdIdentifier as MockedFunction<typeof useHsuIdIdentifier>;

describe('PatientSearchHeader - Enforcement Feature', () => {
  const mockContext = {
    addPatient: vi.fn(),
    workflowState: 'NEW_PATIENT',
    activeFormUuid: 'form-123',
  };

  const sessionLocation = { uuid: 'loc-session', display: 'General Hospital' };
  const mismatchedHsuLocation = {
    location: { uuid: 'loc-other', display: 'Remote Clinic' },
  };

  beforeEach(() => {
    mockUseSession.mockReturnValue({ sessionLocation } as Session);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('triggers an error Snackbar when enforcePatientListLocationMatch is enabled and locations mismatch', async () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: false,
    });

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: mismatchedHsuLocation,
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    render(
      <FormWorkflowContext.Provider value={mockContext as never}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>,
    );

    const searchBar = screen.getByTestId('mock-search-select');

    fireEvent.click(searchBar);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Location Mismatch',
          subtitle: expect.stringContaining('Remote Clinic'),
        }),
      );
    });

    expect(mockContext.addPatient).not.toHaveBeenCalled();
  });

  it('does NOT trigger snackbar and adds patient if locations match even if enforcement is on', async () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
    });

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: { location: { uuid: 'loc-session', display: 'General Hospital' } },
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    render(
      <FormWorkflowContext.Provider value={mockContext as never}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('mock-search-select'));

    await waitFor(() => {
      expect(mockContext.addPatient).toHaveBeenCalledWith('patient-123');
      expect(mockShowSnackbar).not.toHaveBeenCalled();
    });
  });

  it('preserves confirmation when identifier data revalidates', () => {
    mockUseConfig.mockReturnValue({ patientLocationMismatchCheck: true });
    mockUseHsuIdIdentifier.mockReturnValue({ hsuIdentifier: mismatchedHsuLocation } as ReturnType<
      typeof useHsuIdIdentifier
    >);

    const dispose = vi.fn();
    vi.mocked(showModal).mockReturnValue(dispose);
    const content = () => (
      <FormWorkflowContext.Provider value={mockContext as never}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>
    );

    const { rerender } = render(content());

    fireEvent.click(screen.getByTestId('mock-search-select'));

    expect(showModal).toHaveBeenCalledOnce();
    expect(dispose).not.toHaveBeenCalled();

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: {
        ...mismatchedHsuLocation,
        identifier: 'updated',
        location: { ...mismatchedHsuLocation.location },
      },
    } as ReturnType<typeof useHsuIdIdentifier>);
    rerender(content());

    expect(showModal).toHaveBeenCalledOnce();
    expect(dispose).not.toHaveBeenCalled();
    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: { location: { ...sessionLocation } },
    } as ReturnType<typeof useHsuIdIdentifier>);
    rerender(content());

    expect(dispose).toHaveBeenCalledOnce();
    expect(showModal).toHaveBeenCalledOnce();
    expect(mockContext.addPatient).toHaveBeenCalledWith('patient-123');
  });

  it('clears a pending confirmation when the workflow changes', () => {
    mockUseConfig.mockReturnValue({ patientLocationMismatchCheck: true });
    mockUseHsuIdIdentifier.mockReturnValue({ hsuIdentifier: mismatchedHsuLocation } as ReturnType<
      typeof useHsuIdIdentifier
    >);

    const dispose = vi.fn();
    vi.mocked(showModal).mockReturnValue(dispose);
    const content = (activeFormUuid: string) => (
      <FormWorkflowContext.Provider value={{ ...mockContext, activeFormUuid } as never}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>
    );

    const { rerender } = render(content('first-form'));

    fireEvent.click(screen.getByTestId('mock-search-select'));
    rerender(content('second-form'));

    expect(dispose).toHaveBeenCalled();
    expect(mockContext.addPatient).not.toHaveBeenCalled();

    const opened = vi.mocked(showModal).mock.calls.length;

    rerender(content('second-form'));

    expect(showModal).toHaveBeenCalledTimes(opened);
  });
});
