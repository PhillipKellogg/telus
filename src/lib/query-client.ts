'use client';

import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/query-persist-client-core';

export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 min — treat data as fresh
export const CACHE_GC_TIME = 24 * 60 * 60 * 1000; // 24 h — keep in localStorage

let browserQueryClient: QueryClient | undefined;
let persisted = false;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_STALE_TIME,
        gcTime: CACHE_GC_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  // Wire up localStorage persistence once
  if (!persisted) {
    persisted = true;
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'sales-cockpit-cache',
    });
    persistQueryClient({
      queryClient: browserQueryClient,
      persister,
      maxAge: CACHE_GC_TIME,
      buster: 'v1',
    });
  }

  return browserQueryClient;
}
