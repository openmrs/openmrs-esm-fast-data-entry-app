import { navigate } from "@openmrs/esm-framework";
import { initialWorkflowState } from "./FormWorkflowContext";

export const fdeGroupWorkflowStorageVersion = "1.0.5";
export const fdeGroupWorkflowStorageName =
  "openmrs:fastDataEntryGroupWorkflowState";
const persistData = (data) => {
  localStorage.setItem(fdeGroupWorkflowStorageName, JSON.stringify(data));
};

const initialFormState = {
  workflowState: "NEW_GROUP_SESSION",
  groupUuid: null,
  groupName: null,
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
      if (
        savedData &&
        savedDataObject["_storageVersion"] === fdeGroupWorkflowStorageVersion
      ) {
        // there is localStorage data and it is still valid
        const thisSavedForm = savedDataObject.forms?.[action.activeFormUuid];
        // set active patient to the last one we were on
        const activePatientUuid =
          thisSavedForm?.activePatientUuid ||
          // or set it to the first member in the list
          thisSavedForm?.patientUuids?.[0] ||
          // something probably went wrong...
          null;
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
              activeEncounterUuid:
                thisSavedForm?.encounters?.[activePatientUuid] || null,
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
      return newState;
    }

    case "SET_GROUP": {
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
              action.group.cohortMembers?.map(
                (member) => member?.patient?.uuid
              ) ?? [],
            activePatientUuid: null,
            activeEncounterUuid: null,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "UNSET_GROUP": {
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            groupUuid: null,
            groupName: null,
            patientUuids: [],
            activePatientUuid: null,
            activeEncounterUuid: null,
          },
        },
      };
      persistData(newState);
      return newState;
    }
    case "SET_SESSION_META": {
      // requires that group is already entered and contains patientUuids
      const newState = {
        ...state,
        forms: {
          ...state.forms,
          [state.activeFormUuid]: {
            ...state.forms[state.activeFormUuid],
            sessionMeta: action.meta,
            activePatientUuid:
              state.forms[state.activeFormUuid].patientUuids?.[0],
            activeEncounterUuid:
              state.forms[state.activeFormUuid].encounters[
                state.forms[state.activeFormUuid].patientUuids?.[0]
              ] || null,
            workflowState: "EDIT_FORM",
          },
        },
      };
      persistData(newState);
      return newState;
    }

    case "SAVE_ENCOUNTER": {
      const thisForm = state.forms[state.activeFormUuid];
      if (thisForm.workflowState === "SUBMIT_FOR_COMPLETE") {
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
      } else if (thisForm.workflowState === "SUBMIT_FOR_NEXT") {
        const nextPatientUuid =
          thisForm.patientUuids[
            Math.min(
              thisForm.patientUuids.indexOf(thisForm.activePatientUuid) + 1,
              thisForm.patientUuids.length - 1
            )
          ];
        const newState = {
          ...state,
          forms: {
            ...state.forms,
            [state.activeFormUuid]: {
              ...thisForm,
              encounters: {
                ...thisForm.encounters,
                [thisForm.activePatientUuid]: action.encounterUuid,
              },
              activePatientUuid: nextPatientUuid,
              activeEncounterUuid: thisForm.encounters[nextPatientUuid] || null,
              workflowState: "EDIT_FORM",
            },
          },
        };
        persistData(newState);
        return newState;
      } else return state;
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
