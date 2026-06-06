'use client';

import { useState, useCallback } from 'react';
import type { AIInsightBullet, NextBestAction } from '@/types/ai';

interface AIInsightsState {
  summary: AIInsightBullet[] | null;
  nextBestActions: NextBestAction[] | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}

function tryParsePartial(
  raw: string,
): Partial<{ summary: AIInsightBullet[]; nextBestActions: NextBestAction[] }> {
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt to extract the summary array even if the JSON is incomplete
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

export function useAIInsights(customerId: string) {
  const [state, setState] = useState<AIInsightsState>({
    summary: null,
    nextBestActions: null,
    isLoading: false,
    isStreaming: false,
    error: null,
  });

  const fetchInsights = useCallback(async () => {
    setState({
      summary: null,
      nextBestActions: null,
      isLoading: true,
      isStreaming: false,
      error: null,
    });

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch insights');
      }

      setState((s) => ({ ...s, isLoading: false, isStreaming: true }));

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulated += decoder.decode(value, { stream: true });

        // Update state progressively as partial JSON becomes parseable
        const partial = tryParsePartial(accumulated);
        if (partial.summary) {
          setState((s) => ({ ...s, summary: partial.summary ?? null }));
        }
        if (partial.nextBestActions) {
          setState((s) => ({ ...s, nextBestActions: partial.nextBestActions ?? null }));
        }
      }

      // Final parse to ensure complete data
      const final = JSON.parse(accumulated) as {
        summary: AIInsightBullet[];
        nextBestActions: NextBestAction[];
      };
      setState({
        summary: final.summary,
        nextBestActions: final.nextBestActions,
        isLoading: false,
        isStreaming: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false, isStreaming: false, error: String(err) }));
    }
  }, [customerId]);

  return { ...state, fetchInsights };
}
