import React from "react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import useGetPatient from "./forms/useGetPatient";
interface FormParams {
  formUuid: string;
  patientUuid: string;
  visitUuid?: string;
  visitTypeUuid?: string;
  encounterUuid?: string;
}

const FormEntry = ({
  formUuid,
  patientUuid,
  visitUuid,
  visitTypeUuid,
  encounterUuid,
}: FormParams) => {
  const patient = useGetPatient(patientUuid);

  return (
    <div>
      {formUuid && patientUuid && patient && (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            view: "form",
            formUuid,
            visitUuid: visitUuid ?? "",
            visitTypeUuid: visitTypeUuid ?? "",
            patientUuid,
            patient,
            encounterUuid: encounterUuid ?? "",
            closeWorkspace: () => {},
          }}
        />
      )}
    </div>
  );
};

export default FormEntry;
