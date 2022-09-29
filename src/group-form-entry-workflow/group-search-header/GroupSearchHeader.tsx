import { Close } from "@carbon/react/icons";
import { Button } from "@carbon/react";
import React, { useContext } from "react";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import CompactGroupSearch from "../group-search/CompactGroupSearch";
import AddGroupModal from "../../add-group-modal/AddGroupModal";

const GroupSearchHeader = () => {
  const { t } = useTranslation();
  const { activeGroupUuid, setGroup, destroySession } = useContext(
    GroupFormWorkflowContext
  );
  const handleSelectGroup = (group) => {
    setGroup(group);
  };

  if (activeGroupUuid) return null;

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>{t("findGroup", "Find group")}:</span>
      <span className={styles.searchBarWrapper}>
        <CompactGroupSearch selectGroupAction={handleSelectGroup} />
      </span>
      <span className={styles.padded}>{t("or", "or")}</span>
      <span>
        <AddGroupModal />
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Button
          kind="ghost"
          onClick={() => {
            destroySession();
          }}
        >
          {t("cancel", "Cancel")} <Close size={20} />
        </Button>
      </span>
    </div>
  );
};

export default GroupSearchHeader;
