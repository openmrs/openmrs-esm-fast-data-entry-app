import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  CheckboxSkeleton,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from '../../context/GroupFormWorkflowContext';

const PatientRow = ({ patient }) => {
  const { patientUuids, addPatientUuid, removePatientUuid } = useContext(GroupFormWorkflowContext);
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;

  const handleOnChange = (e, { checked }) => {
    if (checked) {
      addPatientUuid(patient.id);
    } else {
      removePatientUuid(patient.id);
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
          <CheckboxSkeleton />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{patient.display || patient.displayName || [givenName, familyName].join(' ')}</TableCell>
      <TableCell>{identifier}</TableCell>
      <TableCell>
        <Checkbox
          checked={patientUuids.includes(patient.id)}
          labelText={patient.id}
          hideLabel
          id={`${identifier}-attendance-checkbox`}
          onChange={handleOnChange}
        />
      </TableCell>
    </TableRow>
  );
};

const AttendanceTable = ({ patients }) => {
  const { t } = useTranslation();
  const { activeFormUuid, activeGroupUuid, activeGroupName, activeGroupMembers, setGroup } =
    useContext(GroupFormWorkflowContext);

  const disposeModal = useRef<() => void>();
  const workflowVersion = useRef(0);
  useEffect(
    () => () => {
      workflowVersion.current += 1;
      disposeModal.current?.();
    },
    [activeFormUuid],
  );

  const headers = [t('name', 'Name'), t('identifier', 'Patient ID'), t('patientIsPresent', 'Patient is present')];

  const newArr = useMemo(() => {
    return activeGroupMembers.map(function (value) {
      const patient = patients.find((patient) => patient.id === value);
      return { uuid: value, ...patient };
    });
  }, [activeGroupMembers, patients]);

  if (!activeGroupUuid) {
    return <div>{t('selectGroupFirst', 'Please select a group first')}</div>;
  }

  return (
    <div>
      <span style={{ flexGrow: 1 }} />
      <Button
        kind="ghost"
        onClick={() => {
          const version = workflowVersion.current;
          disposeModal.current?.();
          disposeModal.current = showModal('fde-add-group-modal', {
            cohortUuid: activeGroupUuid,
            patients: newArr,
            isCreate: false,
            groupName: activeGroupName,
            onSave: (group) => {
              if (version === workflowVersion.current) setGroup(group);
            },
          });
        }}
      >
        {t('editGroup', 'Edit Group')}&nbsp;
        <Edit size={20} />
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activeGroupMembers.map((patientUuid, index) => {
            const patient = patients.find((patient) => patient.id === patientUuid);
            return <PatientRow patient={patient} key={index} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
