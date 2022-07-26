import React, { useContext } from "react";
import FormWorkflowContext from "../context/FormWorkflowContext";
import PatientCard from "../patient-card";
import styles from "./styles.scss";

const WorkflowReview = () => {
  const { patientUuids } = useContext(FormWorkflowContext);
  return (
    <div className={styles.workspaceWrapper}>
      <div className={styles.workspace}>
        <h4>Review</h4>
        {patientUuids.map((patientUuid) => (
          <PatientCard patientUuid={patientUuid} key={patientUuid} />
        ))}
      </div>
    </div>
  );
};

export default WorkflowReview;
