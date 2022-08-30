import React, { useState } from "react";
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
} from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";

const AddGroupModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("createNewGroup", "Create new group")} <Add size={20} />
      </Button>
      <ComposedModal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>{t("createNewGroup", "Create New Group")}</ModalHeader>
        <ModalBody>
          <TextInput
            labelText={t("newGroupName", "New Group Name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setOpen(false)}>
            {t("cancel", "Cancel")}
          </Button>
          <Button kind="primary" onClick={() => setOpen(false)}>
            {t("createGroup", "Create Group")}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </>
  );
};

export default AddGroupModal;
