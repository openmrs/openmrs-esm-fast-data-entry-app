import { openmrsFetch } from "@openmrs/esm-framework";
import useSWR from "swr";

const systemSettingsUrl = "/ws/rest/v1/systemsetting";

const useGetSystemSettings = (settingId) => {
  const url = `${systemSettingsUrl}?q=${settingId}&v=custom:(value)`;
  const { data, error } = useSWR(url, async () => {
    const res = await openmrsFetch(url);
    const encounter = res.data || null;
    return encounter;
  });

  return {
    results: data?.results,
    isLoading: !error && data,
    error,
  };
};

export default useGetSystemSettings;
