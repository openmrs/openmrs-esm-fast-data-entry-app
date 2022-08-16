import { Button } from "@carbon/react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import FormWorkflowContext from "../../context/FormWorkflowContext";
import FormReviewCard from "../form-review-card";
import styles from "./styles.scss";

const WorkflowReview = () => {
  const { patientUuids } = useContext(FormWorkflowContext);
  const navigate = useNavigate();
  return (
    <div className={styles.workspaceWrapper}>
      <div className={styles.workspace}>
        <div className={styles.leftPanel}>
          <h4>Review</h4>
          <div className={styles.navButtons}>
            <Button kind="primary" onClick={() => navigate("/")}>
              Save & Close
            </Button>
            <Button kind="tertiary" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </div>
        </div>
        <div className={styles.formContainer}>
          {patientUuids.map((patientUuid) => (
            <FormReviewCard patientUuid={patientUuid} key={patientUuid} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowReview;
