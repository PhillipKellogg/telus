'use client';

import { useState, useCallback } from 'react';

type DraftType = 'call-script' | 'email';

export function useAIDraft() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DraftType>('call-script');

  const generate = useCallback(
    async (customerId: string, draftType: DraftType, context: string) => {
      setType(draftType);
      setIsOpen(true);
      setText('');
      setIsStreaming(true);

      try {
        const res = await fetch('/api/ai/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId, type: draftType, context }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          accumulated += decoder.decode(value, { stream: true });
          setText(accumulated);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setText('');
  }, []);

  return { text, isStreaming, isOpen, type, generate, close };
}
