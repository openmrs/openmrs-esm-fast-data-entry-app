import React, { useContext, useEffect, useRef } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import GroupFormWorkflowContext from '../context/GroupFormWorkflowContext';
import SessionDetailsForm from './SessionDetailsForm';
import styles from './styles.scss';

const NewGroupWorkflowButtons = () => {
  const { t } = useTranslation();
  const context = useContext(GroupFormWorkflowContext);
  const { workflowState, patientUuids } = context;
  const disposeModal = useRef<() => void>();
  useEffect(
    () => () => {
      disposeModal.current?.();
    },
    [context.activeFormUuid],
  );
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
            disposeModal.current?.();
            disposeModal.current = showModal('fde-cancel-session-modal', {
              onDiscard: context.destroySession,
              onSaveAndClose: context.closeSession,
            });
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
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
