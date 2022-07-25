import { Add20, Close20 } from "@carbon/icons-react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Button } from "carbon-components-react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import FormWorkflowContext from "../context/FormWorkflowContext";
import styles from "./styles.scss";

const PatientSearchHeader = () => {
  const { activePatientUuid, addPatient } = useContext(FormWorkflowContext);
  const handleSelectPatient = (uuid) => {
    addPatient(uuid);
  };

  if (activePatientUuid) return null;

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
        <Button disabled>
          Create new patient <Add20 />
        </Button>
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Link to="">
          <Button kind="ghost">
            Cancel <Close20 />
          </Button>
        </Link>
      </span>
    </div>
  );
};

export default PatientSearchHeader;
