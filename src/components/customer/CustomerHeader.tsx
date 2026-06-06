'use client';

import { Badge } from '@/components/ui/badge';
import type { Customer } from '@/types/customer';
import { cn } from '@/lib/utils';

interface CustomerHeaderProps {
  customer: Customer;
}

const TIER_STYLES: Record<Customer['tier'], string> = {
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Silver: 'bg-gray-100 text-gray-700 border-gray-300',
  Bronze: 'bg-orange-100 text-orange-700 border-orange-300',
};

const BILLING_STYLES: Record<Customer['billingStatus'], string> = {
  Current: 'bg-emerald-100 text-emerald-800',
  Overdue: 'bg-amber-100 text-amber-800',
  Collections: 'bg-red-100 text-red-800',
  Suspended: 'bg-red-200 text-red-900',
};

function HealthRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  const animId = `health-ring-${score}`;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <defs>
          <style>{`
            @keyframes ${animId} {
              from { stroke-dasharray: 0 ${circumference}; }
              to   { stroke-dasharray: ${filled} ${circumference}; }
            }
          `}</style>
        </defs>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ animation: `${animId} 0.9s cubic-bezier(0.4,0,0.2,1) both` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">health</span>
      </div>
    </div>
  );
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border flex-1 min-w-0">
      <HealthRing score={customer.healthScore} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-base sm:text-xl font-semibold truncate">{customer.name}</h1>
          <Badge variant="outline" className={cn('text-xs', TIER_STYLES[customer.tier])}>
            {customer.tier}
          </Badge>
          <Badge
            variant="secondary"
            className={cn('text-xs', BILLING_STYLES[customer.billingStatus])}
          >
            {customer.billingStatus}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{customer.company}</p>
        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
          <span>{customer.tenureYears}yr</span>
          <span>·</span>
          <span>${customer.monthlyRevenue.toLocaleString()}/mo</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{customer.accountManager}</span>
          <span>·</span>
          <span>
            {customer.location.city}, {customer.location.state}
          </span>
        </div>
      </div>
    </div>
  );
}
