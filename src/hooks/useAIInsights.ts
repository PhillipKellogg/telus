'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AIInsightBullet, NextBestAction } from '@/types/ai';

export interface AIInsightsData {
  summary: AIInsightBullet[];
  nextBestActions: NextBestAction[];
}

function tryParsePartial(raw: string): Partial<AIInsightsData> {
  try {
    return JSON.parse(raw) as AIInsightsData;
  } catch {
    const summaryMatch = raw.match(/"summary"\s*:\s*(\[[\s\S]*?\](?=\s*,|\s*\}))/);
    if (summaryMatch) {
      try {
        return { summary: JSON.parse(summaryMatch[1]) as AIInsightBullet[] };
      } catch {
        /* keep trying */
      }
    }
    return {};
  }
}

export function aiInsightsKey(customerId: string) {
  return ['ai-insights', customerId] as const;
}

export function useAIInsights(customerId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<AIInsightsData>({
    queryKey: aiInsightsKey(customerId),
    queryFn: async () => {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch insights');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulated += decoder.decode(value, { stream: true });

        const partial = tryParsePartial(accumulated);
        if (partial.summary || partial.nextBestActions) {
          queryClient.setQueryData<Partial<AIInsightsData>>(aiInsightsKey(customerId), (old) => ({
            ...old,
            ...partial,
          }));
        }
      }

      return JSON.parse(accumulated) as AIInsightsData;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  return {
    summary: (query.data as AIInsightsData | undefined)?.summary ?? null,
    nextBestActions: (query.data as AIInsightsData | undefined)?.nextBestActions ?? null,
    isLoading: query.isLoading,
    isStreaming: query.isFetching && !query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
