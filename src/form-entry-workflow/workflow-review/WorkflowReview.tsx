import { Button } from '@carbon/react';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormWorkflowContext from '../../context/FormWorkflowContext';
import FormReviewCard from '../form-review-card';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';

const WorkflowReview = () => {
  const { patientUuids } = useContext(FormWorkflowContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={styles.workspaceWrapper}>
      <div className={styles.workspace}>
        <div className={styles.leftPanel}>
          <h4>{t('review', 'Review')}</h4>
          <div className={styles.navButtons}>
            <Button kind="primary" onClick={() => navigate('/')}>
              {t('save&close', 'Save & Close')}
            </Button>
            <Button kind="tertiary" onClick={() => navigate('/')}>
              {t('cancel', 'Cancel')}
            </Button>
          </div>
        </div>
        <div className={styles.formContainer}>
          {patientUuids.map((patientUuid) => (
            <FormReviewCard patientUuid={patientUuid} key={patientUuid} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowReview;
