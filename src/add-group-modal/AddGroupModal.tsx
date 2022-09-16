import React, { useCallback, useContext, useState } from "react";
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  FormLabel,
} from "@carbon/react";
import { Add, Close } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { ExtensionSlot } from "@openmrs/esm-framework";
import styles from "./styles.scss";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import usePostCohort from "../hooks/usePostCohort";

const MemExtension = React.memo(ExtensionSlot);

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  return (
    <li key={patient.uuid} className={styles.patientRow}>
      <span className={styles.patientName}>{patient?.display}</span>
      <span>
        <Button
          kind="tertiary"
          size="sm"
          onClick={() => removePatient(patient.uuid)}
          renderIcon={Close}
          tooltipPosition="right"
        >
          {t("remove", "Remove")}
        </Button>
      </span>
    </li>
  );
};

const NewGroupForm = (props) => {
  const {
    name,
    setName,
    patientList,
    updatePatientList,
    errors,
    validate,
    removePatient,
  } = props;
  const { t } = useTranslation();

  return (
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
        onBlur={() => validate("name")}
      />
      {errors?.name && (
        <p className={styles.formError}>
          {t("groupNameError", "Please enter a group name.")}
        </p>
      )}
      <FormLabel>Patients in group</FormLabel>
      {errors?.patientList && (
        <p className={styles.formError}>
          {t("noPatientError", "Please enter at least one patient.")}
        </p>
      )}
      {!errors?.patientList && (
        <ul>
          {patientList?.map((patient, index) => (
            <PatientRow
              patient={patient}
              removePatient={removePatient}
              key={index}
            />
          ))}
        </ul>
      )}

      <FormLabel>Search for patients to add to group</FormLabel>
      <div className={styles.searchBar}>
        <MemExtension
          extensionSlotName="patient-search-bar-slot"
          state={{
            selectPatientAction: updatePatientList,
            buttonProps: {
              kind: "primary",
            },
          }}
        />
      </div>
    </div>
  );
};

const AddGroupModal = () => {
  const { setGroup } = useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState("");
  const [patientList, setPatientList] = useState([]);
  const { post, result, error } = usePostCohort();

  const handleCancel = () => {
    setOpen(false);
  };

  const removePatient = useCallback(
    (patientUuid: string) =>
      setPatientList((patientList) =>
        patientList.filter((patient) => patient.uuid !== patientUuid)
      ),
    [setPatientList]
  );

  const validate = useCallback(
    (field?: string | undefined) => {
      let valid = true;
      if (field) {
        valid = field === "name" ? !!name : !!patientList.length;
        setErrors((errors) => ({
          ...errors,
          [field]: valid ? null : "required",
        }));
      } else {
        if (!name) {
          setErrors((errors) => ({ ...errors, name: "required" }));
          valid = false;
        } else {
          setErrors((errors) => ({ ...errors, name: null }));
        }
        if (!patientList.length) {
          setErrors((errors) => ({ ...errors, patientList: "required" }));
          valid = false;
        } else {
          setErrors((errors) => ({ ...errors, patientList: null }));
        }
      }
      return valid;
    },
    [name, patientList.length]
  );

  const updatePatientList = useCallback(
    (patient) => {
      setPatientList((patientList) => {
        if (!patientList.find((p) => p.uuid === patient.uuid)) {
          return [...patientList, patient];
        } else {
          return patientList;
        }
      });
      setErrors((errors) => ({ ...errors, patientList: null }));
    },
    [setPatientList]
  );

  const handleSubmit = () => {
    if (validate()) {
      post({
        name: name,
        cohortMembers: patientList.map((p) => ({ patient: p.uuid })),
      });
    }
  };

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
          <NewGroupForm
            {...{
              name,
              setName,
              patientList,
              updatePatientList,
              errors,
              validate,
              removePatient,
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={handleCancel}>
            {t("cancel", "Cancel")}
          </Button>
          <Button kind="primary" onClick={handleSubmit}>
            {t("createGroup", "Create Group")}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </div>
  );
};

export default AddGroupModal;
