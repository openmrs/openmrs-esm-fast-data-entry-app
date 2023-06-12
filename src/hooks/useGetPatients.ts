import { fetchCurrentPatient } from "@openmrs/esm-framework";
import { useEffect, useState } from "react";

const useGetPatients = (patientUuids) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientUuids || patientUuids.length === 0) {
      setPatients([]);
      setIsLoading(false);
    } else {
      getPatients(patientUuids);
    }
  }, [patientUuids]);

  const getPatients = async (uuids) => {
    try {
      setIsLoading(true);
      const results = await Promise.all(
        uuids.map(async (uuid) => await fetchCurrentPatient(uuid))
      );
      setPatients(results);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setIsLoading(false);
    }
  };

  return { patients, isLoading };
};

export default useGetPatients;
