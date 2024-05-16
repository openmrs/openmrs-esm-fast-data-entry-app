import { useEffect, useState } from 'react';

const useFormState = (formUuid) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.formUuid === formUuid) {
        setState(e.detail?.state);
      }
    };

    window.addEventListener('ampath-form-state', handler);

    return () => {
      window.removeEventListener('ampath-form-state', handler);
    };
  }, [formUuid]);

  return state;
};

export default useFormState;
