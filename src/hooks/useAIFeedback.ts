'use client';

import { useState, useCallback } from 'react';
import type { FeedbackPayload, FeedbackReason } from '@/types/ai';

export function useAIFeedback(customerId: string) {
  const [givenFeedback, setGivenFeedback] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const submitFeedback = useCallback(
    (actionId: string, positive: boolean) => {
      setGivenFeedback((prev) => ({ ...prev, [actionId]: positive }));

      const payload: FeedbackPayload = { actionId, customerId, positive };
      fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    },
    [customerId],
  );

  const dismissAction = useCallback(
    (actionId: string, reason: FeedbackReason) => {
      setDismissed((prev) => new Set([...prev, actionId]));
      submitFeedback(actionId, false);

      const payload: FeedbackPayload & { reason: FeedbackReason } = {
        actionId,
        customerId,
        positive: false,
        reason,
      };
      fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    },
    [customerId, submitFeedback],
  );

  return { givenFeedback, dismissed, submitFeedback, dismissAction };
}
