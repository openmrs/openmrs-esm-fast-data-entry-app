import { Button } from '@carbon/react';
import React, { useContext, useEffect, useState } from 'react';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';
import GroupFormWorkflowContext from '../context/GroupFormWorkflowContext';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import CancelModal from '../CancelModal';
import SessionDetailsForm from './SessionDetailsForm';

const NewGroupWorkflowButtons = () => {
  const { t } = useTranslation();
  const context = useContext(GroupFormWorkflowContext);
  const { workflowState, patientUuids } = context;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  if (workflowState !== 'NEW_GROUP_SESSION') return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button kind="secondary" type="submit" disabled={!patientUuids.length}>
          {t('createNewSession', 'Create New Session')}
        </Button>
        <Button
          kind="tertiary"
          onClick={() => {
            setCancelModalOpen(true);
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
      <CancelModal open={cancelModalOpen} setOpen={setCancelModalOpen} context={context} />
    </>
  );
};

const GroupIdField = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { activeGroupUuid } = useContext(GroupFormWorkflowContext);

  useEffect(() => {
    if (activeGroupUuid) setValue('groupUuid', activeGroupUuid);
  }, [activeGroupUuid, setValue]);

  return (
    <>
      <input
        hidden
        {...register('groupUuid', {
          value: activeGroupUuid,
          required: t('chooseGroupError', 'Please choose a group.'),
        })}
      />
      {errors.groupUuid && !activeGroupUuid && (
        <div className={styles.formError}>{errors.groupUuid.message as string}</div>
      )}
    </>
  );
};

const SessionMetaWorkspace = () => {
  const { t } = useTranslation();
  const { setSessionMeta, workflowState } = useContext(GroupFormWorkflowContext);
  const methods = useForm();

  const onSubmit = (data) => {
    const { sessionDate, ...rest } = data;
    setSessionMeta({ ...rest, sessionDate: sessionDate[0] });
  };

  if (workflowState !== 'NEW_GROUP_SESSION') return null;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className={styles.workspace}>
          <div className={styles.formMainContent}>
            <div className={styles.formContainer}>
              <SessionDetailsForm />
            </div>
            <div className={styles.rightPanel}>
              <h4>{t('newGroupSession', 'New Group Session')}</h4>
              <GroupIdField />
              <hr style={{ width: '100%' }} />
              <NewGroupWorkflowButtons />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default SessionMetaWorkspace;
