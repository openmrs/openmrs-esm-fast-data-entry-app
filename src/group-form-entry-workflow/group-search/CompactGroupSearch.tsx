import React, { useState } from "react";
import { GroupType } from "../../context/GroupFormWorkflowContext";
import styles from "./compact-group-search.scss";
import GroupSearch from "./GroupSearch";
import { Button, Search } from "@carbon/react";
import { useTranslation } from "react-i18next";
import debounce from "lodash-es/debounce";

interface CompactGroupSearchProps {
  selectGroupAction?: (group: GroupType) => void;
}

const CompactGroupSearch: React.FC<CompactGroupSearchProps> = ({
  selectGroupAction,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [dropdownShown, setDropdownShown] = useState(false);

  const onGroupSelect = (group) => {
    selectGroupAction(group);
    setDropdownShown(false);
    setQuery("");
  };

  const handleSearchChange = (e) => {
    debounce((q) => {
      setDropdownShown(!!e.length);
      setQuery(q);
    }, 300);
    setQuery(e);
    if (e.length) {
      setDropdownShown(true);
    } else {
      setDropdownShown(false);
    }
  };

  return (
    <div className={styles.patientSearchBar}>
      <div className={styles.searchArea}>
        <Search
          autoFocus
          className={styles.patientSearchInput}
          closeButtonLabelText={t("clearSearch", "Clear")}
          labelText=""
          onChange={(event) => {
            handleSearchChange(event.target.value);
          }}
          onClear={() => undefined}
          placeholder={t("searchForGroup", "Search for a group by name")}
          size="sm"
          value={query}
        />
        <Button kind="secondary" size="sm">
          {t("search", "Search")}
        </Button>
      </div>
      {dropdownShown && (
        <div className={styles.floatingSearchResultsContainer}>
          <GroupSearch query={query} selectGroupAction={onGroupSelect} />
        </div>
      )}
    </div>
  );
};

export default CompactGroupSearch;
