import { Button } from "carbon-components-react";
import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import FormWorkflowContext from "../context/FormWorkflowContext";
import FormReviewCard from "../form-review-card";
import styles from "./styles.scss";

const WorkflowReview = () => {
  const { patientUuids } = useContext(FormWorkflowContext);
  const history = useHistory();
  return (
    <div className={styles.workspaceWrapper}>
      <div className={styles.workspace}>
        <div className={styles.leftPanel}>
          <h4>Review</h4>
          <div className={styles.navButtons}>
            <Button kind="primary" onClick={() => history.push("/")}>
              Save & Close
            </Button>
            <Button kind="tertiary" onClick={() => history.push("/")}>
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
