'use client';

import { TrendingUp, Shield, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Three plausible placeholder variants shown while AI loads
const GHOST_VARIANTS = [
  {
    icon: Shield,
    color: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Retention',
    barW: 'w-[82%]',
    barColor: 'bg-amber-300',
  },
  {
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200',
    label: 'Upsell',
    barW: 'w-[68%]',
    barColor: 'bg-emerald-300',
  },
  {
    icon: Shuffle,
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200',
    label: 'Cross-sell',
    barW: 'w-[54%]',
    barColor: 'bg-blue-300',
  },
] as const;

const SHIMMER = 'animate-pulse bg-current rounded opacity-10';

interface NBAGhostCardProps {
  index: number;
  /** When true, cross-fade the ghost out */
  fading?: boolean;
}

export function NBAGhostCard({ index, fading }: NBAGhostCardProps) {
  const v = GHOST_VARIANTS[index % GHOST_VARIANTS.length];
  const Icon = v.icon;

  return (
    <Card
      className={cn('border transition-all duration-500', v.bg, fading && 'opacity-0 scale-[0.98]')}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('p-1 rounded-md', v.bg)}>
              <Icon className={cn('w-4 h-4', v.color)} />
            </span>
            <div className="space-y-1.5">
              {/* Title shimmer */}
              <div className={cn(SHIMMER, v.color, 'h-3.5 w-32')} />
              {/* Badge shimmer */}
              <div className={cn(SHIMMER, v.color, 'h-3 w-14 rounded-full')} />
            </div>
          </div>
          {/* Thumb icons shimmer */}
          <div className="flex gap-1 shrink-0">
            <div className={cn(SHIMMER, v.color, 'w-6 h-6 rounded-md')} />
            <div className={cn(SHIMMER, v.color, 'w-6 h-6 rounded-md')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2.5">
        {/* Description shimmer */}
        <div className="space-y-1">
          <div className={cn(SHIMMER, v.color, 'h-2.5 w-full')} />
          <div className={cn(SHIMMER, v.color, 'h-2.5 w-3/4')} />
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between mb-1">
            <div className={cn(SHIMMER, v.color, 'h-2 w-20')} />
            <div className={cn(SHIMMER, v.color, 'h-2 w-8')} />
          </div>
          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full animate-pulse', v.barColor, v.barW)} />
          </div>
        </div>

        {/* Reasoning bullets */}
        <div className="space-y-1">
          <div className={cn(SHIMMER, v.color, 'h-2 w-24 mb-1')} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5">
              <span className={cn(v.color, 'opacity-20 text-xs mt-0.5')}>›</span>
              <div
                className={cn(
                  SHIMMER,
                  v.color,
                  'h-2 rounded',
                  i === 0 ? 'w-full' : i === 1 ? 'w-5/6' : 'w-4/6',
                )}
              />
            </div>
          ))}
        </div>

        {/* Footer buttons */}
        <div className="pt-1.5 border-t border-black/5 space-y-1.5">
          <div className="flex gap-1.5">
            <div className={cn(SHIMMER, v.color, 'h-6 flex-1 rounded-md')} />
            <div className={cn(SHIMMER, v.color, 'h-6 flex-1 rounded-md')} />
          </div>
          <div className="flex justify-between items-center">
            <div className={cn(SHIMMER, v.color, 'h-3 w-20')} />
            <div className={cn(SHIMMER, v.color, 'h-6 w-20 rounded-md')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
