'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { ServiceabilityRings } from '@/components/customer/ServiceabilityRings';
import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { NextBestActionCard } from '@/components/ai/NextBestActionCard';
import { NBAGhostCard } from '@/components/ai/NBAGhostCard';
import { AIDraftPanel } from '@/components/ai/AIDraftPanel';
import { AIChat } from '@/components/ai/AIChat';
import { InteractionTimeline } from '@/components/history/InteractionTimeline';
import { InteractionDrawer } from '@/components/history/InteractionDrawer';
import { HealthSparkline } from '@/components/charts/HealthSparkline';
import { RevenueWaterfall } from '@/components/charts/RevenueWaterfall';
import { useCustomer } from '@/hooks/useCustomer';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { useAIDraft } from '@/hooks/useAIDraft';
import type { Interaction } from '@/types/customer';
import type { FeedbackReason } from '@/types/ai';

interface CockpitPageProps {
  params: Promise<{ id: string }>;
}

export default function CockpitPage({ params }: CockpitPageProps) {
  const { id } = use(params);
  const { data: customer, isLoading: customerLoading } = useCustomer(id);
  const insights = useAIInsights(id);
  const { submitFeedback, dismissAction } = useAIFeedback(id);
  const draft = useAIDraft();

  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [activeDrawer, setActiveDrawer] = useState<Interaction | null>(null);

  const handleVerifySource = useCallback((interactionId: string) => {
    setHighlightedIds((prev) => {
      const next = prev.includes(interactionId)
        ? prev.filter((id) => id !== interactionId)
        : [...prev, interactionId];
      return next;
    });
    const el = document.getElementById(`interaction-${interactionId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleHighlightEvidence = useCallback((ids: string[]) => {
    setHighlightedIds(ids);
    if (ids.length > 0) {
      const el = document.getElementById(`interaction-${ids[0]}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleDismiss = useCallback(
    (actionId: string, reason: FeedbackReason) => {
      dismissAction(actionId, reason);
    },
    [dismissAction],
  );

  if (customerLoading) {
    return (
      <div className="min-h-screen p-4 space-y-4 max-w-[1600px] mx-auto">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-[280px_1fr_320px] gap-4">
          <div className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-full w-full min-h-[600px]" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Customer not found</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            ← Back to accounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1600px] mx-auto px-3 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <CustomerHeader customer={customer} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-3 items-start">
          {/* LEFT — Profile + Serviceability */}
          <div className="sticky top-3 space-y-3">
            <Card>
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Service Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ServiceabilityRings customer={customer} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2 text-xs">
                {[
                  ['Email', customer.email],
                  ['Phone', customer.phone],
                  ['Last Contact', customer.lastContactDate],
                  ['Account Mgr', customer.accountManager],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-medium text-right truncate">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Health Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <HealthSparkline customer={customer} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <RevenueWaterfall customer={customer} />
              </CardContent>
            </Card>
          </div>

          {/* CENTER — AI Command Center */}
          <div className="space-y-3 min-w-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <CardTitle className="text-sm font-semibold">AI Account Insights</CardTitle>
                    {insights.isStreaming && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-400 font-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                        syncing
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground"
                    onClick={() => insights.refetch()}
                    disabled={insights.isLoading || insights.isStreaming}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${insights.isStreaming ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <AIInsightPanel
                  summary={insights.summary}
                  isLoading={insights.isLoading}
                  isStreaming={insights.isStreaming}
                  interactions={customer.interactions}
                  onVerifySource={handleVerifySource}
                  highlightedIds={highlightedIds}
                />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Next Best Actions
                </h2>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-2 relative">
                {/* Ghost cards — always rendered, fade out when real data arrives */}
                {(!insights.nextBestActions || insights.isLoading) && (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <NBAGhostCard key={i} index={i} />
                    ))}
                  </div>
                )}

                {/* Real cards — fade in over the ghosts */}
                {insights.nextBestActions && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    {insights.nextBestActions.map((action) => (
                      <NextBestActionCard
                        key={action.id}
                        action={action}
                        customerId={customer.id}
                        highlightedIds={highlightedIds}
                        onHighlightEvidence={handleHighlightEvidence}
                        onDismiss={handleDismiss}
                        onFeedback={submitFeedback}
                        onGenerateDraft={(type, context) =>
                          draft.generate(customer.id, type, context)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — History + Chat */}
          <div className="sticky top-3 space-y-3">
            <Card className="overflow-hidden">
              <Tabs defaultValue="history">
                <CardHeader className="py-2 px-3 pb-0">
                  <TabsList className="w-full h-8">
                    <TabsTrigger value="history" className="flex-1 text-xs gap-1.5">
                      Interactions ({customer.interactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex-1 text-xs gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      AI Chat
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="history" className="mt-0">
                  <CardContent className="px-3 pb-3 pt-2 h-[calc(100vh-200px)] overflow-y-auto">
                    <InteractionTimeline
                      interactions={customer.interactions}
                      highlightedIds={highlightedIds}
                      onOpenTranscript={setActiveDrawer}
                    />
                  </CardContent>
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <CardContent className="px-3 pb-3 pt-2 h-[calc(100vh-200px)] flex flex-col overflow-hidden">
                    <AIChat customerId={customer.id} />
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      <InteractionDrawer interaction={activeDrawer} onClose={() => setActiveDrawer(null)} />
      <AIDraftPanel
        isOpen={draft.isOpen}
        type={draft.type}
        text={draft.text}
        isStreaming={draft.isStreaming}
        onClose={draft.close}
      />
    </div>
  );
}
