import React from "react";
import { ExtensionSlot } from "@openmrs/esm-framework";

const FormEntry = ({
  formUuid,
  patientUuid,
  visitId,
  visitTypeUuid,
  encounterUuid,
}) => {
  return (
    <div>
      {formUuid && patientUuid && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            view: "form",
            formUuid,
            visitUuid: visitId,
            visitTypeUuid,
            patientUuid,
            patient: { patientUuid: patientUuid },
            encounterUuid,
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
