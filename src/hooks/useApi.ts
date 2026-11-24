'use client';

import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import { handleDemoApi } from '@/lib/demoFallback';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export function useApi() {
  const sessionToken = useStore((s) => s.sessionToken);

  const api = useCallback(
    async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
      const { method = 'GET', body, params } = options;

      if (IS_STATIC) {
        return handleDemoApi<T>(
          endpoint,
          method,
          body as Record<string, unknown> | undefined,
          params
        );
      }

      let url = `/api/${endpoint}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.set(key, String(value));
          }
        });
        const qs = searchParams.toString();
        if (qs) url += `?${qs}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      try {
        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (res.status === 404) {
          return handleDemoApi<T>(
            endpoint,
            method,
            body as Record<string, unknown> | undefined,
            params
          );
        }

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: 'Network error' }));
          throw new Error(error.message || `API error: ${res.status}`);
        }

        return res.json();
      } catch (err) {
        if (err instanceof TypeError) {
          return handleDemoApi<T>(
            endpoint,
            method,
            body as Record<string, unknown> | undefined,
            params
          );
        }
        throw err;
      }
    },
    [sessionToken]
  );

  return { api };
}
