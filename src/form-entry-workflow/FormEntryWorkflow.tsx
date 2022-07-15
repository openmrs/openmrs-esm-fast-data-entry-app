import { Add20, Close20 } from "@carbon/icons-react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormBootstrap from "../FormBootstrap";
import PatientCard from "../patient-card/PatientCard";
import PatientBanner from "../patient-banner";
import styles from "./styles.scss";
import PatientSearchHeader from "../patient-search-header";

interface ParamTypes {
  formUuid: string;
}

const FormEntryWorkflow = () => {
  const { formUuid } = useParams() as ParamTypes;
  const [patientUuids, setPatientUuids] = useState([]);
  const [activePatientUuid, setActivePatientUuid] = useState(null);
  const [encounterUuids, setEncounterUuids] = useState([]);

  const saveEncounter = (uuid) => {
    setEncounterUuids((encounterUuids) => [...encounterUuids, uuid]);
  };

  const handlePostResponse = (encounter) => {
    if (
      encounter &&
      encounter.uuid &&
      !encounterUuids.includes(encounter.uuid)
    ) {
      saveEncounter(encounter.uuid);
    }
  };

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
      {activePatientUuid && <PatientBanner patientUuid={activePatientUuid} />}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "1100px" }}>
          {!patientUuids.length && (
            <div style={{ margin: "2rem", textAlign: "center" }}>
              Please select a patient first
            </div>
          )}
          {!!patientUuids.length && (
            <div className={styles.formMainContent}>
              <div className={styles.formContainer}>
                <FormBootstrap
                  patientUuid={activePatientUuid}
                  {...{
                    formUuid,
                    handlePostResponse,
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
                  <Link to="" style={{ textDecoration: "none" }}>
                    <Button
                      kind="tertiary"
                      style={{ width: "100%", textDecoration: "none" }}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormEntryWorkflow;
