import {
  age,
  ExtensionSlot,
  formatDate,
  parseDate,
} from "@openmrs/esm-framework";
import {
  Button,
  SkeletonPlaceholder,
  SkeletonText,
} from "carbon-components-react";
import React, { useContext, useState } from "react";
import styles from "./styles.scss";
import ChevronDown16 from "@carbon/icons-react/es/chevron--down/16";
import ChevronUp16 from "@carbon/icons-react/es/chevron--up/16";
import { useTranslation } from "react-i18next";
import useGetPatient from "../hooks/useGetPatient";
import FormWorkflowContext from "../context/FormWorkflowContext";

const SkeletonPatientInfo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.patientInfoContainer}>
        <SkeletonPlaceholder />
        <div className={styles.patientInfoContent}>
          <div className={styles.patientInfoRow}>
            <span className={styles.patientName}>
              <SkeletonText />
            </span>
          </div>
          <div className={styles.patientInfoRow}>
            <div className={styles.demographics}>
              <span>
                <SkeletonText />
              </span>
              <span>
                <SkeletonText />
              </span>
              <span>
                <SkeletonText />
              </span>
            </div>
          </div>
          <div className={styles.patientInfoRow}>
            <span className={styles.identifier}>
              <SkeletonText />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientBanner = () => {
  const { activePatientUuid } = useContext(FormWorkflowContext);
  const patient = useGetPatient(activePatientUuid);
  const { t } = useTranslation();
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);
  const patientName = `${patient?.name?.[0].given?.join(" ")} ${
    patient?.name?.[0]?.family
  }`;

  const patientPhotoSlotState = React.useMemo(
    () => ({ patientUuid: patient?.id, patientName }),
    [patient?.id, patientName]
  );

  const toggleShowMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContactDetails((prevState) => !prevState);
  };

  if (!activePatientUuid) return null;

  if (!patient) {
    return <SkeletonPatientInfo />;
  }

  return (
    <div className={styles.container}>
      <div
        className={`${
          showContactDetails
            ? styles.activePatientInfoContainer
            : styles.patientInfoContainer
        }`}
      >
        <ExtensionSlot
          extensionSlotName="patient-photo-slot"
          state={patientPhotoSlotState}
        />
        <div className={styles.patientInfoContent}>
          <div className={styles.patientInfoRow}>
            <span className={styles.patientName}>{patientName}</span>
          </div>
          <div className={styles.patientInfoRow}>
            <div className={styles.demographics}>
              <span>
                {(patient.gender ?? t("unknown", "Unknown")).replace(
                  /^\w/,
                  (c) => c.toUpperCase()
                )}{" "}
                &middot;{" "}
              </span>
              <span>{age(patient.birthDate)} &middot; </span>
              <span>
                {formatDate(parseDate(patient.birthDate), {
                  mode: "wide",
                  time: false,
                })}
              </span>
            </div>
          </div>
          <div className={styles.patientInfoRow}>
            <span className={styles.identifier}>
              {patient.identifier.length
                ? patient.identifier
                    .map((identifier) => identifier.value)
                    .join(", ")
                : "--"}
            </span>
            <Button
              kind="ghost"
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
              iconDescription="Toggle contact details"
              onClick={(e) => toggleShowMore(e)}
              disabled
            >
              {showContactDetails
                ? t("showLess", "Show less")
                : t("showAllDetails", "Show all details")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBanner;
