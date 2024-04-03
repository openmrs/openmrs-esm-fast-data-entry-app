import { Close, Add } from "@carbon/react/icons";
import { Button } from "@carbon/react";
import React, { useCallback, useContext, useState } from "react";
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
  const [isOpen, setOpen] = useState(false);
  const handleSelectGroup = (group) => {
    group.cohortMembers.sort((a, b) => {
        let aName = a?.patient?.person?.names?.[0]?.display;
        let bName = b?.patient?.person?.names?.[0]?.display;
        return aName.localeCompare(bName, undefined, {sensitivity: "base"});
      }
    );
    setGroup(group);
  };

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onPostSubmit = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenClick = useCallback(() => {
    setOpen(true);
  }, []);

  if (activeGroupUuid) return null;

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>{t("findGroup", "Find group")}:</span>
      <span className={styles.searchBarWrapper}>
        <CompactGroupSearch selectGroupAction={handleSelectGroup} />
      </span>
      <span className={styles.padded}>{t("or", "or")}</span>
      <span>
        <Button
          onClick={handleOpenClick}
          renderIcon={Add}
          iconDescription="Add"
        >
          {t("createNewGroup", "Create New Group")}
        </Button>
        <AddGroupModal
          {...{
            isCreate: true,
            isOpen: isOpen,
            onPostCancel: handleCancel,
            onPostSubmit: onPostSubmit,
          }}
        />
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
