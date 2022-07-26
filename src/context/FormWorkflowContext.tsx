import React, { useEffect, useMemo, useReducer } from "react";
import reducer from "./FormWorkflowReducer";
import { useParams } from "react-router-dom";
interface ParamTypes {
  formUuid: string;
}

const initialState = {
  formUuid: null,
  patientUuids: [],
  activePatientUuid: null,
  activeEncounterUuid: null,
  encounters: {},
  workflowState: null,
  addPatient: (uuid: string | number) => {},
  openPatientSearch: () => {},
  saveEncounter: (encounterUuid: string | number) => {},
  editEncounter: (patientUuid: string | number) => {},
  submitForNext: () => {},
  submitForReview: () => {},
  goToReview: () => {},
};

const FormWorkflowContext = React.createContext(initialState);

const FormWorkflowProvider = ({ children }) => {
  const { formUuid: paramFormUuid } = useParams() as ParamTypes;
  const [state, dispatch] = useReducer(reducer, { ...initialState });

  const actions = useMemo(
    () => ({
      addPatient: (patientUuid) =>
        dispatch({ type: "ADD_PATIENT", patientUuid }),
      openPatientSearch: () => dispatch({ type: "OPEN_PATIENT_SEARCH" }),
      saveEncounter: (encounterUuid) =>
        dispatch({
          type: "SAVE_ENCOUNTER",
          encounterUuid,
        }),
      submitForNext: () => dispatch({ type: "SUBMIT_FOR_NEXT" }),
      submitForReview: () => dispatch({ type: "SUBMIT_FOR_REVIEW" }),
      editEncounter: (patientUuid) =>
        dispatch({ type: "EDIT_ENCOUNTER", patientUuid }),
      goToReview: () => dispatch({ type: "GO_TO_REVIEW" }),
    }),
    []
  );

  // if formUuid isn't a part of state yet, grab it from the url params
  useEffect(() => {
    if (!state.formUuid && paramFormUuid) {
      dispatch({ type: "UPDATE_FORM_UUID", formUuid: paramFormUuid });
    }
  }, [paramFormUuid, state.formUuid]);

  useEffect(() => {
    actions.openPatientSearch();
  }, [actions]);

  return (
    <FormWorkflowContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FormWorkflowContext.Provider>
  );
};

export default FormWorkflowContext;
export { FormWorkflowProvider };
