import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Layer, Tile, Loading } from "@carbon/react";
import styles from "./group-search.scss";
import { EmptyDataIllustration } from "../../empty-state/EmptyDataIllustration";
import CompactGroupResults, {
  SearchResultSkeleton,
} from "./CompactGroupResults";
import { GroupType } from "../../context/GroupFormWorkflowContext";
import { useSearchCohortInfinite } from "../../hooks/useSearchEndpoint";

interface GroupSearchProps {
  query: string;
  selectGroupAction?: (group: GroupType) => void;
}

const GroupSearch: React.FC<GroupSearchProps> = ({
  query = "",
  selectGroupAction,
}) => {
  const { t } = useTranslation();
  const {
    isLoading,
    data: results,
    error,
    loadingNewData,
    setPage,
    hasMore,
    totalResults,
  } = useSearchCohortInfinite({
    searchTerm: query,
    searching: !!query,
    parameters: {
      v: "full",
    },
  });

  console.log("results", results);

  const lastItem = useRef(null);
  const observer = useRef(null);
  const loadingRef = useCallback(
    (node) => {
      if (loadingNewData) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((page) => page + 1);
          }
        },
        {
          threshold: 0.75,
        }
      );
      if (node) {
        observer.current.observe(node);
      }
    },
    [loadingNewData, hasMore, setPage]
  );

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

  if (isLoading) {
    return (
      <div className={styles.searchResultsContainer}>
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  if (results?.length === 0) {
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
          {totalResults} {t("searchResultsText", "search result(s)")}
        </p>
        <CompactGroupResults
          groups={results}
          selectGroupAction={selectGroupAction}
          lastRef={lastItem}
        />
        <div ref={lastItem}>
          <div className={styles.lastItem} ref={loadingRef}>
            {hasMore && <Loading withOverlay={false} small />}
            {!hasMore && <p>{t("noMoreResults", "End of search results")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSearch;
