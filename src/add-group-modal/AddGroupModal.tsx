import React, { useState } from "react";
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  FormLabel,
} from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { ExtensionSlot } from "@openmrs/esm-framework";
import styles from "./styles.scss";

const AddGroupModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [patientList, setPatientList] = useState([]);

  const handleSelectPatient = (id) => {
    setPatientList([...patientList, id]);
  };

  return (
    <div className={styles.modal}>
      <Button onClick={() => setOpen(true)}>
        {t("createNewGroup", "Create new group")} <Add size={20} />
      </Button>
      <ComposedModal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>{t("createNewGroup", "Create New Group")}</ModalHeader>
        <ModalBody>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "1rem",
            }}
          >
            <TextInput
              labelText={t("newGroupName", "New Group Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormLabel>Patients in group</FormLabel>
            <ul>
              {patientList?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <FormLabel>Search for patients to add to group</FormLabel>
            <ExtensionSlot
              extensionSlotName="patient-search-bar-slot"
              state={{
                selectPatientAction: handleSelectPatient,
                buttonProps: {
                  kind: "primary",
                },
              }}
            />
          </div>
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
    </div>
  );
};

export default AddGroupModal;
