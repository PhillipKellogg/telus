'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp,
  Shuffle,
  Shield,
  RefreshCw,
  ArrowUpCircle,
  Zap,
  Package,
  Users,
  ThumbsUp,
  ThumbsDown,
  X,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { NextBestAction, FeedbackReason } from '@/types/ai';
import { cn } from '@/lib/utils';

interface NextBestActionCardProps {
  action: NextBestAction;
  customerId: string;
  rank: number;
  highlightedIds: string[];
  onHighlightEvidence: (ids: string[]) => void;
  onDismiss: (id: string, reason: FeedbackReason) => void;
  onFeedback: (id: string, positive: boolean) => void;
  onGenerateDraft: (type: 'call-script' | 'email', context: string) => void;
}

const NBA_CONFIG: Record<
  NextBestAction['variant'],
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  upsell: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    label: 'Upsell',
  },
  'cross-sell': {
    icon: Shuffle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    label: 'Cross-sell',
  },
  retention: {
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Retention',
  },
  'win-back': {
    icon: RefreshCw,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    label: 'Win-back',
  },
  'service-upgrade': {
    icon: ArrowUpCircle,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    label: 'Upgrade',
  },
  reactivation: {
    icon: Zap,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    label: 'Reactivate',
  },
  bundle: {
    icon: Package,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    label: 'Bundle',
  },
  referral: {
    icon: Users,
    color: 'text-pink-600',
    bg: 'bg-pink-50 border-pink-200',
    label: 'Referral',
  },
};

const DISMISS_REASONS: { value: FeedbackReason; label: string }[] = [
  { value: 'already-sold', label: 'Already sold this' },
  { value: 'wrong-timing', label: 'Wrong timing' },
  { value: 'customer-declined', label: 'Customer declined' },
  { value: 'not-eligible', label: 'Not eligible' },
  { value: 'other', label: 'Other' },
];

export function NextBestActionCard({
  action,
  customerId: _customerId,
  rank,
  highlightedIds,
  onHighlightEvidence,
  onDismiss,
  onFeedback,
  onGenerateDraft,
}: NextBestActionCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [dismissOpen, setDismissOpen] = useState(false);

  const config = NBA_CONFIG[action.variant];
  const Icon = config.icon;
  const isHighlighted = action.evidenceIds.some((id) => highlightedIds.includes(id));

  function handleAccept() {
    setAccepted(true);
    onFeedback(action.id, true);
    toast.success('Logged to CRM', {
      description: `"${action.title}" added to activity queue`,
      duration: 3000,
    });
  }

  function handleDismiss(reason: FeedbackReason) {
    setDismissed(true);
    setDismissOpen(false);
    onDismiss(action.id, reason);
    toast.info('Suggestion dismissed', {
      description: 'Feedback recorded — helps improve future recommendations',
      duration: 2500,
    });
  }

  function handleFeedback(positive: boolean) {
    setFeedbackGiven(positive);
    onFeedback(action.id, positive);
    if (positive) {
      toast.success('Positive signal sent', {
        description: 'Model will surface similar actions more often',
        duration: 2000,
      });
    }
  }

  if (accepted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 animate-in fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>
          <span className="font-medium">{action.title}</span> — logged to CRM activity queue
        </span>
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground border border-dashed animate-in fade-in">
        <X className="w-3 h-3" />
        Suggestion dismissed — thanks for the feedback
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 border',
        config.bg,
        isHighlighted && 'ring-2 ring-offset-1 ring-blue-400',
        feedbackGiven === true && 'ring-2 ring-offset-1 ring-emerald-400',
      )}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <span className={cn('p-1 rounded-md block', config.bg)}>
                <Icon className={cn('w-4 h-4', config.color)} />
              </span>
              <span
                className={cn(
                  'absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white',
                  rank === 1 ? 'bg-slate-700' : rank === 2 ? 'bg-slate-500' : 'bg-slate-400',
                )}
              >
                {rank}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{action.title}</p>
              <Badge
                variant="outline"
                className={cn('text-[10px] mt-0.5 px-1.5 py-0', config.color)}
              >
                {config.label}
              </Badge>
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleFeedback(true)}
              className={cn(
                'p-1.5 rounded-md hover:bg-white/60 transition-colors',
                feedbackGiven === true && 'text-emerald-600 bg-white/80',
              )}
              title="Good suggestion"
              aria-label="Mark as good suggestion"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <Popover open={dismissOpen} onOpenChange={setDismissOpen}>
              <PopoverTrigger
                onClick={() => {
                  handleFeedback(false);
                }}
                className="p-1.5 rounded-md hover:bg-white/60 transition-colors"
                title="Not relevant"
                aria-label="Dismiss suggestion"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <p className="text-xs font-medium mb-1.5">Why isn&apos;t this relevant?</p>
                <div className="space-y-0.5">
                  {DISMISS_REASONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleDismiss(r.value)}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2.5">
        <p className="text-xs text-muted-foreground">{action.description}</p>

        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>AI confidence</span>
            <span className="font-medium">{action.confidence}%</span>
          </div>
          <Progress value={action.confidence} className="h-1.5" />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Why this action
          </p>
          <ul className="space-y-0.5">
            {action.reasoning.map((reason, i) => (
              <li key={i} className="text-xs flex gap-1.5">
                <span className={cn('mt-0.5 shrink-0', config.color)}>›</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {action.evidenceIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2 w-full justify-start font-normal text-muted-foreground hover:text-foreground"
            onClick={() => onHighlightEvidence(isHighlighted ? [] : action.evidenceIds)}
          >
            {isHighlighted
              ? '↩ Clear evidence highlight'
              : `↗ Show ${action.evidenceIds.length} supporting interaction${action.evidenceIds.length > 1 ? 's' : ''}`}
          </Button>
        )}

        <div className="pt-1.5 border-t border-black/5 space-y-1.5">
          {/* Draft action buttons */}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 gap-1 flex-1"
              onClick={() => onGenerateDraft('call-script', action.title)}
            >
              <Phone className="w-3 h-3" />
              Call script
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 gap-1 flex-1"
              onClick={() => onGenerateDraft('email', action.title)}
            >
              <Mail className="w-3 h-3" />
              Draft email
            </Button>
          </div>
          {/* Value + accept row */}
          <div className="flex items-center justify-between gap-2">
            {action.estimatedValue > 0 ? (
              <div>
                <span className="text-[10px] text-muted-foreground">Est. value </span>
                <span className={cn('text-xs font-semibold', config.color)}>
                  +${action.estimatedValue.toLocaleString()}/mo
                </span>
              </div>
            ) : (
              <span />
            )}
            <Button size="sm" className="h-6 text-[10px] px-2.5 gap-1" onClick={handleAccept}>
              <CheckCircle2 className="w-3 h-3" />
              Accept & Log
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
