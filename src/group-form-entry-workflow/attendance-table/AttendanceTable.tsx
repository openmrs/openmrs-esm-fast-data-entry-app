import React, { useContext, useState } from "react";
import { Edit } from "@carbon/react/icons";

import {
  Checkbox,
  SkeletonText,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import { useGetPatient } from "../../hooks";
import AddGroupModal from "../../add-group-modal/AddGroupModal";

const PatientRow = ({ patientUuid }) => {
  const patient = useGetPatient(patientUuid);
  const { patientUuids, addPatientUuid, removePatientUuid } = useContext(
    GroupFormWorkflowContext
  );
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;

  const handleOnChange = (e, { checked }) => {
    if (checked) {
      addPatientUuid(patientUuid);
    } else {
      removePatientUuid(patientUuid);
    }
  };

  if (!patient) {
    return (
      <TableRow>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <Checkbox diabled />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        {patient.display ||
          patient.displayName ||
          [givenName, familyName].join(" ")}
      </TableCell>
      <TableCell>{identifier}</TableCell>
      <TableCell>
        <Checkbox
          checked={patientUuids.includes(patientUuid)}
          labelText={patientUuid}
          hideLabel
          id={`${identifier}-attendance-checkbox`}
          onChange={handleOnChange}
        />
      </TableCell>
    </TableRow>
  );
};

const AttendanceTable = () => {
  const { t } = useTranslation();
  const { activeGroupUuid, activeGroupName, activeGroupMembers } = useContext(
    GroupFormWorkflowContext
  );

  const [isOpen, setIsOpen] = useState(false);

  const headers = [
    t("name", "Name"),
    t("identifier", "Patient ID"),
    t("patientIsPresent", "Patient is present"),
  ];

  if (!activeGroupUuid) {
    return <div>{t("selectGroupFirst", "Please select a group first")}</div>;
  }

  const newArr = activeGroupMembers.map(function (value) {
    return { uuid: value };
  });

  const handleCancel = () => {
    setIsOpen(false);
  };

  const onPostSubmit = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <span style={{ flexGrow: 1 }} />
      <Button kind="ghost" onClick={() => setIsOpen(true)}>
        {t("editGroup", "Edit Group")}&nbsp;
        <Edit size={20} />
      </Button>
      <AddGroupModal
        {...{
          cohortUuid: activeGroupUuid,
          patients: newArr,
          isCreate: false,
          groupName: activeGroupName,
          isOpen: isOpen,
          handleCancel: handleCancel,
          onPostSubmit: onPostSubmit,
        }}
      />
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activeGroupMembers.map((patientUuid, index) => (
            <PatientRow {...{ patientUuid }} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
