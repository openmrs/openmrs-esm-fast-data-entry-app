import { Accordion, AccordionItem, Button } from "@carbon/react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import FormWorkflowContext from "../context/FormWorkflowContext";
import { useGetPatient, useGetEncounter } from "../hooks";
import styles from "./styles.scss";

const FormReviewCard = ({ patientUuid }) => {
  const { encounters, editEncounter } = useContext(FormWorkflowContext);
  const patient = useGetPatient(patientUuid);
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;
  const encounterUuid = encounters?.[patientUuid];
  const { encounter } = useGetEncounter(encounterUuid);
  const { t } = useTranslation();

  return (
    <div className={styles.formReviewCard}>
      <Accordion align="start">
        <AccordionItem
          title={
            <>
              <span className={styles.identifier}>{identifier}</span>
              <span className={styles.displayName}>
                {givenName} {familyName}
              </span>
            </>
          }
          className={styles.accordionItem}
        >
          {encounter && encounter?.obs && encounter.obs?.length && (
            <div className={styles.dataField}>
              <ul>
                {encounter.obs.map((obs, index) => (
                  <li key={index}>{obs.display}</li>
                ))}
              </ul>
            </div>
          )}
          <Button kind="primary" onClick={() => editEncounter(patientUuid)}>
            {t("goToForm", "Go To Form")}
          </Button>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FormReviewCard;
