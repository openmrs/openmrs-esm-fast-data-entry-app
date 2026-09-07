import { Close, Add } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import React, { useCallback, useContext } from 'react';
import { useConfig, useSession, showSnackbar } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from '../../context/GroupFormWorkflowContext';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';
import CompactGroupSearch from '../group-search/CompactGroupSearch';
import useModalLauncher from '../../hooks/useModalLauncher';

const GroupSearchHeader = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const { sessionLocation } = useSession();
  const { activeFormUuid, activeGroupUuid, setGroup, destroySession } = useContext(GroupFormWorkflowContext);
  const launchModal = useModalLauncher(activeFormUuid);

  const handleSelectGroup = useCallback(
    (group) => {
      if (config.enforcePatientListLocationMatch && group.location && sessionLocation.uuid !== group.location.uuid) {
        showSnackbar({
          kind: 'error',
          title: t('locationMismatch', 'Location Mismatch'),
          subtitle: t(
            'groupLocationMismatchEnforced',
            'Cannot select group from {{groupLocation}} for a session at {{sessionLocation}}',
            {
              groupLocation: group.location?.display,
              sessionLocation: sessionLocation?.display,
            },
          ),
        });
        return;
      }

      if (group.cohortMembers) {
        group.cohortMembers.sort((a, b) => {
          const aName = a?.patient?.person?.names?.[0]?.display;
          const bName = b?.patient?.person?.names?.[0]?.display;
          return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        });
      }
      setGroup(group);
    },
    [config.enforcePatientListLocationMatch, sessionLocation, setGroup, t],
  );

  const handleOpenClick = () => launchModal('fde-add-group-modal', { isCreate: true, setGroup });

  if (activeGroupUuid) return null;

  return (
    <div className={styles.searchHeaderContainer}>
      <span className={styles.padded}>{t('findGroup', 'Find group')}:</span>
      <span className={styles.searchBarWrapper}>
        <CompactGroupSearch selectGroupAction={handleSelectGroup} />
      </span>
      <span className={styles.padded}>{t('or', 'or')}</span>
      <span>
        <Button onClick={handleOpenClick} renderIcon={Add} iconDescription="Add">
          {t('createNewGroup', 'Create New Group')}
        </Button>
      </span>
      <span style={{ flexGrow: 1 }} />
      <span>
        <Button
          kind="ghost"
          onClick={() => {
            destroySession();
          }}
        >
          {t('cancel', 'Cancel')} <Close size={20} />
        </Button>
      </span>
    </div>
  );
};

export default GroupSearchHeader;
