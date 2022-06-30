import { SkeletonText } from "carbon-components-react";
import React from "react";
import useGetPatient from "./useGetPatient";

const CardContainer = ({ children }) => {
  return <div style={{ padding: "1rem" }}>{children}</div>;
};

const PatientCard = ({ patientUuid }) => {
  const patient = useGetPatient(patientUuid);
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;

  if (!patient) {
    return (
      <CardContainer>
        <SkeletonText style={{ maxWidth: "8rem" }} />
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <div
        style={{ fontWeight: 300, fontSize: "0.8rem", lineHeight: "0.9rem" }}
      >
        {identifier}
      </div>
      <div style={{ fontWeight: "bold" }}>
        {givenName} {familyName}
      </div>
    </CardContainer>
  );
};

export default PatientCard;
