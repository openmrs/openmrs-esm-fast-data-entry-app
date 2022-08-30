import React, { useState } from "react";
import { ComposedModal, Button } from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";

const AddGroupModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("createNewGroup", "Create new group")} <Add size={20} />
      </Button>
      <ComposedModal open={open} onClose={() => setOpen(false)}>
        whatup
      </ComposedModal>
      ;
    </>
  );
};

export default AddGroupModal;
