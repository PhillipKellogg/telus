'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Customer } from '@/types/customer';

interface RevenueWaterfallProps {
  customer: Customer;
}

const CATEGORY_COLORS: Record<string, { active: string; available: string }> = {
  Internet: { active: '#3b82f6', available: '#bfdbfe' },
  Voice: { active: '#8b5cf6', available: '#ddd6fe' },
  Network: { active: '#10b981', available: '#a7f3d0' },
  Cloud: { active: '#f59e0b', available: '#fde68a' },
  Security: { active: '#ef4444', available: '#fecaca' },
};

export function RevenueWaterfall({ customer }: RevenueWaterfallProps) {
  const [ready, setReady] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, [customer.id]);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    let frame: number;
    const start = performance.now();
    const duration = 700;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const animate = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setAnimProgress(ease(p));
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  const categories = ['Internet', 'Voice', 'Network', 'Cloud', 'Security'];

  const data = categories
    .map((cat) => {
      const active = customer.services
        .filter((s) => s.category === cat && s.status === 'active')
        .reduce((sum, s) => sum + s.monthlyValue, 0);
      const available = customer.services
        .filter((s) => s.category === cat && s.status === 'available')
        .reduce((sum, s) => sum + s.monthlyValue, 0);
      return { cat, active, available };
    })
    .filter((d) => d.active > 0 || d.available > 0);

  const maxVal = Math.max(...data.map((d) => d.active + d.available), 1);
  const totalActive = data.reduce((s, d) => s + d.active, 0);
  const totalAvailable = data.reduce((s, d) => s + d.available, 0);

  if (!ready) {
    return <Skeleton className="h-28 w-full rounded-lg" />;
  }

  const BAR_H = 16;
  const GAP = 6;
  const W = 260;
  const LABEL_W = 52;
  const BAR_W = W - LABEL_W - 36;
  const svgH = data.length * (BAR_H + GAP);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">MRR by category</span>
        <span className="text-[10px]">
          <span className="font-semibold text-foreground">${totalActive.toLocaleString()}</span>
          {totalAvailable > 0 && (
            <span className="text-blue-500 ml-1">
              +${totalAvailable.toLocaleString()} opportunity
            </span>
          )}
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} className="overflow-visible">
        {data.map((d, i) => {
          const y = i * (BAR_H + GAP);
          const colors = CATEGORY_COLORS[d.cat] ?? { active: '#6b7280', available: '#d1d5db' };
          const activeW = (d.active / maxVal) * BAR_W * animProgress;
          const availW = (d.available / maxVal) * BAR_W * animProgress;

          return (
            <g key={d.cat}>
              <text x={0} y={y + BAR_H - 3} fontSize="9" fill="#9ca3af">
                {d.cat}
              </text>
              {/* Active bar */}
              <rect x={LABEL_W} y={y} width={activeW} height={BAR_H} fill={colors.active} rx="2" />
              {/* Available bar stacked */}
              {d.available > 0 && (
                <rect
                  x={LABEL_W + activeW}
                  y={y}
                  width={availW}
                  height={BAR_H}
                  fill={colors.available}
                  rx="2"
                />
              )}
              {/* Value label */}
              {animProgress > 0.7 && d.active > 0 && (
                <text
                  x={LABEL_W + activeW + availW + 4}
                  y={y + BAR_H - 3}
                  fontSize="9"
                  fill="#6b7280"
                >
                  ${(d.active + d.available).toLocaleString()}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
          Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-200 inline-block" />
          Available
        </span>
      </div>
    </div>
  );
}
