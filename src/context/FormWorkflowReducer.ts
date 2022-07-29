import { initialWorkflowState } from "./FormWorkflowContext";

export const fdeWorkflowStorageVersion = "1.0.7";
export const fdeWorkflowStorageName = "openmrs:fastDataEntryWorkflowState";
const persistData = (data) => {
  localStorage.setItem(fdeWorkflowStorageName, JSON.stringify(data));
};

const initialFormState = {
  workflowState: "NEW_PATIENT",
  activePatientUuid: null,
  activeEncounterUuid: null,
  patientUuids: [],
  encounters: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_WORKFLOW_STATE": {
      const savedData = localStorage.getItem(fdeWorkflowStorageName);
      const savedDataObject = savedData ? JSON.parse(savedData) : {};
      let newState: { [key: string]: unknown } = {};
      const newPatient = action.newPatientUuid
        ? {
            activePatientUuid: action.newPatientUuid,
            workflowState: "EDIT_FORM",
          }
        : {};

      if (
        savedData &&
        savedDataObject["_storageVersion"] === fdeWorkflowStorageVersion
      ) {
        // there is localStorage data and it is still valid
        newState = {
          ...savedDataObject,
          activeFormUuid: action.activeFormUuid,
          forms: {
            ...savedDataObject.forms,
            // initialize this particular form if it hasn't been created already
            [action.activeFormUuid]: {
              ...initialFormState,
              ...savedDataObject.forms[action.activeFormUuid],
              // if we receive activePatientUuid from a query parameter use that one
              ...newPatient,
              patientUuids: [
                ...(savedDataObject.forms[action.activeFormUuid]
                  ?.patientUuids || initialFormState.patientUuids),
                action.newPatientUuid || null,
              ],
            },
          },
        };
      } else {
        // no localStorage data, or we should void it
        newState = {
          ...initialWorkflowState,
          _storageVersion: fdeWorkflowStorageVersion,
          forms: {
            [action.activeFormUuid]: initialFormState,
          },
          activeFormUuid: action.activeFormUuid,
        };
      }
      persistData(newState);
      return { ...newState };
    }
    case "ADD_PATIENT": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            patientUuids: [
              ...state.forms[state.activeFormUuid].patientUuids,
              action.patientUuid,
            ],
            activePatientUuid: action.patientUuid,
            activeEncounterUuid: null,
            workflowState: "EDIT_FORM",
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "OPEN_PATIENT_SEARCH": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            activePatientUuid: null,
            activeEncounterUuid: null,
            workflowState: "NEW_PATIENT",
          },
        },
      };
      // the persist here is optional...
      persistData(newState);
      return newState;
    }
    case "SAVE_ENCOUNTER": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            encounters: {
              ...state.forms[state.activeFormUuid].encounters,
              [state.forms[state.activeFormUuid].activePatientUuid]:
                action.encounterUuid,
            },
            activePatientUuid: null,
            activeEncounterUuid: null,
            workflowState:
              state.forms[state.activeFormUuid].workflowState ===
              "SUBMIT_FOR_NEXT"
                ? "NEW_PATIENT"
                : state.forms[state.activeFormUuid].workflowState ===
                  "SUBMIT_FOR_REVIEW"
                ? "REVIEW"
                : state.forms[state.activeFormUuid].workflowState,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "EDIT_ENCOUNTER": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            activeEncounterUuid:
              state.forms[state.activeFormUuid].encounters[action.patientUuid],
            activePatientUuid: action.patientUuid,
            workflowState: "EDIT_FORM",
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "SUBMIT_FOR_NEXT":
      // this state should not be persisted
      window.dispatchEvent(
        new CustomEvent("ampath-form-action", {
          detail: {
            formUuid: state.activeFormUuid,
            patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
            action: "onSubmit",
          },
        })
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: "SUBMIT_FOR_NEXT",
          },
        },
      };
    case "SUBMIT_FOR_REVIEW":
      // this state should not be persisted
      window.dispatchEvent(
        new CustomEvent("ampath-form-action", {
          detail: {
            formUuid: state.activeFormUuid,
            patientUuid: state.forms[state.activeFormUuid].activePatientUuid,
            action: "onSubmit",
          },
        })
      );
      return {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            workflowState: "SUBMIT_FOR_REVIEW",
          },
        },
      };
    case "GO_TO_REVIEW": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            activeEncounterUuid: null,
            activePatientUuid: null,
            workflowState: "REVIEW",
          },
        },
      };
      persistData(newState);
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
