import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientSearchHeader from './PatientSearchHeader';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { useHsuIdIdentifier } from '../../hooks/location-tag.resource';

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: ({ state }) => (
    <button data-testid="mock-search-select" onClick={() => state.selectPatientAction('patient-123')}>
      Select Patient
    </button>
  ),
  interpolateUrl: jest.fn((url) => url),
  navigate: jest.fn(),
  showSnackbar: jest.fn(),
  useConfig: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue, interpolation) => {
      if (interpolation?.hsuLocation) {
        return `Error: Patient at ${interpolation.hsuLocation} cannot be added to session at ${interpolation.sessionLocation}`;
      }
      return defaultValue || key;
    },
  }),
}));

jest.mock('../../hooks/location-tag.resource', () => ({
  useHsuIdIdentifier: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children }) => <div>{children}</div>,
}));

describe('PatientSearchHeader - Enforcement Feature', () => {
  const mockContext = {
    addPatient: jest.fn(),
    workflowState: 'NEW_PATIENT',
    activeFormUuid: 'form-123',
  };

  const sessionLocation = { uuid: 'loc-session', display: 'General Hospital' };
  const mismatchedHsuLocation = {
    location: { uuid: 'loc-other', display: 'Remote Clinic' },
  };

  beforeEach(() => {
    useSession.mockReturnValue({ sessionLocation });
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('triggers an error Snackbar when enforcePatientListLocationMatch is enabled and locations mismatch', async () => {
    useConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: false,
    });

    useHsuIdIdentifier.mockReturnValue({ hsuIdentifier: mismatchedHsuLocation });

    render(
      <FormWorkflowContext.Provider value={mockContext}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>,
    );

    const searchBar = screen.getByTestId('mock-search-select');
    fireEvent.click(searchBar);

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
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
    useConfig.mockReturnValue({ enforcePatientListLocationMatch: true });
    useHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: { location: { uuid: 'loc-session', display: 'General Hospital' } },
    });

    render(
      <FormWorkflowContext.Provider value={mockContext}>
        <PatientSearchHeader />
      </FormWorkflowContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('mock-search-select'));

    await waitFor(() => {
      expect(mockContext.addPatient).toHaveBeenCalledWith('patient-123');
      expect(showSnackbar).not.toHaveBeenCalled();
    });
  });
});
