import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCustomerById } from '@/lib/mock-data';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/customers/[id]'>) {
  const { id } = await ctx.params;
  const customer = getCustomerById(id);

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json(customer);
}
