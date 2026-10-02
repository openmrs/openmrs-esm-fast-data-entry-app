import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormName } from '../hooks/useFormName';
import styles from './styles.scss';

interface FormNameProps {
  formUuid?: string;
  variant: 'inline' | 'panel';
}

/**
 * Shows the name of the form being filled in. `inline` sits at the start of a workflow's action bar,
 * followed by a divider. `panel` sits at the top of a workflow's right-hand panel.
 */
const FormName: React.FC<FormNameProps> = ({ formUuid, variant }) => {
  const { t } = useTranslation();
  const formName = useFormName(formUuid);

  if (!formName) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <>
        <span className={styles.inlineName} title={formName}>
          {formName}
        </span>
        <span className={styles.divider} aria-hidden="true" />
      </>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.label}>{t('form', 'Form')}</p>
      <p className={styles.panelName}>{formName}</p>
    </div>
  );
};

export default FormName;
