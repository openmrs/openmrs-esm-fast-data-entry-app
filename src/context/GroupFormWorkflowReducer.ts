import { navigate } from '@openmrs/esm-framework';
import { initialWorkflowState } from './FormWorkflowContext';
import { v4 as uuid } from 'uuid';

export const fdeGroupWorkflowStorageVersion = '1.0.5';
export const fdeGroupWorkflowStorageName = 'openmrs:fastDataEntryGroupWorkflowState';
const persistData = (data) => {
  localStorage.setItem(fdeGroupWorkflowStorageName + ':' + data.userUuid, JSON.stringify(data));
};

const initialFormState = {
  workflowState: 'NEW_GROUP_SESSION',
  groupUuid: null,
  groupName: null,
  groupMembers: [],
  activePatientUuid: null,
  activeEncounterUuid: null,
  activeVisitUuid: null,
  activeSessionUuid: null,
  patientUuids: [],
  encounters: {},
  visits: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_WORKFLOW_STATE': {
      const savedData = localStorage.getItem(fdeGroupWorkflowStorageName + ':' + action.userUuid);
      const savedDataObject = savedData ? JSON.parse(savedData) : {};
      let newState: { [key: string]: unknown } = {};
      if (savedData && savedDataObject['_storageVersion'] === fdeGroupWorkflowStorageVersion) {
        // there is localStorage data and it is still valid
        const thisSavedForm = savedDataObject.forms?.[action.activeFormUuid];
        // set active patient to the last one we were on
        const activePatientUuid =
          thisSavedForm?.activePatientUuid ||
          // or set it to the first member in the list
          thisSavedForm?.patientUuids?.[0] ||
          // something probably went wrong...
          null;
        const activeSessionUuid = thisSavedForm?.activeSessionUuid || uuid();
        newState = {
          ...savedDataObject,
          // set current form to this one
          activeFormUuid: action.activeFormUuid,
          forms: {
            ...savedDataObject.forms,
            // initialize this particular form if it hasn't been created already
            [action.activeFormUuid]: {
              ...initialFormState,
              ...thisSavedForm,
              activePatientUuid: activePatientUuid,
              activeEncounterUuid: thisSavedForm?.encounters?.[activePatientUuid] || null,
              activeVisitUuid: thisSavedForm?.visits?.[activePatientUuid] || null,
              activeSessionUuid: activeSessionUuid,
            },
          },
        };
      } else {
        // no localStorage data, or we should void it
        newState = {
          ...initialWorkflowState,
          _storageVersion: fdeGroupWorkflowStorageVersion,
          forms: {
            [action.activeFormUuid]: initialFormState,
          },
          activeFormUuid: action.activeFormUuid,
          userUuid: action.userUuid,
        };
      }
      persistData(newState);
      return newState;
    }

    case 'SET_GROUP': {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            groupUuid: action.group.uuid,
            groupName: action.group.name,
            patientUuids:
              // this translation is not preferred
              // the only reason we tollerate it here is beause it should be the only time
              // we add cohort information to state
              action.group.cohortMembers?.map((member) => member?.patient?.uuid) ?? [],
            groupMembers: action.group.cohortMembers?.map((member) => member?.patient?.uuid) ?? [],
            activePatientUuid: null,
            activeEncounterUuid: null,
            activeVisitUuid: null,
            activeSessionUuid: null,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'UNSET_GROUP': {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            groupUuid: null,
            groupName: null,
            patientUuids: [],
            groupMembers: [],
            activePatientUuid: null,
            activeEncounterUuid: null,
            activeVisitUuid: null,
            activeSessionUuid: null,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'SET_SESSION_META': {
      // requires that group is already entered and contains patientUuids
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            sessionMeta: action.meta,
            activePatientUuid: state.forms[state.activeFormUuid].patientUuids?.[0],
            activeEncounterUuid:
              state.forms[state.activeFormUuid].encounters[state.forms[state.activeFormUuid].patientUuids?.[0]] || null,
            activeVisitUuid:
              state.forms[state.activeFormUuid].visits[state.forms[state.activeFormUuid].patientUuids?.[0]] || null,
            activeSessionUuid: uuid(),
            workflowState: 'EDIT_FORM',
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'ADD_PATIENT_UUID': {
      if (state.forms[state.activeFormUuid].patientUuids.includes(action.patientUuid)) {
        return state;
      }

      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            patientUuids: [...state.forms[state.activeFormUuid].patientUuids, action.patientUuid],
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'REMOVE_PATIENT_UUID': {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            patientUuids: state.forms[state.activeFormUuid].patientUuids?.filter((uuid) => action.patientUuid !== uuid),
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'SAVE_ENCOUNTER': {
      const thisForm = state.forms[state.activeFormUuid];
      if (thisForm.workflowState === 'SUBMIT_FOR_COMPLETE') {
        const { [state.activeFormUuid]: activeForm, ...formRest } = state.forms;
        const newState = {
          ...state,
          forms: formRest,
          activeFormUuid: null,
        };
        persistData(newState);
        // eslint-disable-next-line
        navigate({ to: '${openmrsSpaBase}/forms' });
        return newState;
      } else if (thisForm.workflowState === 'SUBMIT_FOR_NEXT') {
        const nextPatientUuid = state.nextPatientUuid
          ? state.nextPatientUuid
          : thisForm.patientUuids[
              Math.min(thisForm.patientUuids.indexOf(thisForm.activePatientUuid) + 1, thisForm.patientUuids.length - 1)
            ];
        const encounters = {
          ...thisForm.encounters,
          [thisForm.activePatientUuid]: action.encounterUuid,
        };
        const newState = {
          ...state,
          forms: {
            ...state.forms,
            [state.activeFormUuid]: {
              ...thisForm,
              encounters,
              activePatientUuid: nextPatientUuid,
              activeEncounterUuid: encounters[nextPatientUuid] || null,
              activeVisitUuid: thisForm.visits[nextPatientUuid] || null,
              activeSessionUuid: thisForm.activeSessionUuid,
              workflowState: 'EDIT_FORM',
            },
          },
        };
        persistData(newState);
        return newState;
      } else return state;
    }
    case 'EDIT_ENCOUNTER': {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            activeEncounterUuid: state.forms[state.activeFormUuid].encounters[action.patientUuid],
            activeVisitUuid: state.forms[state.activeFormUuid].visits[action.patientUuid],
            activePatientUuid: action.patientUuid,
            activeSessionUuid: action.activeSessionUuid,
            workflowState: 'EDIT_FORM',
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'VALIDATE_FOR_NEXT':
      // this state should not be persisted
      window.dispatchEvent(
        new CustomEvent('ampath-form-action', {
          detail: {
            formUuid: state.activeFormUuid,
            patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
            action: 'validateForm',
          },
        }),
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: 'VALIDATE_FOR_NEXT',
          },
        },
      };
    case 'UPDATE_VISIT_UUID':
      // this state should not be persisted
      // we don't pers
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            visits: {
              ...state.forms[state.activeFormUuid].visits,
              [state.forms[state.activeFormUuid].activePatientUuid]: action.visitUuid,
            },
            activeVisitUuid: action.visitUuid,
          },
        },
      };

    case 'SUBMIT_FOR_NEXT':
      // this state should not be persisted
      ['ampath-form-action', 'rfe-form-submit-action'].forEach((event) =>
        window.dispatchEvent(
          new CustomEvent(event, {
            detail: {
              formUuid: state.activeFormUuid,
              patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
              ...(event === 'ampath-form-action' && { action: 'onSubmit' }),
            },
          }),
        ),
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: 'SUBMIT_FOR_NEXT',
          },
        },
        nextPatientUuid: action.nextPatientUuid,
      };
    case 'SUBMIT_FOR_REVIEW':
      // this state should not be persisted
      window.dispatchEvent(
        new CustomEvent('ampath-form-action', {
          detail: {
            formUuid: state.activeFormUuid,
            patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
            action: 'onSubmit',
          },
        }),
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: 'SUBMIT_FOR_REVIEW',
          },
        },
      };

    case 'VALIDATE_FOR_COMPLETE':
      // this state should not be persisted
      window.dispatchEvent(
        new CustomEvent('ampath-form-action', {
          detail: {
            formUuid: state.activeFormUuid,
            patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
            action: 'validateForm',
          },
        }),
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: 'VALIDATE_FOR_COMPLETE',
          },
        },
      };
    case 'SUBMIT_FOR_COMPLETE':
      // this state should not be persisted
      ['ampath-form-action', 'rfe-form-submit-action'].forEach((event) =>
        window.dispatchEvent(
          new CustomEvent(event, {
            detail: {
              formUuid: state.activeFormUuid,
              patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
              ...(event === 'ampath-form-action' && { action: 'onSubmit' }),
            },
          }),
        ),
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: 'SUBMIT_FOR_COMPLETE',
          },
        },
      };
    case 'GO_TO_REVIEW': {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            activeEncounterUuid: null,
            activVisitUuid: null,
            activePatientUuid: null,
            activeSessionUuid: null,
            workflowState: 'REVIEW',
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case 'DESTROY_SESSION': {
      const { [state.activeFormUuid]: activeForm, ...formRest } = state.forms;
      const newState = {
        ...state,
        forms: formRest,
        activeFormUuid: null,
      };
      persistData(newState);
      //eslint-disable-next-line
      navigate({ to: '${openmrsSpaBase}/forms' });
      return { ...newState, formDestroyed: true };
    }
    case 'CLOSE_SESSION': {
      const newState = {
        ...state,
        activeFormUuid: null,
      };
      persistData(newState);
      //eslint-disable-next-line
      navigate({ to: '${openmrsSpaBase}/forms' });
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
