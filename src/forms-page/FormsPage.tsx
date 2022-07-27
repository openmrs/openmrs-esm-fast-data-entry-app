import { useConfig } from "@openmrs/esm-framework";
import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import { Config } from "../config-schema";
import { useGetAllForms } from "../hooks";
import FormsTable from "../forms-table";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";

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
      <Tabs type="container">
        <Tab
          label={`${t("allForms", "All Forms")} (${
            cleanRows ? cleanRows?.length : "??"
          })`}
        >
          <FormsTable rows={cleanRows} {...{ error, isLoading }} />
        </Tab>
        {categoryRows?.map((category, index) => (
          <Tab label={`${category.name} (${category.rows.length})`} key={index}>
            <FormsTable rows={category.rows} {...{ error, isLoading }} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default FormsPage;
