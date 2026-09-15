import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface CohortPayload {
  uuid?: string;
  name: string;
  cohortType: string;
  location: string;
  cohortMembers: Array<{ patient: string; startDate: string }>;
}

export async function saveCohort(cohort: CohortPayload) {
  const url = `${restBaseUrl}/cohortm/cohort${cohort.uuid ? `/${cohort.uuid}` : ''}`;
  const { data } = await openmrsFetch<{ uuid: string; name: string }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: cohort,
  });
  return data;
}
