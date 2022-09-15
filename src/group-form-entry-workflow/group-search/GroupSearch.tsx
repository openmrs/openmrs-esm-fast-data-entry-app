import React from "react";
import { useTranslation } from "react-i18next";
import { Layer, Tile } from "@carbon/react";
import styles from "./group-search.scss";
import { EmptyDataIllustration } from "../../empty-state/EmptyDataIllustration";
import { useGroupSearch } from "./useGroupSearch";
import CompactGroupResults, {
  SearchResultSkeleton,
} from "./CompactGroupResults";
import { GroupType } from "../../context/GroupFormWorkflowContext";

interface GroupSearchProps {
  query: string;
  selectGroupAction?: (group: GroupType) => void;
}

const GroupSearch: React.FC<GroupSearchProps> = ({
  query = "",
  selectGroupAction,
}) => {
  const { t } = useTranslation();
  const results = useGroupSearch(query);
  const error = false;

  if (error) {
    return (
      <div className={styles.searchResults}>
        <Layer>
          <Tile className={styles.emptySearchResultsTile}>
            <EmptyDataIllustration />
            <div>
              <p className={styles.errorMessage}>{t("error", "Error")}</p>
              <p className={styles.errorCopy}>
                {t(
                  "errorCopy",
                  "Sorry, there was an error. You can try to reload this page, or contact the site administrator and quote the error code above."
                )}
              </p>
            </div>
          </Tile>
        </Layer>
      </div>
    );
  }

  if (query.length <= 2) return <SearchResultSkeleton />;

  if (results.length === 0) {
    return (
      <div className={styles.searchResults}>
        <Layer>
          <Tile className={styles.emptySearchResultsTile}>
            <EmptyDataIllustration />
            <p className={styles.emptyResultText}>
              {t("noGroupsFoundMessage", "Sorry, no groups have been found")}
            </p>
            <p className={styles.actionText}>
              <span>
                {t(
                  "trySearchWithPatientUniqueID",
                  "Try searching with the cohort's description"
                )}
              </span>
              <br />
              <span>{t("orLabelName", "OR label name")}</span>
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsContainer}>
      <div
        className={styles.searchResults}
        style={{
          maxHeight: "22rem",
        }}
      >
        <p className={styles.resultsText}>
          {results.length} {t("searchResultsText", "search result(s)")}
        </p>
        <CompactGroupResults
          groups={results}
          selectGroupAction={selectGroupAction}
        />
      </div>
    </div>
  );
};

export default GroupSearch;
