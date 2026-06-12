'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Interaction } from '@/types/customer';
import { cn } from '@/lib/utils';

interface InteractionTimelineProps {
  interactions: Interaction[];
  highlightedIds: string[];
  onOpenTranscript: (interaction: Interaction) => void;
}

const TYPE_STYLES: Record<Interaction['type'], { dot: string; badge: string; label: string }> = {
  crm: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'CRM' },
  billing: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Billing' },
  support: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Support' },
  marketing: { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', label: 'Marketing' },
};

const SENTIMENT_STYLES: Record<Interaction['sentiment'], string> = {
  positive: 'text-emerald-600',
  neutral: 'text-gray-400',
  negative: 'text-red-500',
};

const SENTIMENT_ICONS: Record<Interaction['sentiment'], string> = {
  positive: '↑',
  neutral: '–',
  negative: '↓',
};

type TypeFilter = 'all' | Interaction['type'];

const TYPE_FILTER_LABELS: Record<TypeFilter, string> = {
  all: 'All',
  crm: 'CRM',
  billing: 'Billing',
  support: 'Support',
  marketing: 'Mktg',
};

export function InteractionTimeline({
  interactions,
  highlightedIds,
  onOpenTranscript,
}: InteractionTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const typeCounts = (Object.keys(TYPE_FILTER_LABELS) as TypeFilter[]).reduce<
    Record<TypeFilter, number>
  >(
    (acc, key) => {
      acc[key] =
        key === 'all' ? interactions.length : interactions.filter((i) => i.type === key).length;
      return acc;
    },
    { all: 0, crm: 0, billing: 0, support: 0, marketing: 0 },
  );

  const visible =
    typeFilter === 'all' ? interactions : interactions.filter((i) => i.type === typeFilter);

  return (
    <div className="space-y-1">
      {/* Type filter strip */}
      <div className="flex gap-1 pb-2 flex-wrap">
        {(Object.keys(TYPE_FILTER_LABELS) as TypeFilter[]).map((key) => {
          const count = typeCounts[key];
          if (key !== 'all' && count === 0) {
            return null;
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTypeFilter(key)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                typeFilter === key
                  ? cn(
                      'border-current font-medium',
                      TYPE_STYLES[key as Interaction['type']]?.badge ??
                        'bg-foreground text-background border-foreground',
                    )
                  : 'border-border text-muted-foreground hover:text-foreground bg-background',
              )}
            >
              {TYPE_FILTER_LABELS[key]} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative space-y-1">
        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />

        {visible.map((interaction) => {
          const styles = TYPE_STYLES[interaction.type];
          const isExpanded = expandedIds.has(interaction.id);
          const isHighlighted = highlightedIds.includes(interaction.id);

          return (
            <div
              key={interaction.id}
              id={`interaction-${interaction.id}`}
              className={cn(
                'relative pl-7 transition-all duration-200',
                isHighlighted && 'bg-blue-50/60 -mx-2 px-9 py-1 rounded-lg ring-1 ring-blue-200',
              )}
            >
              <span
                className={cn(
                  'absolute left-1.5 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-background',
                  styles.dot,
                )}
              />

              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleExpand(interaction.id)}
              >
                <div className="flex items-start justify-between gap-1 pt-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={cn('text-[9px] px-1.5 py-0 h-4', styles.badge)}
                      >
                        {styles.label}
                      </Badge>
                      <span
                        className={cn(
                          'text-[11px] font-bold',
                          SENTIMENT_STYLES[interaction.sentiment],
                        )}
                      >
                        {SENTIMENT_ICONS[interaction.sentiment]}
                      </span>
                      <span className="text-xs font-medium truncate">{interaction.subject}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{interaction.date}</p>
                  </div>
                  <span className="shrink-0 text-muted-foreground mt-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
              </button>

              <div
                className={cn(
                  'grid transition-all duration-200',
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="pt-1.5 pb-2 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {interaction.summary}
                    </p>
                    {interaction.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {interaction.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenTranscript(interaction)}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Read full transcript
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
