import { Close } from "@carbon/react/icons";
import { Button } from "@carbon/react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import CompactGroupSearch from "../group-search/CompactGroupSearch";
import AddGroupModal from "../../add-group-modal/AddGroupModal";

const GroupSearchHeader = () => {
  const { t } = useTranslation();
  const { workflowState } = useContext(GroupFormWorkflowContext);
  const handleSelectGroup = (uuids) => {
    return undefined;
  };

  if (workflowState !== "NEW_PATIENT") return null;

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
