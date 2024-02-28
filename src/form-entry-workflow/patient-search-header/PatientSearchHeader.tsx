import { Add, Close } from "@carbon/react/icons";
import {
  ExtensionSlot,
  interpolateUrl,
  navigate,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import FormWorkflowContext from "../../context/FormWorkflowContext";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";

const PatientSearchHeader = () => {
  const { addPatient, workflowState, activeFormUuid } =
    useContext(FormWorkflowContext);
  const handleSelectPatient = (patient) => {
    addPatient(patient);
  };
  const { t } = useTranslation();

  if (workflowState !== "NEW_PATIENT") return null;

  const afterUrl = encodeURIComponent(
    `\${openmrsSpaBase}/forms/form/${activeFormUuid}?patientUuid=\${patientUuid}`
  );
  const patientRegistrationUrl = interpolateUrl(
    `\${openmrsSpaBase}/patient-registration?afterUrl=${afterUrl}`
  );

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>{t("nextPatient", "Next patient")}:</span>
      <span className={styles.searchBarWrapper}>
        <ExtensionSlot
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: handleSelectPatient,
            buttonProps: {
              kind: "primary",
            },
          }}
        />
      </span>
      <span className={styles.padded}>{t("or", "or")}</span>
      <span>
        <Button onClick={() => navigate({ to: patientRegistrationUrl })}>
          {t("createNewPatient", "Create new patient")} <Add size={20} />
        </Button>
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Link to="../">
          <Button kind="ghost">
            {t("cancel", "Cancel")} <Close size={20} />
          </Button>
        </Link>
      </span>
    </div>
  );
};

export default PatientSearchHeader;
