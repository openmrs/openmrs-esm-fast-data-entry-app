import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function useFormName(formUuid?: string): string | undefined {
  const { data } = useSWR<{ data: { name?: string; display?: string } }>(
    formUuid ? `${restBaseUrl}/form/${formUuid}?v=custom:(uuid,name,display)` : null,
    openmrsFetch,
  );
  return data?.data?.display ?? data?.data?.name;
}
