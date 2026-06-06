'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Customer } from '@/types/customer';

interface HealthSparklineProps {
  customer: Customer;
}

// Deterministically generate plausible monthly health history from current score
function generateHistory(customerId: string, currentScore: number): number[] {
  const seed = customerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => (((Math.sin(seed + i) * 10000) % 1) + 1) / 2;

  const months = 12;
  const points: number[] = [];
  let val = Math.max(20, Math.min(95, currentScore + (rng(99) - 0.5) * 30));

  for (let i = 0; i < months; i++) {
    val = Math.max(15, Math.min(98, val + (rng(i) - 0.48) * 14));
    points.push(Math.round(val));
  }
  points[months - 1] = currentScore;
  return points;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function HealthSparkline({ customer }: HealthSparklineProps) {
  const [ready, setReady] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const data = generateHistory(customer.id, customer.healthScore);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const W = 280;
  const H = 64;
  const pad = { x: 4, y: 6 };

  const points = data.map((v, i) => ({
    x: pad.x + (i / (data.length - 1)) * (W - pad.x * 2),
    y: H - pad.y - ((v - min) / range) * (H - pad.y * 2),
    v,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  const trend = data[data.length - 1] - data[0];
  const trendColor = trend > 5 ? '#10b981' : trend < -5 ? '#ef4444' : '#f59e0b';
  const currentScore = data[data.length - 1];
  const scoreColor = currentScore >= 70 ? '#10b981' : currentScore >= 45 ? '#f59e0b' : '#ef4444';

  // Optimistic: show skeleton briefly, then animate in
  useEffect(() => {
    const t1 = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t1);
  }, [customer.id]);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    let frame: number;
    const start = performance.now();
    const duration = 800;
    const animate = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setAnimProgress(p < 1 ? p : 1);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  const currentMonth = new Date().getMonth();
  const monthLabels = Array.from(
    { length: 12 },
    (_, i) => MONTH_LABELS[(currentMonth - 11 + i + 12) % 12],
  );

  if (!ready) {
    return <Skeleton className="h-20 w-full rounded-lg" />;
  }

  // Clip the drawn path to animProgress fraction of the width
  const clipWidth = animProgress * W;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground">Health trend (12 mo)</span>
        <span className="font-semibold" style={{ color: trendColor }}>
          {trend > 0 ? `+${trend}` : trend} pts
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <clipPath id={`clip-${customer.id}`}>
            <rect x="0" y="0" width={clipWidth} height={H + 10} />
          </clipPath>
          <linearGradient id={`grad-${customer.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scoreColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={scoreColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[25, 50, 75].map((v) => {
          const y = H - pad.y - ((v - min) / range) * (H - pad.y * 2);
          return y > 0 && y < H ? (
            <line
              key={v}
              x1={pad.x}
              y1={y}
              x2={W - pad.x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ) : null;
        })}
        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#grad-${customer.id})`}
          clipPath={`url(#clip-${customer.id})`}
        />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={scoreColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#clip-${customer.id})`}
        />
        {/* Current point dot */}
        {animProgress > 0.9 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3"
            fill={scoreColor}
          />
        )}
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{monthLabels[0]}</span>
        <span>{monthLabels[5]}</span>
        <span>{monthLabels[11]}</span>
      </div>
    </div>
  );
}
