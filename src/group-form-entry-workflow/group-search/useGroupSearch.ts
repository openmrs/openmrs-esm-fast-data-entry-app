export function useGroupSearch(filter) {
  const searchHistory =
    JSON.parse(window.sessionStorage.getItem("openmrsHistory")) || [];
  return filter
    ? searchHistory.filter((item) => filter in item.description)
    : searchHistory;
}
