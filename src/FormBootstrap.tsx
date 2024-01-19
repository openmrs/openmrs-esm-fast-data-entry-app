import React, { useContext, useEffect, useState } from "react";
import { detach, ExtensionSlot } from "@openmrs/esm-framework";
import useGetPatient from "./hooks/useGetPatient";
import GroupFormWorkflowContext from "./context/GroupFormWorkflowContext";

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

type PreFilledQuestions = {
  [key: string]: string;
};
interface FormParams {
  formUuid: string;
  patientUuid: string;
  visitUuid?: string;
  visitTypeUuid?: string;
  encounterUuid?: string;
  preFilledQuestions?: PreFilledQuestions;
  showDiscardSubmitButtons?: boolean;
  handlePostResponse?: (Encounter) => void;
  handleEncounterCreate?: (Object) => void;
  handleOnValidate?: (boolean) => void;
}

const FormBootstrap = ({
  formUuid,
  patientUuid,
  visitUuid,
  visitTypeUuid,
  encounterUuid,
  handlePostResponse,
  handleEncounterCreate,
  handleOnValidate,
}: FormParams) => {
  const patient = useGetPatient(patientUuid);

  useEffect(() => {
    return () => detach("form-widget-slot", "form-widget-slot");
  });

  // FIXME This should not be necessary
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (patientUuid && formUuid && patient) {
      setShowForm(false);
      setTimeout(() => {
        setShowForm(true);
      });
    }
  }, [patientUuid, formUuid, patient]);

  const { activeSessionMeta } = useContext(GroupFormWorkflowContext);
  return (
    <div>
      {showForm && formUuid && patientUuid && patient && (
        <ExtensionSlot
          name="form-widget-slot"
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
            handleEncounterCreate,
            handleOnValidate,
            showDiscardSubmitButtons: false,
            preFilledQuestions: { ...activeSessionMeta },
          }}
        />
      )}
    </div>
  );
};

export default FormBootstrap;
