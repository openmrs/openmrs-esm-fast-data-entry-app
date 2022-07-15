import { openmrsFetch } from "@openmrs/esm-framework";
import useSWR from "swr";

const customFormRepresentation =
  "(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))";

const formEncounterUrl = `/ws/rest/v1/form?v=custom:${customFormRepresentation}`;
const formEncounterUrlPoc = `/ws/rest/v1/form?v=custom:${customFormRepresentation}&q=poc`;

export function useGetAllForms(cachedOfflineFormsOnly = false) {
  const showHtmlFormEntryForms = true;
  const url = showHtmlFormEntryForms ? formEncounterUrl : formEncounterUrlPoc;
  const { data, error } = useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch(url);
    // show published forms and hide component forms
    const forms =
      res.data?.results?.filter(
        (form) => form.published && !/component/i.test(form.name)
      ) ?? [];

    return forms;
  });

  return {
    forms: data,
    isLoading: !error && !data,
    error,
  };
}

export default useGetAllForms;
