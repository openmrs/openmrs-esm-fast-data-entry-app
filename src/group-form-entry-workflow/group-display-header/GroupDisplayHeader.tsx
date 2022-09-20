import React, { useContext } from "react";
import { Button } from "@carbon/react";
import { Events, Close } from "@carbon/react/icons";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import { navigate } from "@openmrs/esm-framework";

const GroupDisplayHeader = () => {
  const {
    activeGroupName,
    activeGroupUuid,
    patientUuids,
    activeSessionMeta,
    unsetGroup,
    destroySession,
  } = useContext(GroupFormWorkflowContext);
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
      <span style={{ flexGrow: 1 }} />
      <span>
        <Button kind="ghost" onClick={() => unsetGroup()}>
          {t("changeGroup", "Choose a different group")} <Close size={20} />
        </Button>
      </span>
      <span>
        <Button
          kind="ghost"
          onClick={() => {
            destroySession();
            // eslint-disable-next-line
            navigate({ to: "${openmrsSpaBase}/forms" });
          }}
        >
          {t("cancel", "Cancel")} <Close size={20} />
        </Button>
      </span>
    </div>
  );
};

export default GroupDisplayHeader;
