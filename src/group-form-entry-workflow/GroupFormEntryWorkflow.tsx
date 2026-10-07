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
