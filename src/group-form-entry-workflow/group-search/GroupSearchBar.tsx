import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Search } from "@carbon/react";
import styles from "./group-search-bar.scss";

interface PatientSearchBarProps {
  initialSearchTerm?: string;
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
  small?: boolean;
  value: string;
}

const GroupSearchBar: React.FC<PatientSearchBarProps> = ({
  onChange,
  onClear,
  small,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <form className={styles.searchArea}>
      <Search
        autoFocus
        className={styles.patientSearchInput}
        closeButtonLabelText={t("clearSearch", "Clear")}
        labelText=""
        onChange={(event) => onChange(event.target.value)}
        onClear={onClear}
        onSubmit={() => undefined}
        placeholder={t("searchForGroup", "Search for a group by name")}
        size={small ? "sm" : "lg"}
        value={value}
      />
      <Button type="submit" kind="secondary" size={small ? "sm" : "lg"}>
        {t("search", "Search")}
      </Button>
    </form>
  );
};

export default GroupSearchBar;
