'use client';

import type { Customer, Service } from '@/types/customer';
import { cn } from '@/lib/utils';

interface ServiceabilityRingsProps {
  customer: Customer;
}

const CATEGORY_ORDER = ['Internet', 'Voice', 'Network', 'Cloud', 'Security'];

const STATUS_COLORS: Record<Service['status'], string> = {
  active: '#10b981',
  available: '#3b82f6',
  unavailable: '#d1d5db',
};

const STATUS_LABELS: Record<Service['status'], string> = {
  active: 'Active',
  available: 'Available',
  unavailable: 'Not available',
};

function ServiceRing({ service }: { service: Service }) {
  const color = STATUS_COLORS[service.status];
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const fill =
    service.status === 'active'
      ? circumference
      : service.status === 'available'
        ? circumference * 0.5
        : 0;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="relative w-10 h-10">
        <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="5" />
          {service.status !== 'unavailable' && (
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeDasharray={`${fill} ${circumference}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center text-[8px] font-bold rotate-90',
            service.status === 'unavailable' ? 'text-gray-300' : '',
          )}
          style={{ color: service.status !== 'unavailable' ? color : undefined }}
        >
          {service.status === 'active' ? '✓' : service.status === 'available' ? '○' : '✕'}
        </span>
      </div>
      <span className="text-[10px] text-center text-muted-foreground leading-tight max-w-[72px] truncate">
        {service.name.split(' ').slice(0, 2).join(' ')}
      </span>
      <span
        className="text-[9px] font-medium"
        style={{ color: service.status !== 'unavailable' ? color : '#9ca3af' }}
      >
        {STATUS_LABELS[service.status]}
      </span>
    </div>
  );
}

export function ServiceabilityRings({ customer }: ServiceabilityRingsProps) {
  const grouped = CATEGORY_ORDER.reduce<Record<string, Service[]>>((acc, cat) => {
    const services = customer.services.filter((s) => s.category === cat);
    if (services.length > 0) {
      acc[cat] = services;
    }
    return acc;
  }, {});

  const activeMonthly = customer.services
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyValue, 0);
  const opportunityMonthly = customer.services
    .filter((s) => s.status === 'available')
    .reduce((sum, s) => sum + s.monthlyValue, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs">
        <div>
          <p className="text-muted-foreground">Active MRR</p>
          <p className="font-semibold text-emerald-600">${activeMonthly.toLocaleString()}/mo</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">White Space</p>
          <p className="font-semibold text-blue-600">${opportunityMonthly.toLocaleString()}/mo</p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([category, services]) => (
          <div key={category}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}</p>
            <div className="flex flex-wrap gap-3">
              {services.map((svc) => (
                <ServiceRing key={svc.id} service={svc} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t text-xs space-y-0.5">
        <div className="flex justify-between">
          <p className="text-muted-foreground">{customer.location.address}</p>
        </div>
        <p className="text-muted-foreground">
          {customer.location.city}, {customer.location.state} {customer.location.zip}
        </p>
        <p className="font-medium text-blue-600">{customer.location.serviceZone}</p>
      </div>

      <div className="flex gap-3 pt-1 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
          N/A
        </span>
      </div>
    </div>
  );
}
