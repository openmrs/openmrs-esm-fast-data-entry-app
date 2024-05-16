import { openmrsFetch, userHasAccess, useSession, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const customFormRepresentation =
  '(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))';

const formEncounterUrl = `${restBaseUrl}/form?v=custom:${customFormRepresentation}`;
const formEncounterUrlPoc = `${restBaseUrl}/form?v=custom:${customFormRepresentation}&q=poc`;

export function useGetAllForms(cachedOfflineFormsOnly = false) {
  const session = useSession();
  const showHtmlFormEntryForms = true;
  const url = showHtmlFormEntryForms ? formEncounterUrl : formEncounterUrlPoc;
  const { data, error } = useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch(url);
    // show published forms, and hide component forms, and filter based on privileges
    const forms =
      res.data?.results?.filter(
        (form) =>
          // forms should be published
          form.published &&
          // forms should not be component forms
          !/component/i.test(form.name),
        // user should have privileges to edit forms
      ) ?? [];

    return forms;
  });

  return {
    forms: data?.filter((form) => Boolean(userHasAccess(form.encounterType?.editPrivilege?.display, session?.user))),
    isLoading: !error && !data,
    error,
  };
}

export default useGetAllForms;
