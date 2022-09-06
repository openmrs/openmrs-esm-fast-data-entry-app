import { openmrsFetch } from "@openmrs/esm-framework";

const usePostCohort = () => {
  const cohortURL = `/ws/rest/v1/cohortm/cohort`;
  const fetcher = openmrsFetch(cohortURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      name: "Magenta",
      cohortType: "hello",
    },
  });
  return fetcher;
};

export default usePostCohort;
