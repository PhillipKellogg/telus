import { useQuery } from '@tanstack/react-query';
import type { Customer } from '@/types/customer';

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
  });
}
