import React, { useMemo, useReducer } from "react";
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
  formState: null,
  addPatient: (uuid: string | number) => {},
  openPatientSearch: () => {},
  saveEncounter: (encounterUuid: string | number) => {},
  editEncounter: (patientUuid: string | number) => {},
};

const FormWorkflowContext = React.createContext(initialState);

const FormWorkflowProvider = ({ children }) => {
  const { formUuid } = useParams() as ParamTypes;
  const [state, dispatch] = useReducer(reducer, { ...initialState, formUuid });

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
      editEncounter: (patientUuid) =>
        dispatch({ type: "EDIT_ENCOUNTER", patientUuid }),
    }),
    []
  );

  return (
    <FormWorkflowContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FormWorkflowContext.Provider>
  );
};

export default FormWorkflowContext;
export { FormWorkflowProvider };
