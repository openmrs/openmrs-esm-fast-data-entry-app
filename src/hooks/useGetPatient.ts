import { fetchCurrentPatient } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

const useGetPatient = (patientUuid) => {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (!patientUuid) {
      setPatient(null);
    } else {
      getPatient(patientUuid);
    }
  }, [patientUuid]);

  const getPatient = async (uuid) => {
    const result = await fetchCurrentPatient(uuid);
    setPatient(result);
  };

  return patient;
};

export default useGetPatient;
