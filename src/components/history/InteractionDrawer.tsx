'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { Interaction } from '@/types/customer';
import { cn } from '@/lib/utils';

interface InteractionDrawerProps {
  interaction: Interaction | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<Interaction['type'], string> = {
  crm: 'CRM',
  billing: 'Billing',
  support: 'Support',
  marketing: 'Marketing',
};

const SENTIMENT_LABELS: Record<Interaction['sentiment'], { label: string; color: string }> = {
  positive: { label: 'Positive', color: 'text-emerald-600' },
  neutral: { label: 'Neutral', color: 'text-gray-500' },
  negative: { label: 'Negative', color: 'text-red-600' },
};

export function InteractionDrawer({ interaction, onClose }: InteractionDrawerProps) {
  if (!interaction) {
    return null;
  }

  const sentiment = SENTIMENT_LABELS[interaction.sentiment];

  return (
    <Sheet open={!!interaction} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {TYPE_LABELS[interaction.type]}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', sentiment.color)}>
              {sentiment.label} sentiment
            </Badge>
          </div>
          <SheetTitle className="text-base leading-snug">{interaction.subject}</SheetTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{interaction.date}</span>
            {interaction.agent && (
              <>
                <span>·</span>
                <span>{interaction.agent}</span>
              </>
            )}
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Summary
            </p>
            <p className="text-sm leading-relaxed">{interaction.summary}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Full Transcript
            </p>
            <div className="bg-muted/40 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap border">
              {interaction.fullTranscript}
            </div>
          </div>

          {interaction.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Tags
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {interaction.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
