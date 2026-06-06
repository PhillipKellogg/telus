'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { StreamingText } from './StreamingText';
import type { AIInsightBullet } from '@/types/ai';
import type { Interaction } from '@/types/customer';
import { cn } from '@/lib/utils';

interface AIInsightPanelProps {
  summary: AIInsightBullet[] | null;
  isLoading: boolean;
  isStreaming: boolean;
  interactions: Interaction[];
  onVerifySource: (interactionId: string) => void;
  highlightedIds: string[];
}

const LABEL_COLORS: Record<string, string> = {
  Sentiment: 'bg-blue-100 text-blue-700',
  Friction: 'bg-red-100 text-red-700',
  'Recent Win': 'bg-emerald-100 text-emerald-700',
};

export function AIInsightPanel({
  summary,
  isLoading,
  isStreaming,
  interactions,
  onVerifySource,
  highlightedIds,
}: AIInsightPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn(
            'w-2 h-2 rounded-full inline-block',
            isStreaming ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500',
          )}
        />
        {isStreaming ? 'AI is analyzing...' : 'AI analysis complete'}
      </div>

      {summary.map((bullet) => (
        <div key={bullet.label} className="space-y-1">
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] px-2 py-0.5',
              LABEL_COLORS[bullet.label] ?? 'bg-gray-100 text-gray-700',
            )}
          >
            {bullet.label}
          </Badge>
          <p className="text-xs leading-relaxed">
            <StreamingText text={bullet.content} isStreaming={isStreaming && !bullet.content} />
          </p>
          {bullet.evidenceIds.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {bullet.evidenceIds.slice(0, 3).map((evidenceId) => {
                const interaction = interactions[parseInt(evidenceId, 10)];
                if (!interaction) {
                  return null;
                }
                const isActive = highlightedIds.includes(interaction.id);
                return (
                  <Tooltip key={evidenceId}>
                    <TooltipTrigger
                      onClick={() => onVerifySource(interaction.id)}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer',
                        isActive
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-muted/60 border-border hover:bg-muted text-muted-foreground hover:text-foreground',
                      )}
                    >
                      ↗ Verify source
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-56 text-xs">
                      {interaction.subject}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
