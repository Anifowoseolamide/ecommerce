import { useEffect, useRef, useState } from 'react';

// Value that only updates after `delay` ms without changes (keeps search typing from firing a request per key)
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Loads one page of a server-paginated list.
// fetchPage({ ...params, page, pageSize }) must resolve to { items, pagination, counts }.
// Changing `params` (filter, search, sort) returns to page 1; stale responses are ignored.
export default function usePagedList(fetchPage, params, pageSize) {
  const paramsKey = JSON.stringify(params);
  const [paging, setPaging] = useState({ key: paramsKey, page: 1 });
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ items: [], pagination: null, counts: null, isLoading: true, error: '' });
  const latestRequest = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  // A page number only counts for the filters it was chosen under: new filters reset the stored page to 1,
  // so switching away and back never resurrects an old page (set during render, before any request fires)
  if (paging.key !== paramsKey) setPaging({ key: paramsKey, page: 1 });
  const page = paging.key === paramsKey ? paging.page : 1;
  const setPage = (next) => setPaging({ key: paramsKey, page: next });

  useEffect(() => {
    const requestId = ++latestRequest.current;
    setState((prev) => ({ ...prev, isLoading: true, error: '' }));

    fetchRef.current({ ...JSON.parse(paramsKey), page, pageSize })
      .then((result) => {
        if (requestId !== latestRequest.current) return;
        setState({ items: result.items, pagination: result.pagination, counts: result.counts, isLoading: false, error: '' });
        // The server returns the nearest valid page when ours no longer exists (e.g. after deleting the last item)
        if (result.pagination && result.pagination.page !== page) setPaging({ key: paramsKey, page: result.pagination.page });
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        setState((prev) => ({ ...prev, isLoading: false, error: err.message }));
      });
  }, [paramsKey, page, pageSize, reloadKey]);

  return {
    ...state,
    page,
    setPage,
    reload: () => setReloadKey((n) => n + 1),
  };
}
