import React, { useContext } from "react";
import { Events } from "@carbon/react/icons";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";

const GroupBanner = () => {
  const { activeGroupName, activeGroupUuid, patientUuids } = useContext(
    GroupFormWorkflowContext
  );
  const { t } = useTranslation();

  if (!activeGroupUuid) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.groupAvatar} role="img">
        <Events size={24} />
      </div>
      <div className={styles.patientInfoContent}>
        <div className={styles.patientInfoRow}>
          <span className={styles.patientName}>{activeGroupName}</span>
        </div>
        <div className={styles.patientInfoRow}>
          <span>
            {patientUuids.length} {t("members", "members")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupBanner;
