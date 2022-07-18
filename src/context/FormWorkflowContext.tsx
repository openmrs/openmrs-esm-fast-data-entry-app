import React, { useReducer } from "react";
import reducer from "./FormWorkflowReducer";

const initialState = {
  patientUuids: [],
  activePatientUuid: null,
  activeEncounterUuid: null,
  encounters: {},
  addPatient: (uuid: string | number) => {},
  openPatientSearch: () => {},
  saveEncounter: (encounterUuid: string | number) => {},
  editEncounter: (patientUuid: string | number) => {},
};

const FormWorkflowContext = React.createContext(initialState);

const FormWorkflowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    addPatient: (patientUuid) =>
      dispatch({ type: "ADD_PATIENT", patientUuid: patientUuid }),
    openPatientSearch: () => dispatch({ type: "OPEN_PATIENT_SEARCH" }),
    saveEncounter: (encounterUuid) =>
      dispatch({
        type: "SAVE_ENCOUNTER",
        encounterUuid,
      }),
    editEncounter: (patientUuid) =>
      dispatch({ type: "EDIT_ENCOUNTER", patientUuid }),
  };
  return (
    <FormWorkflowContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FormWorkflowContext.Provider>
  );
};

export default FormWorkflowContext;
export { FormWorkflowProvider };
