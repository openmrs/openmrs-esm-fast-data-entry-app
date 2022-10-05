import React, { useContext } from "react";

import {
  Checkbox,
  SkeletonText,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";
import { useGetPatient } from "../../hooks";

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
  const { activeGroupUuid, activeGroupMembers } = useContext(
    GroupFormWorkflowContext
  );

  const headers = [
    t("name", "Name"),
    t("identifier", "Patient ID"),
    t("patientIsPresent", "Patient is present"),
  ];

  if (!activeGroupUuid) {
    return <div>{t("selectGroupFirst", "Please select a group first")}</div>;
  }

  return (
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
  );
};

export default AttendanceTable;
