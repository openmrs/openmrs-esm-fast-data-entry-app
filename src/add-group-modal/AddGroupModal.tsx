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
import { ExtensionSlot, showToast, useConfig } from "@openmrs/esm-framework";
import styles from "./styles.scss";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import { usePostCohort } from "../hooks";
import GroupAttributeComponent, {
  CohortAttribute,
} from "./cohort-attribute-component/GroupAttributeComponent";

const MemExtension = React.memo(ExtensionSlot);

const buildPatientDisplay = (patient) => {
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;

  let display = identifier ? identifier + " - " : "";
  display += (givenName || "") + " " + (familyName || "");
  return display.replace(/\s+/g, " ");
};

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  const onClickHandler = useCallback(
    () => removePatient(patient?.uuid),
    [patient, removePatient]
  );
  const patientDisplay = useMemo(() => {
    if (!patient) {
      return "";
    }

    if (patient.display) {
      return patient.display;
    }

    return buildPatientDisplay(patient);
  }, [patient]);

  return (
    <li key={patient?.uuid} className={styles.patientRow}>
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
      <span className={styles.patientName}>{patientDisplay}</span>
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
    groupAttributes,
    onCohortAttributeValueChange,
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
      <GroupAttributeComponent
        cohortAttributeTypes={groupAttributes}
        onChange={onCohortAttributeValueChange}
      />
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

const AddGroupModal = ({
  patients = undefined,
  isCreate = undefined,
  groupName = "",
  cohortUuid = undefined,
  isOpen,
  handleCancel,
  onPostSubmit,
  attributes = undefined,
}) => {
  const { setGroup } = useContext(GroupFormWorkflowContext);
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [name, setName] = useState(groupName);
  const [patientList, setPatientList] = useState(patients || []);
  const { post, result, error } = usePostCohort();
  const { groupAttributesConfig } = useConfig();
  const [groupAttributes, setGroupAttributes] = useState<CohortAttribute[]>([]);

  console.log("result", result);
  console.log("groupName", groupName);

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

  useMemo(() => {
    setGroupAttributes(
      groupAttributesConfig?.map((config) => {
        const attribute = attributes?.find(
          (a) => a.attributeType.uuid == config.uuid
        );
        return {
          uuid: attribute?.uuid,
          labelCode: config.labelCode,
          value: attribute?.value,
          attributeType: {
            name: config.name,
            type: config.type,
            uuid: config.uuid,
          },
        };
      })
    );
  }, [groupAttributesConfig, attributes]);

  const onCohortAttributeValueChange = (attributeId: string, value: any) => {
    const updatedAttributes = [...groupAttributes];
    updatedAttributes.find(
      (a: CohortAttribute) => a.attributeType.uuid == attributeId
    ).value = value;
    setGroupAttributes(updatedAttributes);
  };

  const getAttributesPayload = () => {
    return groupAttributes.map((a: CohortAttribute) => {
      return {
        uuid: a.uuid,
        value: a.value,
        attributeType: {
          uuid: a.attributeType.uuid,
        },
      };
    });
  };

  const handleSubmit = () => {
    if (validate()) {
      post({
        uuid: cohortUuid,
        name: name,
        attributes: getAttributesPayload(),
        cohortMembers: patientList.map((p) => ({ patient: p.uuid })),
      });
      if (onPostSubmit) {
        onPostSubmit();
      }
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
              groupAttributes,
              onCohortAttributeValueChange,
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
