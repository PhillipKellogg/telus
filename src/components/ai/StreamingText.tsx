'use client';

import { useEffect, useRef, useState } from 'react';

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!isStreaming) {
      return undefined;
    }
    intervalRef.current = setInterval(() => setShowCursor((v) => !v), 530);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  return (
    <span className={className}>
      {text}
      {isStreaming && (
        <span
          className="inline-block w-0.5 h-3.5 ml-0.5 bg-current align-middle"
          style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
        />
      )}
    </span>
  );
}
