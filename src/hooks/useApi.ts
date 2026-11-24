'use client';

import { useCallback } from 'react';
import { useStore } from '@/lib/store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

export function useApi() {
  const sessionToken = useStore((s) => s.sessionToken);

  const api = useCallback(
    async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
      const { method = 'GET', body, params } = options;

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

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `API error: ${res.status}`);
      }

      return res.json();
    },
    [sessionToken]
  );

  return { api };
}
