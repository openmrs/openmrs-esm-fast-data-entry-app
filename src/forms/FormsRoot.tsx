import { openmrsFetch, useConfig } from "@openmrs/esm-framework";
import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import { from } from "rxjs";
import useSWR from "swr";
import { Config } from "../config-schema";
import FormsTable from "./FormsTable";
import { tableData } from "./mockData";

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

const cleanForms = (rawFormData) => {
  if (rawFormData) {
    return rawFormData?.map((form) => ({
      ...form,
      id: form.uuid,
    }));
  }
};

const FormsRoot = ({ match }) => {
  const { tab } = match?.params;
  const config = useConfig() as Config;
  const { formCategories, formCategoriesToShow } = config;
  const { data: forms } = useFormEncounters();
  const { rows: mockRows } = tableData;
  const cleanRows = cleanForms(forms);

  const categoryRows = formCategoriesToShow.map((name) => {
    const category = formCategories.find((category) => category.name === name);
    let rows = [];
    if (category && cleanRows && cleanRows.length) {
      const uuids = category.forms?.map((form) => form.formUUID);
      rows = cleanRows.filter((row) => uuids.includes(row.uuid));
    }
    return { ...{ name, rows } };
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Forms</h3>
      <Tabs type="container">
        <Tab label="All Forms">
          <FormsTable rows={cleanRows} />
        </Tab>
        {categoryRows?.map((category) => (
          <Tab label={category.name}>
            <FormsTable rows={category.rows} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default FormsRoot;
export { FormsRoot };
