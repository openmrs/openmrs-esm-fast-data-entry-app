import React from "react";
import Loader from "../Loader";
import useGetPatient from "./useGetPatient";

const CardContainer = ({ children }) => {
  return (
    <div style={{ margin: "0.25rem" }}>
      <div style={{ backgroundColor: "white", padding: "1rem" }}>
        {children}
      </div>
    </div>
  );
};

const PatientCard = ({ patientUuid }) => {
  const patient = useGetPatient(patientUuid);
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;

  if (!patient) {
    return (
      <CardContainer>
        <Loader />
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      {givenName} {familyName}
    </CardContainer>
  );
};

export default PatientCard;
