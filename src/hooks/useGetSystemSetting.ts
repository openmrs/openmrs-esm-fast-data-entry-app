import { useCallback, useEffect, useState } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

const useGetSystemSetting = (settingId) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onResult = useCallback((result) => {
    setIsSubmitting(false);
    setError(false);
    setResult(result);
  }, []);

  const onError = useCallback((error) => {
    setIsSubmitting(false);
    setResult(null);
    setError(error);
  }, []);

  const getSetting = useCallback(() => {
    openmrsFetch(`${restBaseUrl}/systemsetting?q=${settingId}&v=default`).then(onResult).catch(onError);
  }, [onError, onResult, settingId]);

  useEffect(() => {
    getSetting();
  }, [getSetting]);

  return {
    result,
    error,
    isSubmitting,
  };
};

export default useGetSystemSetting;
