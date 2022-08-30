import { mockGroupData } from "./mock-group-data";

export function useGroupSearch(filter) {
  const searchHistory = mockGroupData || [];
  // if (filter.length <= 2) return [];

  return filter
    ? searchHistory?.filter(
        (item) =>
          item?.description?.toLowerCase()?.includes(filter?.toLowerCase()) ||
          item?.name?.toLowerCase()?.includes(filter?.toLowerCase())
      )
    : searchHistory;
}
