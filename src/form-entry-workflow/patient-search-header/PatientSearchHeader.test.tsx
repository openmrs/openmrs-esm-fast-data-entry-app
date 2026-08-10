import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import PatientSearchHeader from './PatientSearchHeader';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import { showSnackbar, useConfig, useSession, type ConfigSchema, type Session } from '@openmrs/esm-framework';
import { useHsuIdIdentifier } from '../../hooks/location-tag.resource';

vi.mock('@openmrs/esm-framework', () => ({
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string, interpolation: { hsuLocation?: string; sessionLocation?: string }) => {
      if (interpolation?.hsuLocation) {
        return `Error: Patient at ${interpolation.hsuLocation} cannot be added to session at ${interpolation.sessionLocation}`;
      }
      return defaultValue || key;
    },
  }),
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
    cleanup();
  });

  it('triggers an error Snackbar when enforcePatientListLocationMatch is enabled and locations mismatch', async () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: false,
    } as ConfigSchema);

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
    } as ConfigSchema);

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
});
