import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { fetchCurrentPatient } from '@openmrs/esm-framework';
import useGetPatient from './useGetPatient';

jest.mock('@openmrs/esm-framework', () => ({
  fetchCurrentPatient: jest.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return {
    promise,
    resolve,
  };
};

const mockFetchCurrentPatient = fetchCurrentPatient as jest.MockedFunction<typeof fetchCurrentPatient>;

const TestHarness = ({ patientUuid }: { patientUuid?: string }) => {
  const patient = useGetPatient(patientUuid);
  const patientName = patient ? (patient as { name: string }).name : 'none';

  return <div data-testid="patient-name">{patientName}</div>;
};

describe('useGetPatient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ignores stale responses after patientUuid changes', async () => {
    const patientARequest = createDeferred<fhir.Patient>();
    const patientBRequest = createDeferred<fhir.Patient>();

    mockFetchCurrentPatient.mockImplementation((uuid) => {
      if (uuid === 'patient-a') {
        return patientARequest.promise;
      }

      if (uuid === 'patient-b') {
        return patientBRequest.promise;
      }

      throw new Error(`Unexpected patient uuid: ${uuid}`);
    });

    const { rerender } = render(<TestHarness patientUuid="patient-a" />);

    rerender(<TestHarness patientUuid="patient-b" />);

    await act(async () => {
      patientBRequest.resolve({ id: 'patient-b', name: 'Patient B' } as unknown as fhir.Patient);
      await patientBRequest.promise;
    });

    expect(screen.getByTestId('patient-name')).toHaveTextContent('Patient B');

    await act(async () => {
      patientARequest.resolve({ id: 'patient-a', name: 'Patient A' } as unknown as fhir.Patient);
      await patientARequest.promise;
    });

    expect(screen.getByTestId('patient-name')).toHaveTextContent('Patient B');
    expect(mockFetchCurrentPatient).toHaveBeenNthCalledWith(1, 'patient-a');
    expect(mockFetchCurrentPatient).toHaveBeenNthCalledWith(2, 'patient-b');
  });

  it('clears the previous patient while the next patient is loading', async () => {
    const patientBRequest = createDeferred<fhir.Patient>();
    mockFetchCurrentPatient.mockImplementation((uuid) => {
      if (uuid === 'patient-a') {
        return Promise.resolve({ id: 'patient-a', name: 'Patient A' } as unknown as fhir.Patient);
      }

      if (uuid === 'patient-b') {
        return patientBRequest.promise;
      }

      throw new Error(`Unexpected patient uuid: ${uuid}`);
    });

    const { rerender } = render(<TestHarness patientUuid="patient-a" />);

    expect(await screen.findByText('Patient A')).toBeInTheDocument();

    rerender(<TestHarness patientUuid="patient-b" />);

    expect(screen.getByTestId('patient-name')).toHaveTextContent('none');
  });

  it('clears the patient and skips fetching when patientUuid is removed', async () => {
    mockFetchCurrentPatient.mockResolvedValue({ id: 'patient-a', name: 'Patient A' } as unknown as fhir.Patient);

    const { rerender } = render(<TestHarness patientUuid="patient-a" />);

    expect(await screen.findByText('Patient A')).toBeInTheDocument();

    rerender(<TestHarness />);

    expect(screen.getByTestId('patient-name')).toHaveTextContent('none');
    expect(mockFetchCurrentPatient).toHaveBeenCalledTimes(1);
  });
});
