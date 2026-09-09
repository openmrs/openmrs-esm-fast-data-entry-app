import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormLabel, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import {
  ExtensionSlot,
  fetchCurrentPatient,
  showModal,
  showSnackbar,
  useConfig,
  usePatient,
  useSession,
} from '@openmrs/esm-framework';
import { useHsuIdIdentifier } from '../hooks/location-tag.resource';
import { saveCohort } from './add-group.resource';
import styles from './styles.scss';

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  const { patient: patientInfo, error, isLoading } = usePatient(patient?.uuid);
  const onClickHandler = useCallback(() => removePatient(patient?.uuid), [patient, removePatient]);

  const patientDisplay = useMemo(() => {
    if (isLoading || error || !patientInfo) return '';

    const { identifier, name } = patientInfo;
    const displayIdentifier = identifier?.[0]?.value || '';
    const givenNames = `${(name?.[0]?.given || []).join(' ')} ${name?.[0]?.family || ''}`;

    return `${displayIdentifier ? `${displayIdentifier} -` : ''}${givenNames ? ` ${givenNames}` : ''}`.trim();
  }, [isLoading, error, patientInfo]);

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
          iconDescription={t('remove', 'Remove')}
        />
      </span>
      <span className={styles.patientName}>{patientDisplay}</span>
    </li>
  );
};

const NewGroupForm = (props) => {
  const { name, setName, patientList, updatePatientList, errors, validate, removePatient } = props;
  const { t } = useTranslation();

  const extensionSlotState = useMemo(
    () => ({
      selectPatientAction: updatePatientList,
      buttonProps: {
        kind: 'secondary',
      },
    }),
    [updatePatientList],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
      }}
    >
      <TextInput
        id="newGroupName"
        labelText={t('newGroupName', 'New Group Name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => validate('name')}
      />
      {errors?.name && (
        <p className={styles.formError}>
          {errors.name === 'required' ? t('groupNameError', 'Please enter a group name.') : errors.name}
        </p>
      )}
      <FormLabel>
        {patientList.length} {t('patientsInGroup', 'Patients in group')}
      </FormLabel>
      {errors?.patientList && (
        <p className={styles.formError}>{t('noPatientError', 'Please enter at least one patient.')}</p>
      )}
      {!errors?.patientList && (
        <ul className={styles.patientList}>
          {patientList?.map((patient, index) => (
            <PatientRow patient={patient} removePatient={removePatient} key={patient.uuid} />
          ))}
        </ul>
      )}

      <FormLabel>{t('searchForPatientsToAddToGroup', 'Search for patients to add to group')}</FormLabel>
      <div className={styles.searchBar}>
        <ExtensionSlot name="patient-search-bar-slot" state={extensionSlotState} />
      </div>
    </div>
  );
};

const AddGroupModal = ({
  patients = undefined,
  isCreate = undefined,
  groupName = '',
  cohortUuid = undefined,
  close,
  onSave,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [name, setName] = useState(groupName);
  const [patientList, setPatientList] = useState(patients || []);
  const [isPosting, setIsPosting] = useState(false);
  const config = useConfig();
  const [selectedPatientUuid, setSelectedPatientUuid] = useState();
  const { hsuIdentifier } = useHsuIdIdentifier(selectedPatientUuid);
  const { sessionLocation } = useSession();

  const removePatient = useCallback(
    (patientUuid: string) =>
      setPatientList((patientList) => patientList.filter((patient) => patient.uuid !== patientUuid)),
    [setPatientList],
  );

  const validate = useCallback(
    (field?: string) => {
      let valid = true;
      if (field) {
        valid = field === 'name' ? !!name : !!patientList.length;
        setErrors((errors) => ({
          ...errors,
          [field]: valid ? null : 'required',
        }));
      } else {
        if (!name) {
          setErrors((errors) => ({ ...errors, name: 'required' }));
          valid = false;
        } else {
          setErrors((errors) => ({ ...errors, name: null }));
        }
        if (!patientList.length) {
          setErrors((errors) => ({ ...errors, patientList: 'required' }));
          valid = false;
        } else {
          setErrors((errors) => ({ ...errors, patientList: null }));
        }
      }
      return valid;
    },
    [name, patientList.length],
  );

  const addSelectedPatientToList = useCallback(() => {
    function getPatientName(patient) {
      return [patient?.name?.[0]?.given, patient?.name?.[0]?.family].join(' ');
    }
    if (!patientList.find((p) => p.uuid === selectedPatientUuid)) {
      fetchCurrentPatient(selectedPatientUuid).then((result) => {
        const newPatient = { uuid: selectedPatientUuid, ...result };
        setPatientList(
          [...patientList, newPatient].sort((a, b) =>
            getPatientName(a).localeCompare(getPatientName(b), undefined, {
              sensitivity: 'base',
            }),
          ),
        );
      });
    }
    setErrors((errors) => ({ ...errors, patientList: null }));
    setSelectedPatientUuid(null);
  }, [selectedPatientUuid, patientList, setPatientList]);

  const updatePatientList = (patientUuid) => {
    setSelectedPatientUuid(patientUuid);
  };

  useEffect(() => {
    if (!selectedPatientUuid || !hsuIdentifier) return;

    const locationMismatch = sessionLocation.uuid != hsuIdentifier.location.uuid;

    if (locationMismatch && config.enforcePatientListLocationMatch) {
      showSnackbar({
        kind: 'error',
        title: t('locationMismatch', 'Location Mismatch'),
        subtitle: t(
          'patientLocationMismatchEnforced',
          'Cannot add patient from {{hsuLocation}} to a session at {{sessionLocation}}',
          {
            hsuLocation: hsuIdentifier.location?.display,
            sessionLocation: sessionLocation?.display,
          },
        ),
      });
      setSelectedPatientUuid(null);
    } else if (config.patientLocationMismatchCheck && locationMismatch) {
      let active = true;
      const dispose = showModal(
        'fde-patient-location-mismatch-modal',
        {
          onConfirm: addSelectedPatientToList,
          sessionLocation,
          hsuLocation: hsuIdentifier.location,
        },
        () => {
          if (active) setSelectedPatientUuid(null);
        },
      );
      return () => {
        active = false;
        dispose();
      };
    } else {
      addSelectedPatientToList();
    }
  }, [
    selectedPatientUuid,
    sessionLocation,
    hsuIdentifier,
    addSelectedPatientToList,
    config.patientLocationMismatchCheck,
    config.enforcePatientListLocationMatch,
    t,
  ]);

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsPosting(true);
    const members = patientList.map((p) => ({ patient: { uuid: p.uuid } }));
    try {
      const savedGroup = await saveCohort({
        uuid: cohortUuid,
        name,
        cohortType: config?.groupSessionConcepts?.cohortTypeId,
        location: sessionLocation?.uuid,
        cohortMembers: patientList.map((p) => ({ patient: p.uuid, startDate: new Date().toISOString() })),
      });
      onSave({ ...savedGroup, cohortMembers: members });
      close();
    } catch (error) {
      const submissionError: {
        message?: string;
        fieldErrors?: Record<string, Array<{ message: string }>>;
      } = error?.responseBody?.error ?? error?.responseBody ?? error;
      showSnackbar({
        kind: 'error',
        title: t('postError', 'POST Error'),
        subtitle: submissionError?.message ?? t('unknownPostError', 'An unknown error occurred while saving data'),
      });
      if (submissionError?.fieldErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(submissionError.fieldErrors).map(([key, value]) => [key, value?.[0]?.message]),
          ),
        );
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <ModalHeader closeModal={close}>
        {isCreate ? t('createNewGroup', 'Create New Group') : t('editGroup', 'Edit Group')}
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
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleSubmit} disabled={isPosting}>
          {isCreate ? t('createGroup', 'Create Group') : t('save', 'Save')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddGroupModal;
