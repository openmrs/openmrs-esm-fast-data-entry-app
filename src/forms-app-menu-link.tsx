import React from "react";
import { useTranslation } from "react-i18next";
import { ConfigurableLink } from "@openmrs/esm-framework";

export default function OfflineToolsAppMenuLink() {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to="${openmrsSpaBase}/forms">
      {t("formsAppMenuLink", "Forms")}
    </ConfigurableLink>
  );
}
