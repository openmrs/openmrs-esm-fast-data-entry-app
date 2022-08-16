import { useConfig } from "@openmrs/esm-framework";
import { Tab, Tabs, TabList, TabPanels, TabPanel } from "@carbon/react";
import React from "react";
import { Config } from "../config-schema";
import { useGetAllForms } from "../hooks";
import FormsTable from "./forms-table";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import {
  fdeWorkflowStorageName,
  fdeWorkflowStorageVersion,
} from "../context/FormWorkflowReducer";
import {
  fdeGroupWorkflowStorageName,
  fdeGroupWorkflowStorageVersion,
} from "../context/GroupFormWorkflowReducer";

// helper function useful for debugging
// given a list of forms, it will organize into permissions
// and list which forms are associated with that permission
export const getFormPermissions = (forms) => {
  const output = {};
  forms?.forEach(
    (form) =>
      (output[form.encounterType.editPrivilege.display] = [
        ...(output[form.encounterType.editPrivilege.display] || []),
        form.display,
      ])
  );
  return output;
};

// Function adds `id` field to rows so they will be accepted by DataTable
// "display" is prefered for display name if present, otherwise fall back on "name'"
const prepareRowsForTable = (rawFormData) => {
  if (rawFormData) {
    return rawFormData?.map((form) => ({
      ...form,
      id: form.uuid,
      display: form.display || form.name,
    }));
  }
  return null;
};

const FormsPage = () => {
  const config = useConfig() as Config;
  const { t } = useTranslation();
  const { formCategories, formCategoriesToShow } = config;
  const { forms, isLoading, error } = useGetAllForms();
  const cleanRows = prepareRowsForTable(forms);
  const savedFormsData = localStorage.getItem(fdeWorkflowStorageName);
  const savedGroupFormsData = localStorage.getItem(fdeGroupWorkflowStorageName);
  const activeForms = [];
  const activeGroupForms = [];
  if (
    savedFormsData &&
    JSON.parse(savedFormsData)?.["_storageVersion"] ===
      fdeWorkflowStorageVersion
  ) {
    Object.entries(JSON.parse(savedFormsData).forms).forEach(
      ([formUuid, form]: [string, { [key: string]: unknown }]) => {
        if (form.workflowState) activeForms.push(formUuid);
      }
    );
  }
  if (
    savedGroupFormsData &&
    JSON.parse(savedGroupFormsData)?.["_storageVersion"] ===
      fdeGroupWorkflowStorageVersion
  ) {
    Object.entries(JSON.parse(savedGroupFormsData).forms).forEach(
      ([formUuid, form]: [string, { [key: string]: unknown }]) => {
        if (form.workflowState) activeGroupForms.push(formUuid);
      }
    );
  }

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
    <div className={styles.mainContent}>
      <h3 className={styles.pageTitle}>{t("forms", "Forms")}</h3>
      <Tabs>
        <TabList>
          <Tab label={t("allForms", "All Forms")}>
            {`${t("allForms", "All Forms")} (${
              cleanRows ? cleanRows?.length : "??"
            })`}
          </Tab>
          {categoryRows?.map((category, index) => (
            <Tab label={category.name} key={index}>
              {`${category.name} (${category.rows.length})`}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormsTable
              rows={cleanRows}
              {...{ error, isLoading, activeForms, activeGroupForms }}
            />
          </TabPanel>
          {categoryRows?.map((category, index) => (
            <TabPanel key={index}>
              <FormsTable
                rows={category.rows}
                {...{ error, isLoading, activeForms, activeGroupForms }}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default FormsPage;
