import { Add20, Close20 } from "@carbon/icons-react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import FormBootstrap from "../FormBootstrap";
import PatientCard from "../patient-card/PatientCard";
import PatientBanner from "../patient-banner";
import styles from "./styles.scss";
import PatientSearchHeader from "../patient-search-header";
import { useTranslation } from "react-i18next";

interface ParamTypes {
  formUuid: string;
}

const FormEntryWorkflow = () => {
  const { formUuid } = useParams() as ParamTypes;
  const history = useHistory();
  const [patientUuids, setPatientUuids] = useState([]);
  const [activePatientUuid, setActivePatientUuid] = useState(null);
  const [encounterUuids, setEncounterUuids] = useState([]);
  const { t } = useTranslation();

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
      <div className={styles.workspaceWrapper}>
        <div className={styles.workspace}>
          {!patientUuids.length && (
            <div className={styles.selectPatientMessage}>
              {t("selectPatientFirst", "Please select a patient first")}
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
              <div className={styles.rightPanel}>
                <h4>Forms filled</h4>
                <div className={styles.patientCardsSection}>
                  {patientUuids.map((patientUuid) => (
                    <PatientCard patientUuid={patientUuid} key={patientUuid} />
                  ))}
                </div>
                <div className={styles.rightPanelActionButtons}>
                  <Button
                    kind="primary"
                    onClick={() => setActivePatientUuid(null)}
                  >
                    {t("nextPatient", "Next Patient")}
                  </Button>
                  <Button kind="secondary" disabled>
                    {t("reviewSave", "Review & Save")}
                  </Button>
                  <Button kind="tertiary" onClick={() => history.push("/")}>
                    {t("cancel", "Cancel")}
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

export default FormEntryWorkflow;
