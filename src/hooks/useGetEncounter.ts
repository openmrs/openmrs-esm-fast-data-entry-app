import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import useSWR from "swr";

const encounterUrl = `${restBaseUrl}/encounter/`;

const useGetEncounter = (encounterUuid) => {
  const url = `${encounterUrl}${encounterUuid}`;
  const { data, error } = useSWR(url, async () => {
    const res = await openmrsFetch(url);
    const encounter = res.data || null;
    return encounter;
  });

  return {
    encounter: data,
    isLoading: !error && data,
    error,
  };
};

export default useGetEncounter;
