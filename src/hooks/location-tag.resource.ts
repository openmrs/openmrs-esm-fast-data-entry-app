import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type Identifier } from '../types';

export function useHsuIdIdentifier(patientUuid: string) {
  const hsuIdType = '05a29f94-c0ed-11e2-94be-8c13b969e334';
  const url = patientUuid ? `ws/rest/v1/patient/${patientUuid}/identifier` : null;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<Identifier> } }, Error>(url, openmrsFetch);

  const hsuIdentifier = data?.data?.results.length
    ? data.data.results.find((id: Identifier) => id.identifierType.uuid == hsuIdType)
    : undefined;

  return {
    hsuIdentifier: hsuIdentifier,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
