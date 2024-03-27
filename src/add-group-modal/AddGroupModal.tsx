import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  FormLabel,
} from "@carbon/react";
import { TrashCan } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import {
  ExtensionSlot,
  fetchCurrentPatient,
  showToast,
} from "@openmrs/esm-framework";
import styles from "./styles.scss";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import { usePostCohort } from "../hooks";

const MemExtension = React.memo(ExtensionSlot);

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  const onClickHandler = useCallback(
    () => removePatient(patient?.uuid),
    [patient, removePatient]
  );

  return (
    <li className={styles.patientRow}>
      <span>
        <Button
          kind="tertiary"
          size="sm"
          hasIconOnly
          onClick={onClickHandler}
          renderIcon={TrashCan}
          tooltipAlignment="start"
          tooltipPosition="top"
          iconDescription={t("remove", "Remove")}
        />
      </span>
      <span className={styles.patientName}>{patient.display}</span>
    </li>
  );
};

const SortedPatientList = (props) => {
  const { patientList, removePatient } = props;

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    let ignore = false;

    const getPatients = async (uuids) => {
      return await Promise.all(uuids.map((uuid) => fetchCurrentPatient(uuid)));
    };

    getPatients(patientList.map((obj) => obj.uuid)).then((result) => {
      if (!ignore) {
        setPatients(result);
      }
    });

    return () => {
      ignore = true;
    };
  }, [patientList]);

  const sortedPatientList = useMemo(() => {
    if (patients?.length === 0 || patientList?.length === 0) return [];

    const getPersonDisplay = (patient) => {
      if (!patient) return null;

      const { identifier, name } = patient;
      const displayIdentifier = identifier?.[0]?.value || "";
      const givenNames = `${(name?.[0]?.given || []).join(" ")} ${
        name?.[0]?.family || ""
      }`;

      return `${
        displayIdentifier ? `${displayIdentifier} -` : ""
      } ${givenNames}`.trim();
    };

    return patientList
      .map((obj) => {
        return {
          uuid: obj.uuid,
          display: getPersonDisplay(
            patients.find((value) => value.id === obj.uuid)
          ),
        };
      })
      .sort((a, b) => a.display?.localeCompare(b?.display));
  }, [patients, patientList]);

  return (
    <ul className={styles.patientList}>
      {sortedPatientList?.map((patient) => (
        <PatientRow
          patient={patient}
          removePatient={removePatient}
          key={patient?.uuid}
        />
      ))}
    </ul>
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
        <SortedPatientList
          patientList={patientList}
          removePatient={removePatient}
        />
      )}

      <FormLabel>
        {t(
          "searchForPatientsToAddToGroup",
          "Search for patients to add to group"
        )}
      </FormLabel>
      <div className={styles.searchBar}>
        <MemExtension
          name="patient-search-bar-slot"
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

const AddGroupModal = ({
  patients = undefined,
  isCreate = undefined,
  groupName = "",
  cohortUuid = undefined,
  isOpen,
  onPostCancel,
  onPostSubmit,
}) => {
  const { setGroup } = useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [name, setName] = useState(groupName);
  const [patientList, setPatientList] = useState(patients || []);
  const { post, result, error } = usePostCohort();

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
        if (!patientList.find((p) => p.uuid === patient)) {
          return [...patientList, { uuid: patient }];
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
        uuid: cohortUuid,
        name: name,
        cohortMembers: patientList.map((p) => ({ patient: p.uuid })),
      });
      if (onPostSubmit) {
        onPostSubmit();
      }
    }
  };

  const handleCancel = () => {
    setPatientList(patients || []);
    if (onPostCancel) {
      onPostCancel();
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
          t("unknownPostError", "An unknown error occurred while saving data"),
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
      <ComposedModal open={isOpen} onClose={handleCancel}>
        <ModalHeader>
          {isCreate
            ? t("createNewGroup", "Create New Group")
            : t("editGroup", "Edit Group")}
        </ModalHeader>
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
            {isCreate ? t("createGroup", "Create Group") : t("save", "Save")}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </div>
  );
};

export default AddGroupModal;
