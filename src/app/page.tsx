'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';
import { aiInsightsKey } from '@/hooks/useAIInsights';
import type { Customer } from '@/types/customer';
import { cn } from '@/lib/utils';

type SortKey = 'urgency' | 'health' | 'mrr';
type QuickFilter = 'all' | 'at-risk' | Customer['tier'];

const TIER_STYLES: Record<Customer['tier'], string> = {
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Silver: 'bg-gray-100 text-gray-700 border-gray-300',
  Bronze: 'bg-orange-100 text-orange-700 border-orange-300',
};

const BILLING_STYLES: Record<Customer['billingStatus'], string> = {
  Current: 'text-emerald-600',
  Overdue: 'text-amber-600',
  Collections: 'text-red-600',
  Suspended: 'text-red-700',
};

const BILLING_URGENCY: Record<Customer['billingStatus'], number> = {
  Collections: 4,
  Suspended: 3,
  Overdue: 2,
  Current: 1,
};

const URGENCY_BORDER: Record<Customer['billingStatus'], string> = {
  Collections: 'border-l-[3px] border-l-red-500',
  Suspended: 'border-l-[3px] border-l-red-400',
  Overdue: 'border-l-[3px] border-l-amber-500',
  Current: '',
};

function HealthIndicator({ score }: { score: number }) {
  if (score >= 70) {
    return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  }
  if (score >= 45) {
    return <Minus className="w-4 h-4 text-amber-500" />;
  }
  return <TrendingDown className="w-4 h-4 text-red-500" />;
}

const AT_RISK_COUNT = MOCK_CUSTOMERS.filter((c) => c.billingStatus !== 'Current').length;
const TIER_COUNTS: Record<Customer['tier'], number> = {
  Gold: MOCK_CUSTOMERS.filter((c) => c.tier === 'Gold').length,
  Silver: MOCK_CUSTOMERS.filter((c) => c.tier === 'Silver').length,
  Bronze: MOCK_CUSTOMERS.filter((c) => c.tier === 'Bronze').length,
};

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('urgency');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const queryClient = useQueryClient();

  const handlePrefetch = useCallback(
    (customerId: string) => {
      queryClient.prefetchQuery({
        queryKey: aiInsightsKey(customerId),
        queryFn: async () => {
          const res = await fetch('/api/ai/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId }),
          });
          const text = await res.text();
          return JSON.parse(text);
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient],
  );

  const searched = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.company.toLowerCase().includes(query.toLowerCase()),
  );

  const quickFiltered = searched.filter((c) => {
    if (quickFilter === 'all') {
      return true;
    }
    if (quickFilter === 'at-risk') {
      return c.billingStatus !== 'Current';
    }
    return c.tier === quickFilter;
  });

  const sorted = [...quickFiltered].sort((a, b) => {
    if (sort === 'urgency') {
      const urgencyDiff = BILLING_URGENCY[b.billingStatus] - BILLING_URGENCY[a.billingStatus];
      return urgencyDiff !== 0 ? urgencyDiff : a.healthScore - b.healthScore;
    }
    if (sort === 'health') {
      return a.healthScore - b.healthScore;
    }
    if (sort === 'mrr') {
      return b.monthlyRevenue - a.monthlyRevenue;
    }
    return 0;
  });

  const QUICK_FILTERS: { key: QuickFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: MOCK_CUSTOMERS.length },
    { key: 'at-risk', label: '⚠ At Risk', count: AT_RISK_COUNT },
    { key: 'Gold', label: 'Gold', count: TIER_COUNTS.Gold },
    { key: 'Silver', label: 'Silver', count: TIER_COUNTS.Silver },
    { key: 'Bronze', label: 'Bronze', count: TIER_COUNTS.Bronze },
  ];

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'urgency', label: 'Urgency' },
    { key: 'health', label: 'Health ↑' },
    { key: 'mrr', label: 'MRR ↓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Business 360</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Cockpit</h1>
          <p className="text-muted-foreground">
            Select a customer account to open the AI-powered view.
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or company..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border bg-background shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filter + sort controls */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_FILTERS.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setQuickFilter(key)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition-colors',
                  quickFilter === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground',
                )}
              >
                {label}{' '}
                <span className={cn(quickFilter === key ? 'opacity-70' : 'opacity-50')}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <span className="text-xs text-muted-foreground mr-1.5">Sort:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  'text-xs px-2 py-0.5 rounded transition-colors',
                  sort === key
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {sorted.map((customer) => (
            <Link
              key={customer.id}
              href={`/customer/${customer.id}`}
              onMouseEnter={() => handlePrefetch(customer.id)}
              onFocus={() => handlePrefetch(customer.id)}
            >
              <Card
                className={cn(
                  'hover:shadow-md transition-shadow cursor-pointer border-border/60 overflow-hidden',
                  URGENCY_BORDER[customer.billingStatus],
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 text-white"
                        style={{
                          background:
                            customer.healthScore >= 70
                              ? '#10b981'
                              : customer.healthScore >= 45
                                ? '#f59e0b'
                                : '#ef4444',
                        }}
                      >
                        {customer.healthScore}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{customer.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 h-4',
                              TIER_STYLES[customer.tier],
                            )}
                          >
                            {customer.tier}
                          </Badge>
                          {customer.billingStatus !== 'Current' && (
                            <span className="flex items-center gap-0.5 text-[10px] text-red-600">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {customer.billingStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{customer.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium">
                          ${customer.monthlyRevenue.toLocaleString()}/mo
                        </p>
                        <p className={cn('text-xs', BILLING_STYLES[customer.billingStatus])}>
                          {customer.billingStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <HealthIndicator score={customer.healthScore} />
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {customer.location.city}, {customer.location.state}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {query ? `No customers match "${query}"` : 'No customers in this filter'}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Showing {sorted.length} of {MOCK_CUSTOMERS.length} accounts · Demo data
        </p>
      </div>
    </div>
  );
}
