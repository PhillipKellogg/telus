import { useQuery } from '@tanstack/react-query';
import type { Customer } from '@/types/customer';
import { getCustomerById } from '@/lib/mock-data';

async function fetchCustomer(id: string): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) {
    throw new Error('Customer not found');
  }
  return res.json() as Promise<Customer>;
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
    // Serve mock data immediately — no loading skeleton on first paint
    initialData: () => getCustomerById(id),
    initialDataUpdatedAt: 0, // treat as stale so API still syncs in background
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
