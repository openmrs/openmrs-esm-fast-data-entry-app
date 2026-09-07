import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback, useState } from 'react';

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
      return result.data;
    },
    [error],
  );

  const onError = useCallback(
    (error) => {
      setSubmissionInProgress(false);
      if (result) {
        setResult(null);
      }
      const submissionError = error?.responseBody?.error ?? error?.responseBody ?? error;
      setError(submissionError);
      return submissionError;
    },
    [result],
  );

  const post = useCallback(
    async (data, onFailure?: (error: Error) => void) => {
      setSubmissionInProgress(true);

      let path = endpointUrl;
      if (data.uuid) {
        path += '/' + data.uuid;
      }

      return openmrsFetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(onFormPosted)
        .catch((error) => {
          const submissionError = onError(error);
          onFailure?.(submissionError);
        });
    },
    [endpointUrl, onError, onFormPosted],
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
  return usePostEndpoint({ endpointUrl: `${restBaseUrl}/visit` });
};

const usePostCohort = () => {
  return usePostEndpoint({ endpointUrl: `${restBaseUrl}/cohortm/cohort` });
};

export { usePostEndpoint, usePostVisit, usePostCohort };
