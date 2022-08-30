import React, { useState } from "react";
import styles from "./compact-group-search.scss";
import GroupSearch from "./GroupSearch";
import GroupSearchBar from "./GroupSearchBar";

interface CompactGroupSearchProps {
  selectGroupAction?: (patientUuids: [string]) => undefined;
}

const CompactGroupSearch: React.FC<CompactGroupSearchProps> = ({
  selectGroupAction,
}) => {
  const [query, setQuery] = useState("");
  const [dropdownShown, setDropdownShown] = useState(false);

  const onGroupSelect = (uuids: [string]) => {
    selectGroupAction(uuids);
    setDropdownShown(false);
    setQuery("");
  };

  return (
    <div className={styles.patientSearchBar}>
      <GroupSearchBar
        small
        onChange={(e) => {
          setQuery(e);
          if (e.length) {
            setDropdownShown(true);
          } else {
            setDropdownShown(false);
          }
        }}
        value={query}
        onSubmit={() => undefined}
        onClear={() => undefined}
      />
      {dropdownShown && (
        <div className={styles.floatingSearchResultsContainer}>
          <GroupSearch query={query} selectGroupAction={onGroupSelect} />
        </div>
      )}
    </div>
  );
};

export default CompactGroupSearch;
