import { useConfig } from "@openmrs/esm-framework";
import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import { Config } from "../config-schema";
import { useGetAllForms } from "../hooks";
import FormsTable from "../forms-table";
import styles from "./styles.scss";

const cleanForms = (rawFormData) => {
  if (rawFormData) {
    return rawFormData?.map((form) => ({
      ...form,
      id: form.uuid,
    }));
  }
  return null;
};

const FormsPage = () => {
  const config = useConfig() as Config;
  const { formCategories, formCategoriesToShow } = config;
  const { forms, isLoading, error } = useGetAllForms();
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
    <div className={styles.mainContent}>
      <h3 className={styles.pageTitle}>Forms</h3>
      <Tabs type="container">
        <Tab label="All Forms">
          <FormsTable rows={cleanRows} {...{ error, isLoading }} />
        </Tab>
        {categoryRows?.map((category, index) => (
          <Tab label={category.name} key={index}>
            <FormsTable rows={category.rows} {...{ error, isLoading }} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default FormsPage;
