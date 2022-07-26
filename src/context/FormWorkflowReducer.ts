const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_PATIENT":
      return {
        ...state,
        patientUuids: [...state.patientUuids, action.patientUuid],
        activePatientUuid: action.patientUuid,
        activeEncounterUuid: null,
        workflowState: "EDIT_FORM",
      };
    case "OPEN_PATIENT_SEARCH":
      // this will need to be updated once AMPATH hook is available
      return {
        ...state,
        activePatientUuid: null,
        activeEncounterUuid: null,
        workflowState: "NEW_PATIENT",
      };
    case "SAVE_ENCOUNTER":
      return {
        ...state,
        encounters: {
          ...state.encounters,
          [state.activePatientUuid]: action.encounterUuid,
        },
        activePatientUuid: null,
        activeEncounterUuid: null,
        workflowState:
          state.workflowState === "SUBMIT_FOR_NEXT"
            ? "NEW_PATIENT"
            : state.workflowState === "SUBMIT_FOR_REVIEW"
            ? "REVIEW"
            : state.workflowState,
      };
    case "EDIT_ENCOUNTER":
      return {
        ...state,
        activeEncounterUuid: state.encounters[action.patientUuid],
        activePatientUuid: action.patientUuid,
        workflowState: "EDIT_FORM",
      };
    case "SUBMIT_FOR_NEXT":
      window.dispatchEvent(
        new CustomEvent("ampath-form-action", {
          detail: { formUuid: state.formUuid, action: "onSubmit" },
        })
      );
      return {
        ...state,
        workflowState: "SUBMIT_FOR_NEXT",
      };
    case "SUBMIT_FOR_REVIEW":
      window.dispatchEvent(
        new CustomEvent("ampath-form-action", {
          detail: { formUuid: state.formUuid, action: "onSubmit" },
        })
      );
      return {
        ...state,
        workflowState: "SUBMIT_FOR_REVIEW",
      };
    case "UPDATE_FORM_UUID":
      return {
        ...state,
        formUuid: action.formUuid,
      };
    case "GO_TO_REVIEW":
      return {
        ...state,
        activeEncounterUuid: null,
        activePatientUuid: null,
        workflowState: "REVIEW",
      };
    default:
      return state;
  }
};

export default reducer;
