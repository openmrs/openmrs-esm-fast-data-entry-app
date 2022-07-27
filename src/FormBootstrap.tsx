import React from "react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import useGetPatient from "./hooks/useGetPatient";

export interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  orderNumber: number;
  display: string;
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  auditInfo: {
    dateVoided: string;
  };
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: unknown;
  obsDatetime: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  orders: Array<Order>;
}
interface FormParams {
  formUuid: string;
  patientUuid: string;
  visitUuid?: string;
  visitTypeUuid?: string;
  encounterUuid?: string;
  showDiscardSubmitButtons?: boolean;
  handlePostResponse?: (Encounter) => void;
}

const FormBootstrap = ({
  formUuid,
  patientUuid,
  visitUuid,
  visitTypeUuid,
  encounterUuid,
  handlePostResponse,
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
            closeWorkspace: () => undefined,
            handlePostResponse,
            showDiscardSubmitButtons: false,
          }}
        />
      )}
    </div>
  );
};

export default FormBootstrap;
