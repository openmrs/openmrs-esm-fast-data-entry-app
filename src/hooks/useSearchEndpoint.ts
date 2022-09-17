import { openmrsFetch, FetchResponse } from "@openmrs/esm-framework";
import { useCallback, useMemo } from "react";
import useSWRInfinite from "swr/infinite";

export interface SearchResponse {
  data: Array<Record<string, unknown>> | null;
  isLoading: boolean;
  error: Error;
  loadingNewData: boolean;
  hasMore: boolean;
  currentPage: number;
  totalResults: number;
  setPage: (size: number | ((_size: number) => number)) => Promise<
    FetchResponse<{
      results: Array<Record<string, unknown>>;
      links: Array<{
        rel: "prev" | "next";
      }>;
    }>[]
  >;
}

interface SearchInfiniteProps {
  baseUrl?: string;
  searchTerm: string;
  parameters?: Record<string, unknown> | undefined;
  searching: boolean;
  resultsToFetch?: number;
}

const useSearchEndpointInfinite = (
  arg0: SearchInfiniteProps
): SearchResponse => {
  const {
    baseUrl,
    searchTerm,
    parameters,
    searching = true,
    resultsToFetch = 10,
  } = arg0;

  const getUrl = useCallback(
    (
      page: number,
      prevPageData: FetchResponse<{
        results: Array<Record<string, unknown>>;
        links: Array<{ rel: "prev" | "next" }>;
      }>
    ) => {
      if (
        prevPageData &&
        !prevPageData?.data?.links.some((link) => link.rel === "next")
      ) {
        return null;
      }
      let url = `${baseUrl}?q=${searchTerm}`;
      const params = {
        // merge passed parameters and default parameters
        // this way the defaults can be overriden if needed
        totalCount: true,
        limit: resultsToFetch,
        ...parameters,
      };
      Object.entries(params).forEach(([key, value]) => {
        // don't send null parmeters
        if (value !== null && value !== undefined) {
          url += `&${key}=${value}`;
        }
      });
      if (page) {
        url += `&startIndex=${page * resultsToFetch}`;
      }
      return url;
    },
    [baseUrl, searchTerm, parameters, resultsToFetch]
  );

  const { data, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<{
      results: Array<Record<string, unknown>>;
      links: Array<{ rel: "prev" | "next" }>;
      totalCount: number;
    }>,
    Error
  >(searching ? getUrl : null, openmrsFetch);

  const results = useMemo(
    () => ({
      data: data
        ? [].concat(...(data?.map((resp) => resp?.data?.results) ?? []))
        : null,
      isLoading: !data && !error,
      error,
      hasMore: data?.length
        ? !!data[data.length - 1].data?.links?.some(
            (link) => link.rel === "next"
          )
        : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount,
    }),
    [data, isValidating, error, setSize, size]
  );

  return results;
};

const useSearchCohortInfinite = ({
  ...props
}: SearchInfiniteProps): SearchResponse => {
  return useSearchEndpointInfinite({
    baseUrl: "/ws/rest/v1/cohortm/cohort",
    resultsToFetch: 10,
    ...props,
  });
};

export { useSearchEndpointInfinite, useSearchCohortInfinite };
