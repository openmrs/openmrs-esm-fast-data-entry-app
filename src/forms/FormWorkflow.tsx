import { Add20, Close20 } from "@carbon/icons-react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import FormEntry from "../FormEntry";
import PatientCard from "./PatientCard";

interface ParamTypes {
  formUuid: string;
}

const FormWorkflow = () => {
  const { formUuid } = useParams() as ParamTypes;
  const [patientUuid, setPatientUuid] = useState(null);

  return (
    <div>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          padding: "2rem 1rem",
        }}
      >
        <span style={{ padding: "1rem" }}>Patient search</span>
        <span style={{ minWidth: "35rem" }}>
          <ExtensionSlot
            extensionSlotName="patient-search-bar-slot"
            state={{
              selectPatientAction: (uuid) => setPatientUuid(uuid),
              buttonProps: {
                kind: "primary",
              },
            }}
          />
        </span>
        <span style={{ padding: "1rem" }}>or</span>
        <span>
          <Button>
            Create new patient <Add20 />
          </Button>
        </span>
        <span style={{ flexGrow: 1 }} />
        <span>
          <Button kind="ghost">
            Cancel <Close20 />
          </Button>
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "1100px" }}>
          {!patientUuid && (
            <div style={{ margin: "2rem", textAlign: "center" }}>
              Please select a patient first
            </div>
          )}
          {patientUuid && (
            <div
              style={{
                display: "flex",
                textAlign: "center",
                border: "1px solid lightgray",
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <FormEntry
                  {...{
                    formUuid,
                    patientUuid,
                  }}
                />
              </div>
              <div style={{ width: "18rem" }}>
                <h4>Forms filled.</h4>
                <PatientCard patientUuid={patientUuid} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormWorkflow;
