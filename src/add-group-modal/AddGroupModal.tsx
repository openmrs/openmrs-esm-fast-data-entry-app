import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  FormLabel,
  Loading,
} from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { ExtensionSlot, showToast } from "@openmrs/esm-framework";
import styles from "./styles.scss";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import { usePostCohort } from "../hooks";

const MemExtension = React.memo(ExtensionSlot);

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  return (
    <li key={patient.uuid} className={styles.patientRow}>
      <span>
        <Button
          kind="tertiary"
          size="sm"
          hasIconOnly
          onClick={() => removePatient(patient.uuid)}
          renderIcon={TrashCan}
          tooltipAlignment="start"
          tooltipPosition="top"
          iconDescription={t("remove", "Remove")}
        />
      </span>
      <span className={styles.patientName}>{patient?.display}</span>
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
          {errors.name === "required"
            ? t("groupNameError", "Please enter a group name.")
            : errors.name}
        </p>
      )}
      <FormLabel>
        {patientList.length} {t("patientsInGroup", "Patients in group")}
      </FormLabel>
      {errors?.patientList && (
        <p className={styles.formError}>
          {t("noPatientError", "Please enter at least one patient.")}
        </p>
      )}
      {!errors?.patientList && (
        <ul className={styles.patientList}>
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
              kind: "secondary",
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
  const { post, result, isPosting, error } = usePostCohort();

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

  useEffect(() => {
    if (result) {
      setGroup({
        ...result,
        // the result doesn't come with cohortMembers.
        // need to add it in based on our local state
        cohortMembers: patientList.map((p) => ({ patient: { uuid: p.uuid } })),
      });
    }
  }, [result, setGroup, patientList]);

  useEffect(() => {
    if (error) {
      showToast({
        kind: "error",
        title: t("postError", "POST Error"),
        description:
          error.message ??
          t("unknownPostError", "An unknown error occured while saving data"),
      });
      if (error.fieldErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(error.fieldErrors).map(([key, value]) => [
              key,
              value?.[0]?.message,
            ])
          )
        );
      }
    }
  }, [error, t]);

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
          {result ? (
            <p>Group saved succesfully</p>
          ) : isPosting ? (
            <div className={styles.loading}>
              <Loading withOverlay={false} />
              <span>Saving new group...</span>
            </div>
          ) : (
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
          )}
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={handleCancel} disabled={isPosting}>
            {t("cancel", "Cancel")}
          </Button>
          <Button kind="primary" onClick={handleSubmit} disabled={isPosting}>
            {t("createGroup", "Create Group")}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </div>
  );
};

export default AddGroupModal;
