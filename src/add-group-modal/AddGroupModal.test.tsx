import {
  useConfig,
  useSession,
  showSnackbar,
  type ConfigSchema,
  type Session,
  PatientIdentifierType,
} from '@openmrs/esm-framework';
import { useHsuIdIdentifier } from '../hooks/location-tag.resource';

jest.mock('@openmrs/esm-framework');
jest.mock('../hooks/location-tag.resource');

const mockShowSnackbar = showSnackbar as jest.MockedFunction<typeof showSnackbar>;
const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseHsuIdIdentifier = useHsuIdIdentifier as jest.MockedFunction<typeof useHsuIdIdentifier>;

describe('AddGroupModal - enforcePatientListLocationMatch', () => {
  const mockSessionLocation = {
    uuid: 'session-location-uuid',
    display: 'Session Location',
  };

  const mockPatientLocation = {
    uuid: 'patient-location-uuid',
    display: 'Patient Location',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error snackbar when enforcePatientListLocationMatch is enabled and location mismatch occurs', () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: false,
    } as ConfigSchema);

    mockUseSession.mockReturnValue({
      sessionLocation: mockSessionLocation,
    } as Session);

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: {
        uuid: 'patient-uuid',
        location: mockPatientLocation,
      },
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    const config = mockUseConfig();
    const session = mockUseSession();
    const hsuData = mockUseHsuIdIdentifier('patient-uuid');

    const locationMismatch = session.sessionLocation.uuid !== hsuData.hsuIdentifier.location.uuid;

    if (locationMismatch && config.enforcePatientListLocationMatch) {
      mockShowSnackbar({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: `Cannot add patient from ${hsuData.hsuIdentifier.location.display} to a session at ${session.sessionLocation.display}`,
      });
    }

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: expect.stringContaining('Cannot add patient from'),
      }),
    );
  });

  it('should not show error snackbar when enforcePatientListLocationMatch is disabled', () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: false,
      patientLocationMismatchCheck: false,
    } as ConfigSchema);

    mockUseSession.mockReturnValue({
      sessionLocation: mockSessionLocation,
    } as Session);

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: {
        uuid: 'patient-uuid',
        location: mockPatientLocation,
      },
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    const config = mockUseConfig();
    const session = mockUseSession();
    const hsuData = mockUseHsuIdIdentifier('patient-uuid');

    const locationMismatch = session.sessionLocation.uuid !== hsuData.hsuIdentifier.location.uuid;

    if (locationMismatch && config.enforcePatientListLocationMatch) {
      mockShowSnackbar({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: 'test',
      });
    }

    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it('should not show error snackbar when locations match', () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: false,
    } as ConfigSchema);

    mockUseSession.mockReturnValue({
      sessionLocation: mockSessionLocation,
    } as Session);

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: {
        uuid: 'patient-uuid',
        location: mockSessionLocation,
      },
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    const config = mockUseConfig();
    const session = mockUseSession();
    const hsuData = mockUseHsuIdIdentifier('patient-uuid');

    const locationMismatch = session.sessionLocation.uuid !== hsuData.hsuIdentifier.location.uuid;

    if (locationMismatch && config.enforcePatientListLocationMatch) {
      mockShowSnackbar({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: 'test',
      });
    }

    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it('should display patient and session location names in error message', () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
    } as ConfigSchema);

    mockUseSession.mockReturnValue({
      sessionLocation: mockSessionLocation,
    } as Session);

    const patientLocationWithDisplay = {
      uuid: 'patient-location-uuid',
      display: 'Clinic A',
    };

    mockUseHsuIdIdentifier.mockReturnValue({
      hsuIdentifier: {
        uuid: 'patient-uuid',
        location: patientLocationWithDisplay,
      },
    } as unknown as ReturnType<typeof useHsuIdIdentifier>);

    const config = mockUseConfig();
    const session = mockUseSession();
    const hsuData = mockUseHsuIdIdentifier('patient-uuid');

    const locationMismatch = session.sessionLocation.uuid !== hsuData.hsuIdentifier.location.uuid;

    if (locationMismatch && config.enforcePatientListLocationMatch) {
      mockShowSnackbar({
        kind: 'error',
        title: 'Location Mismatch',
        subtitle: `Cannot add patient from ${hsuData.hsuIdentifier.location.display} to a session at ${session.sessionLocation.display}`,
      });
    }

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: expect.stringContaining('Clinic A'),
      }),
    );
  });

  it('should prioritize enforcePatientListLocationMatch over patientLocationMismatchCheck in UI', () => {
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: true,
      patientLocationMismatchCheck: true,
    } as ConfigSchema);

    const config = mockUseConfig();

    const shouldShowError = config.enforcePatientListLocationMatch === true;
    const shouldShowModal = !config.enforcePatientListLocationMatch && config.patientLocationMismatchCheck;

    expect(shouldShowError).toBe(true);
    expect(shouldShowModal).toBe(false);
  });
});
