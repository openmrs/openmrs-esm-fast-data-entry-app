import { openmrsFetch } from "@openmrs/esm-framework";
import { useState } from "react";

const usePostEndpoint = ({ endpointUrl }) => {
  const [submissionInProgress, setSubmissionInProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFormPosted = (result) => {
    setSubmissionInProgress(false);
    if (error) {
      setError(null);
    }
    setResult(result.data);
  };

  const onError = (error) => {
    setSubmissionInProgress(false);
    if (result) {
      setResult(null);
    }
    setError(error.response?.data);
  };

  const post = async (data) => {
    setSubmissionInProgress(true);
    return openmrsFetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then(onFormPosted)
      .catch(onError);
  };

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
