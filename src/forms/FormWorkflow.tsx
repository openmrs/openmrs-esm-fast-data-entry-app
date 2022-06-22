import { useVisit } from "@openmrs/esm-framework";
import React from "react";
import { useParams } from "react-router-dom";
import FormEntry from "../FormEntry";

interface ParamTypes {
  formUuid: string;
}

const FormWorkflow = () => {
  const { formUuid } = useParams() as ParamTypes;
  const patientUuid = "f4d2d9e4-b6a4-426e-b6be-92a9b61faf8a";
  const visit = useVisit(patientUuid);
  console.log("visit", visit);
  const visitId = "94bd199d-a275-4b29-8aa9-1525acdf26c7";
  const visitTypeUuid = "159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const encounterUuid = "159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  return (
    <div>
      <div>
        <h3
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid lightgray",
            textAlign: "center",
          }}
        >
          Patient header
        </h3>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(200px, 1fr) minmax(10rem, 1fr) minmax(200px, 1fr)",
          textAlign: "center",
          border: "1px solid lightgray",
        }}
      >
        <div>Fill Admission Form</div>
        <div>
          <h3>Form {formUuid}</h3>
          <FormEntry
            {...{
              formUuid,
              patientUuid,
              visitId,
              visitTypeUuid,
              encounterUuid,
            }}
          />
        </div>
        <div>Forms filled.</div>
      </div>
    </div>
  );
};

export default FormWorkflow;
