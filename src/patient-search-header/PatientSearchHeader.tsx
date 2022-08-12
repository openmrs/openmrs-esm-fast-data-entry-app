import { Add, Close } from "@carbon/react/icons";
import {
  ExtensionSlot,
  interpolateUrl,
  navigate,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import FormWorkflowContext from "../context/FormWorkflowContext";
import styles from "./styles.scss";

const PatientSearchHeader = () => {
  const { addPatient, workflowState, activeFormUuid } =
    useContext(FormWorkflowContext);
  const handleSelectPatient = (uuid) => {
    addPatient(uuid);
  };

  if (workflowState !== "NEW_PATIENT") return null;

  const afterUrl = encodeURIComponent(
    `\${openmrsSpaBase}/forms/${activeFormUuid}?patientUuid=\${patientUuid}`
  );
  const patientRegistrationUrl = interpolateUrl(
    `\${openmrsSpaBase}/patient-registration?afterUrl=${afterUrl}`
  );

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>Next patient:</span>
      <span className={styles.searchBarWrapper}>
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
      <span className={styles.padded}>or</span>
      <span>
        <Button onClick={() => navigate({ to: patientRegistrationUrl })}>
          Create new patient <Add size={20} />
        </Button>
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Link to="">
          <Button kind="ghost">
            Cancel <Close size={20} />
          </Button>
        </Link>
      </span>
    </div>
  );
};

export default PatientSearchHeader;
