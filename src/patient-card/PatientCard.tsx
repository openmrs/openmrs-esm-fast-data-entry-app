import { CheckmarkOutline, WarningAlt } from '@carbon/react/icons';
import { SkeletonText } from '@carbon/react';
import React from 'react';
import useGetPatient from '../hooks/useGetPatient';
import styles from './styles.scss';

const CardContainer = ({ onClick = () => undefined, active, children }) => {
  return (
    <div
      onClick={onClick}
      className={`${styles.cardContainer} ${!active && styles.inactiveCard}`}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

const PatientCard = ({ patientUuid, activePatientUuid, editEncounter, encounters }) => {
  const patient = useGetPatient(patientUuid);
  const givenName = patient?.name?.[0]?.given?.[0];
  const familyName = patient?.name?.[0]?.family;
  const identifier = patient?.identifier?.[0]?.value;

  if (!patient) {
    return (
      <CardContainer active={true}>
        <SkeletonText className={styles.skeletonText} />
      </CardContainer>
    );
  }

  const active = activePatientUuid === patientUuid;

  return (
    <CardContainer onClick={active ? () => undefined : () => editEncounter(patientUuid)} active={active}>
      <div className={styles.patientInfo}>
        <div className={styles.identifier}>{identifier}</div>
        <div className={`${styles.displayName} ${active && styles.activeDisplayName}`}>
          {givenName} {familyName}
        </div>
      </div>
      <div>
        {patientUuid in encounters ? (
          <CheckmarkOutline size={16} className={styles.statusSuccess} />
        ) : (
          <WarningAlt size={16} className={styles.statusWarning} />
        )}
      </div>
    </CardContainer>
  );
};

export default PatientCard;
