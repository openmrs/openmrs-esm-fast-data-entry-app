import React, { useContext } from "react";
import { Events } from "@carbon/react/icons";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";

const GroupBanner = () => {
  const { activeGroupName, activeGroupUuid, patientUuids, activeSessionMeta } =
    useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();

  if (!activeGroupUuid) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.groupAvatar} role="img">
        <Events size={48} />
      </div>
      <div className={styles.groupInfoContent}>
        <div className={styles.groupInfoRow}>
          <span className={styles.groupName}>{activeGroupName}</span>
        </div>
        <div className={styles.groupInfoRow}>
          <span>
            {patientUuids.length} {t("members", "members")}
          </span>
        </div>
      </div>
      {activeSessionMeta?.sessionNotes && (
        <div className={styles.groupMeataContent}>
          <div className={`${styles.groupInfoRow} ${styles.sessionNotesLabel}`}>
            {t("sessionNotes", "Session Notes")}
          </div>
          <div className={styles.groupInfoRow}>
            {activeSessionMeta.sessionNotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBanner;
