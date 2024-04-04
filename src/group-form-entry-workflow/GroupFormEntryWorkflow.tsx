import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';
import GroupDisplayHeader from './group-display-header';
import styles from './styles.scss';
import { GroupFormWorkflowProvider } from '../context/GroupFormWorkflowContext';
import GroupSearchHeader from './group-search-header';
import SessionMetaWorkspace from './SessionMetaWorkspace';
import GroupSessionWorkspace from './GroupSessionWorkspace';

const GroupFormEntryWorkflow = () => {
  return (
    <GroupFormWorkflowProvider>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot name="breadcrumbs-slot" />
      </div>
      <GroupSearchHeader />
      <GroupDisplayHeader />
      <div className={styles.workspaceWrapper}>
        <SessionMetaWorkspace />
        <GroupSessionWorkspace />
      </div>
    </GroupFormWorkflowProvider>
  );
};

export default GroupFormEntryWorkflow;
