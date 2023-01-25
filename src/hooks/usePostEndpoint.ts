import { openmrsFetch } from "@openmrs/esm-framework";
import { useCallback, useState } from "react";

const usePostEndpoint = ({ endpointUrl }) => {
  const [submissionInProgress, setSubmissionInProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFormPosted = useCallback(
    (result) => {
      setSubmissionInProgress(false);
      if (error) {
        setError(null);
      }
      setResult(result.data);
    },
    [error]
  );

  const onError = useCallback(
    (error) => {
      setSubmissionInProgress(false);
      if (result) {
        setResult(null);
      }
      setError(error?.responseBody?.error ?? error?.responseBody ?? error);
    },
    [result]
  );

  const post = useCallback(
    async (data) => {
      setSubmissionInProgress(true);

      let path = endpointUrl;
      if (data.uuid) {
        path += "/" + data.uuid;
      }

      return openmrsFetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      })
        .then(onFormPosted)
        .catch(onError);
    },
    [endpointUrl, onError, onFormPosted]
  );

  const reset = () => {
    setSubmissionInProgress(null);
    setResult(null);
    setError(null);
  };

  return {
    post,
    isPosting: submissionInProgress,
    result,
    error,
    reset,
  };
};

const usePostVisit = () => {
  return usePostEndpoint({ endpointUrl: "/ws/rest/v1/visit" });
};

const usePostCohort = () => {
  return usePostEndpoint({ endpointUrl: "/ws/rest/v1/cohortm/cohort" });
};

export { usePostEndpoint, usePostVisit, usePostCohort };
