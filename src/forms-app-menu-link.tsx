import React from "react";
import { useTranslation } from "react-i18next";
import { ConfigurableLink } from "@openmrs/esm-framework";

export default function FormsAppMenuLink() {
  const { t } = useTranslation();
  return (
    // eslint-disable-next-line
    <ConfigurableLink to="${openmrsSpaBase}/forms">
      {t("formsAppMenuLink", "Fast Data Entry")}
    </ConfigurableLink>
  );
}
