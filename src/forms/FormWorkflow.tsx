import { Add20, Close20 } from "@carbon/icons-react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormEntry from "../FormEntry";
import PatientCard from "./PatientCard";
import PatientInfo from "./PatientInfo";
import styles from "./styles.scss";

const PatientSearchHeader = ({
  patientUuids,
  setPatientUuids,
  setActivePatientUuid,
}) => {
  const handleSelectPatient = (uuid) => {
    setPatientUuids([...patientUuids, uuid]), setActivePatientUuid(uuid);
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "white",
        padding: "2rem 1rem",
      }}
    >
      <span style={{ padding: "1rem" }}>Next patient:</span>
      <span style={{ minWidth: "35rem" }}>
        <ExtensionSlot
          extensionSlotName="patient-search-bar-slot"
          state={{
            selectPatientAction: handleSelectPatient,
            buttonProps: {
              kind: "primary",
            },
          }}
        />
      </span>
      <span style={{ padding: "1rem" }}>or</span>
      <span>
        <Button disabled>
          Create new patient <Add20 />
        </Button>
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Button kind="ghost" href={`${window.spaBase}/forms`}>
          Cancel <Close20 />
        </Button>
      </span>
    </div>
  );
};

interface ParamTypes {
  formUuid: string;
}

const FormWorkflow = () => {
  const { formUuid } = useParams() as ParamTypes;
  const [patientUuids, setPatientUuids] = useState([]);
  const [activePatientUuid, setActivePatientUuid] = useState(null);

  return (
    <div>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      {!activePatientUuid && (
        <PatientSearchHeader
          {...{ patientUuids, setPatientUuids, setActivePatientUuid }}
        />
      )}
      {activePatientUuid && <PatientInfo patientUuid={activePatientUuid} />}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "1100px" }}>
          {!patientUuids.length && (
            <div style={{ margin: "2rem", textAlign: "center" }}>
              Please select a patient first
            </div>
          )}
          {!!patientUuids.length && (
            <div className={styles.formContainer}>
              <div style={{ flexGrow: 1 }}>
                <FormEntry
                  patientUuid={activePatientUuid}
                  {...{
                    formUuid,
                  }}
                />
              </div>
              <div style={{ width: "13rem", textAlign: "left" }}>
                <h4>Forms filled</h4>
                <div
                  style={{
                    margin: "1rem 0",
                    borderBottom: "1px solid #f4f4f4",
                  }}
                >
                  {patientUuids.map((patientUuid) => (
                    <PatientCard patientUuid={patientUuid} key={patientUuid} />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "0.5rem",
                  }}
                >
                  <Button
                    kind="primary"
                    onClick={() => setActivePatientUuid(null)}
                    style={{ width: "100%" }}
                  >
                    Next Patient
                  </Button>
                  <Button kind="secondary" disabled style={{ width: "100%" }}>
                    Review & Save
                  </Button>
                  <Button kind="tertiary" disabled style={{ width: "100%" }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormWorkflow;
