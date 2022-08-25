import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
import { ExtensionSlot, useConfig, interpolateString, navigate, ConfigurableLink, age } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';
import styles from './compact-patient-banner.scss';

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
  selectPatientAction?: (patientUuid: string) => void;
}

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({groups hidePanel, selectPatientAction }) => {
  const config = useConfig();
  const { t } = useTranslation();

  const onClickSearchResult = useCallback(
    (evt, patientUuid) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patientUuid);
      } else {
        navigate({
          to: interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          }),
        });
      }
      if (hidePanel) {
        hidePanel();
      }
    },
    [config.search.patientResultUrl, hidePanel, selectPatientAction],
  );

  return (
    <>
      {groups.map((group) => (
        <ConfigurableLink
          onClick={(evt) => onClickSearchResult(evt, patient.id)}
          to={interpolateString(config.search.patientResultUrl, {
            patientUuid: patient.id,
          })}
          key={patient.id}
          className={styles.patientSearchResult}>
          <div className={styles.patientAvatar} role="img">
            <ExtensionSlot
              extensionSlotName="patient-photo-slot"
              state={{
                patientUuid: patient.id,
                patientName: `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
                size: 'small',
              }}
            />
          </div>
          <div>
            <h2 className={styles.patientName}>{`${patient.name?.[0]?.given?.join(' ')} ${
              patient.name?.[0]?.family
            }`}</h2>
            <p className={styles.demographics}>
              {getGender(patient.gender)} <span className={styles.middot}>&middot;</span> {age(patient.birthDate)}{' '}
              <span className={styles.middot}>&middot;</span> {patient.identifier?.[0]?.identifier}
            </p>
          </div>
        </ConfigurableLink>
      ))}
    </>
  );
};

export const SearchResultSkeleton = () => {
  return (
    <div className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon
          style={{
            height: '3rem',
            width: '3rem',
          }}
        />
      </div>
      <div>
        <h2 className={styles.patientName}>
          <SkeletonText />
        </h2>
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

export default PatientSearchResults;
