const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_PATIENT":
      return {
        ...state,
        patientUuids: [...state.patientUuids, action.patientUuid],
        activePatientUuid: action.patientUuid,
        activeEncounterUuid: null,
      };
    case "OPEN_PATIENT_SEARCH":
      // this will need to be updated once AMPATH hook is available
      return {
        ...state,
        activePatientUuid: null,
        activeEncounterUuid: null,
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
      };
    case "EDIT_ENCOUNTER":
      return {
        ...state,
        activeEncounterUuid: state.encounters[action.patientUuid],
        activePatientUuid: action.patientUuid,
      };
    default:
      return state;
  }
};

export default reducer;
