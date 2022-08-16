import { Add, Close } from "@carbon/react/icons";
import {
  ExtensionSlot,
  interpolateUrl,
  navigate,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";

const GroupSearchHeader = () => {
  const { t } = useTranslation();
  const { addPatient, workflowState, activeFormUuid } = useContext(
    GroupFormWorkflowContext
  );
  const handleSelectPatient = (uuid) => {
    addPatient(uuid);
  };

  if (workflowState !== "NEW_PATIENT") return null;

  const afterUrl = encodeURIComponent(
    `\${openmrsSpaBase}/forms/groupform/${activeFormUuid}?patientUuid=\${patientUuid}`
  );
  const patientRegistrationUrl = interpolateUrl(
    `\${openmrsSpaBase}/cohort-builder?afterUrl=${afterUrl}`
  );

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>{t("findGroup", "Find group")}:</span>
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
      <span className={styles.padded}>{t("or", "or")}</span>
      <span>
        <Button onClick={() => navigate({ to: patientRegistrationUrl })}>
          {t("createNewGroup", "Create new group")} <Add size={20} />
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

export default GroupSearchHeader;
