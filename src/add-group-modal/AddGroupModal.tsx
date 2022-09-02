import React, { useCallback, useState } from "react";
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

const NameField = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const updateName = useCallback((e) => {
    e.preventDefault();
    setName(e.target.value);
  }, []);

  return (
    <TextInput
      labelText={t("newGroupName", "New Group Name")}
      value={name}
      onChange={updateName}
    />
  );
};

const NewGroupForm = () => {
  const [patientList, setPatientList] = useState([]);
  const handleSelectPatient = useCallback(
    (patient) => {
      setPatientList([...patientList, patient]);
    },
    [patientList, setPatientList]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem",
      }}
    >
      <NameField />
      <FormLabel>Patients in group</FormLabel>
      <ul>
        {patientList?.map((patient, index) => (
          <li key={index}>{patient?.display}</li>
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
  );
};

const AddGroupModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.modal}>
      <Button
        onClick={() => setOpen(true)}
        renderIcon={Add}
        iconDescription="Add"
      >
        {t("createNewGroup", "Create New Group")}
      </Button>
      <ComposedModal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>{t("createNewGroup", "Create New Group")}</ModalHeader>
        <ModalBody>
          <NewGroupForm />
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

export { NameField };
