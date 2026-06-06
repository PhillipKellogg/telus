'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';
import type { Customer } from '@/types/customer';
import { cn } from '@/lib/utils';

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

function HealthIndicator({ score }: { score: number }) {
  if (score >= 70) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (score >= 45) return <Minus className="w-4 h-4 text-amber-500" />;
  return <TrendingDown className="w-4 h-4 text-red-500" />;
}

export default function HomePage() {
  const [query, setQuery] = useState('');

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.company.toLowerCase().includes(query.toLowerCase()),
  );

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
            Select a customer account to open the AI-powered 360° view
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or company..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border bg-background shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-3">
          {filtered.map((customer) => (
            <Link key={customer.id} href={`/customer/${customer.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/60">
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

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No customers match &quot;{query}&quot;
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Showing {filtered.length} of {MOCK_CUSTOMERS.length} accounts · Demo data
        </p>
      </div>
    </div>
  );
}
