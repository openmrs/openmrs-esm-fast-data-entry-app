import { fetchCurrentPatient, openmrsFetch } from "@openmrs/esm-framework";
import { useEffect, useState } from "react";
import useSWR from "swr";

const encounterUrl = "/ws/rest/v1/encounter/";

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
