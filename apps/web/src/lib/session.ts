import { apiRoutes, type Me } from '@socioboard/contracts';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api, ApiError } from './api';

/** The signed-in user, or null when signed out (a 401 is an answer, not an error). */
export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: async ({ signal }): Promise<Me | null> => {
    try {
      return await api(apiRoutes.auth.getMe, { signal });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },
});

export const authOptionsQuery = queryOptions({
  queryKey: ['auth-options'],
  queryFn: ({ signal }) => api(apiRoutes.auth.getAuthOptions, { signal }),
  staleTime: Infinity,
});

export function useMe() {
  return useQuery(meQuery);
}
