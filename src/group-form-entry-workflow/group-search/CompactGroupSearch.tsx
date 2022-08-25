import React, { useCallback, useState } from "react";
import PatientSearch from "./patient-search.component";
import PatientSearchBar from "../patient-search-bar/patient-search-bar.component";
import styles from "./compact-patient-search.scss";

interface CompactGroupSearchProps {
  isSearchPage: boolean;
  initialSearchTerm: string;
  selectPatientAction?: (patientUuid: string) => undefined;
  shouldNavigateToPatientSearchPage?: boolean;
}

const CompactGroupSearch: React.FC<CompactGroupSearchProps> = ({
  selectPatientAction,
  initialSearchTerm,
  isSearchPage,
}) => {
  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={initialSearchTerm ?? ""}
        onChange={setSearchTerm}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {!!searchTerm && !isSearchPage && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch
            query={searchTerm}
            selectPatientAction={selectPatientAction}
          />
        </div>
      )}
    </div>
  );
};

export default CompactGroupSearch;
