import { fetchCurrentPatient } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

const useGetPatient = (patientUuid) => {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPatient(null);

    if (patientUuid) {
      fetchCurrentPatient(patientUuid).then((result) => {
        if (!cancelled) {
          setPatient(result);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [patientUuid]);

  const getPatient = async (uuid) => {
    const result = await fetchCurrentPatient(uuid);
    setPatient(result);
  };

  return patient;
};

export default useGetPatient;
