import { navigate } from "@openmrs/esm-framework";
import { initialWorkflowState } from "./FormWorkflowContext";

export const fdeGroupWorkflowStorageVersion = "1.0.4";
export const fdeGroupWorkflowStorageName =
  "openmrs:fastDataEntryGroupWorkflowState";
const persistData = (data) => {
  localStorage.setItem(fdeGroupWorkflowStorageName, JSON.stringify(data));
};

const initialFormState = {
  workflowState: "NEW_GROUP_SESSION",
  activePatientUuid: null,
  activeEncounterUuid: null,
  patientUuids: [],
  encounters: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_WORKFLOW_STATE": {
      const savedData = localStorage.getItem(fdeGroupWorkflowStorageName);
      const savedDataObject = savedData ? JSON.parse(savedData) : {};
      let newState: { [key: string]: unknown } = {};
      const newForm = {
        workflowState: initialFormState.workflowState,
      };
      // this logic isn't complete yet

      if (
        savedData &&
        savedDataObject["_storageVersion"] === fdeGroupWorkflowStorageVersion
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
              ...newForm,
              patientUuids:
                savedDataObject.forms[action.activeFormUuid]?.patientUuids ||
                initialFormState.patientUuids,
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
        };
      }
      persistData(newState);
      return { ...newState };
    }
    case "SET_GROUP": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            groupUuid: action.group.id,
            groupName: action.group.name,
            patientUuids: action.group.members,
            activePatientUuid: null,
            activeEncounterUuid: null,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "START_FORMS": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            activePatientUuid:
              state.forms[state.activeFormUuid].members[0].uuid,
            activeEncounterUuid:
              state.forms[state.activeFormUuid].encounters[
                state.forms[state.activeFormUuid].members[0].uuid
              ] || null,
            workflowState: "EDIT_FORM",
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "SAVE_ENCOUNTER": {
      if (
        state.forms[state.activeFormUuid].workflowState ===
        "SUBMIT_FOR_COMPLETE"
      ) {
        const { [state.activeFormUuid]: activeForm, ...formRest } = state.forms;
        const newState = {
          ...state,
          forms: formRest,
          activeFormUuid: null,
        };
        persistData(newState);
        // eslint-disable-next-line
        navigate({ to: "${openmrsSpaBase}/forms" });
        return newState;
      } else {
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
    case "SUBMIT_FOR_COMPLETE":
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
            workflowState: "SUBMIT_FOR_COMPLETE",
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
    case "DESTROY_SESSION": {
      const { [state.activeFormUuid]: activeForm, ...formRest } = state.forms;
      const newState = {
        ...state,
        forms: formRest,
        activeFormUuid: null,
      };
      persistData(newState);
      return newState;
    }
    case "CLOSE_SESSION": {
      const newState = {
        ...state,
        activeFormUuid: null,
      };
      persistData(newState);
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
