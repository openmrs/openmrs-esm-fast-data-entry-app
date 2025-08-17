import { age, ExtensionSlot } from '@openmrs/esm-framework';
import { SkeletonPlaceholder, SkeletonText } from '@carbon/react';
import React, { useContext, useMemo } from 'react';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';
import useGetPatient from '../../hooks/useGetPatient';
import FormWorkflowContext from '../../context/FormWorkflowContext';

const SkeletonPatientInfo = () => {
  return (
    <div className={styles.container}>
      <SkeletonPlaceholder className={styles.photoPlaceholder} />
      <div className={styles.patientInfoContent}>
        <div className={styles.patientInfoRow}>
          <SkeletonText width="7rem" lineCount={1} />
        </div>
        <div className={styles.patientInfoRow}>
          <span>
            <SkeletonText width="1rem" lineCount={1} />
          </span>
          <span>&middot;</span>
          <span>
            <SkeletonText width="1rem" lineCount={1} />
          </span>
          <span>&middot;</span>
          <span>
            <SkeletonText width="1rem" lineCount={1} />
          </span>
        </div>
      </div>
    </div>
  );
};

const PatientBanner = () => {
  const { activePatientUuid, workflowState } = useContext(FormWorkflowContext);
  const patient = useGetPatient(activePatientUuid);
  const { t } = useTranslation();
  const patientName = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0]?.family}`;

  const patientPhotoSlotState = useMemo(
    () => ({ patientUuid: patient?.id, patientName, size: 'small' }),
    [patient?.id, patientName],
  );

  if (workflowState === 'NEW_PATIENT') return null;

  if (!patient) {
    return <SkeletonPatientInfo />;
  }

  return <Banner patient={patient} hideActionsOverflow />;
};

const Banner: React.FC<{ patient: any; hideActionsOverflow?: any }> = ({ patient, hideActionsOverflow }) => {
  return (
    <div className={styles.patientBannerContainer}>
      <ExtensionSlot
        name="patient-header-slot"
        state={{
          patient,
          patientUuid: patient.id,
          hideActionsOverflow,
        }}
      />
    </div>
  );
};

export default PatientBanner;
