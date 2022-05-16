import { openmrsFetch } from "@openmrs/esm-framework";
import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import useSWR from "swr";
import FormsTable from "./FormsTable";

export const customFormRepresentation =
  "(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))";

export const formEncounterUrl = `/ws/rest/v1/form?v=custom:${customFormRepresentation}`;
export const formEncounterUrlPoc = `/ws/rest/v1/form?v=custom:${customFormRepresentation}&q=poc`;

export function useFormEncounters(cachedOfflineFormsOnly = false) {
  const showHtmlFormEntryForms = true;
  const url = showHtmlFormEntryForms ? formEncounterUrl : formEncounterUrlPoc;

  return useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch(url);
    // show published forms and hide component forms
    const forms =
      res.data?.results?.filter(
        (form) => form.published && !/component/i.test(form.name)
      ) ?? [];

    return forms;
  });
}

const FormsRoot = ({ match }) => {
  const { tab } = match?.params;

  const { data: forms } = useFormEncounters();

  console.log("forms", forms);
  return (
    <div style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Forms</h3>
      <Tabs type="container">
        <Tab label="All Forms">
          <FormsTable />
        </Tab>
        <Tab label="ICRC Forms">
          <FormsTable />
        </Tab>
        <Tab label="Distress Scales">
          <FormsTable />
        </Tab>
        <Tab label="Functioning Scales">
          <FormsTable />
        </Tab>
        <Tab label="Coping Scales">
          <FormsTable />
        </Tab>
      </Tabs>
    </div>
  );
};

export default FormsRoot;
export { FormsRoot };
