import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification, showToast, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

const useStartVisit = ({ showSuccessNotification = true, showErrorNotification = true }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const onSave = useCallback(
    (result) => {
      setIsSubmitting(false);
      setError(false);
      setSuccess(result);
      if (showSuccessNotification) {
        showToast({
          critical: true,
          kind: 'success',
          description: t('visitStartedSuccessfully', `${result?.data?.visitType?.display} started successfully`),
          title: t('visitStarted', 'Visit started'),
        });
      }
    },
    [t, showSuccessNotification],
  );

  const onError = useCallback(
    (error) => {
      setIsSubmitting(false);
      setSuccess(false);
      setError(error);
      if (showErrorNotification) {
        showNotification({
          title: t('startVisitError', 'Error starting visit'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      }
    },
    [t, showErrorNotification],
  );

  const saveVisit = useCallback(
    (data) => {
      const payload = {
        patient: data.patientUuid,
        startDatetime: data.startDatetime,
        stopDatetime: data.stopDatetime,
        visitType: data.visitType,
        location: data.location,
      };
      openmrsFetch(`${restBaseUrl}/visit`, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
        .then(onSave)
        .catch(onError);
    },
    [onError, onSave],
  );

  const updateEncounter = useCallback((data) => {
    openmrsFetch(`${restBaseUrl}/encounter/` + data.uuid, {
      method: 'POST',
      body: { visit: data.visit },
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  return {
    saveVisit,
    updateEncounter,
    success,
    error,
    isSubmitting,
  };
};

export default useStartVisit;
