import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createDeepSeekClient, AI_MODEL } from '@/lib/deepseek';
import { getCustomerById } from '@/lib/mock-data';
import type { Customer } from '@/types/customer';

function buildInsightsPrompt(customer: Customer): string {
  const recentInteractions = customer.interactions.slice(0, 8);
  const interactionSummaries = recentInteractions
    .map(
      (i) =>
        `[${i.date}] ${i.type.toUpperCase()} — ${i.subject}: ${i.summary} (sentiment: ${i.sentiment})`,
    )
    .join('\n');

  const activeServices = customer.services
    .filter((s) => s.status === 'active')
    .map((s) => s.name)
    .join(', ');
  const availableServices = customer.services
    .filter((s) => s.status === 'available')
    .map((s) => `${s.name} ($${s.monthlyValue}/mo)`)
    .join(', ');

  return `You are an AI sales assistant for a B2B telecommunications company. Analyze this customer account and provide strategic insights.

CUSTOMER PROFILE:
- Name: ${customer.name} (${customer.company})
- Tenure: ${customer.tenureYears} years | Tier: ${customer.tier} | Health Score: ${customer.healthScore}/100
- Monthly Revenue: $${customer.monthlyRevenue.toLocaleString()} | Billing: ${customer.billingStatus}
- Account Manager: ${customer.accountManager}

ACTIVE SERVICES: ${activeServices}

AVAILABLE (WHITE SPACE) SERVICES: ${availableServices}

RECENT INTERACTIONS:
${interactionSummaries}

Respond with ONLY a valid JSON object in this exact format:
{
  "summary": [
    {
      "label": "Sentiment",
      "content": "One sentence describing overall customer sentiment and relationship health",
      "evidenceIds": ["list interaction indices 0-7 that support this"]
    },
    {
      "label": "Friction",
      "content": "One sentence describing the main pain point or risk",
      "evidenceIds": ["list interaction indices 0-7 that support this"]
    },
    {
      "label": "Recent Win",
      "content": "One sentence describing a recent positive development or opportunity",
      "evidenceIds": ["list interaction indices 0-7 that support this"]
    }
  ],
  "nextBestActions": [
    {
      "id": "nba-1",
      "variant": "one of: upsell|cross-sell|retention|win-back|service-upgrade|reactivation|bundle|referral",
      "title": "Short action title (5-7 words)",
      "description": "One sentence describing the specific action to take",
      "confidence": 85,
      "estimatedValue": 400,
      "reasoning": ["reason 1 based on data", "reason 2 based on data", "reason 3 based on data"],
      "evidenceIds": ["list interaction indices 0-7"]
    },
    { "id": "nba-2", ... },
    { "id": "nba-3", ... }
  ]
}`;
}

export async function POST(req: NextRequest) {
  const { customerId } = (await req.json()) as { customerId: string };

  const customer = getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return streamMockInsights(customer);
  }

  const client = createDeepSeekClient();

  try {
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: buildInsightsPrompt(customer) }],
      stream: true,
      response_format: { type: 'json_object' },
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content ?? '';
          controller.enqueue(new TextEncoder().encode(token));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch {
    return NextResponse.json(getMockInsights(customer), { status: 200 });
  }
}

function streamMockInsights(customer: Customer) {
  const payload = JSON.stringify(getMockInsights(customer));
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      // Stream the JSON in small chunks with realistic typing cadence
      const chunkSize = 8;
      for (let i = 0; i < payload.length; i += chunkSize) {
        controller.enqueue(enc.encode(payload.slice(i, i + chunkSize)));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  });
}

function getMockInsights(customer: Customer) {
  const interactionIds = customer.interactions.slice(0, 3).map((_, i) => String(i));

  return {
    summary: [
      {
        label: 'Sentiment',
        content: `${customer.name} shows ${customer.healthScore > 70 ? 'positive' : customer.healthScore > 45 ? 'mixed' : 'negative'} sentiment based on recent interactions. Health score of ${customer.healthScore}/100 reflects ${customer.healthScore > 70 ? 'a strong and growing relationship' : customer.healthScore > 45 ? 'emerging friction points that need attention' : 'significant churn risk requiring immediate intervention'}.`,
        evidenceIds: interactionIds,
      },
      {
        label: 'Friction',
        content:
          customer.billingStatus !== 'Current'
            ? `Billing status is ${customer.billingStatus} — outstanding balance is creating relationship risk and trust issues.`
            : customer.healthScore < 50
              ? 'Repeated support issues and unresolved complaints are driving dissatisfaction.'
              : 'No major friction points detected. Customer is stable with minor service inquiries.',
        evidenceIds: [interactionIds[0]],
      },
      {
        label: 'Recent Win',
        content:
          customer.tenureYears >= 5
            ? `Long-tenured ${customer.tenureYears}-year customer represents high lifetime value and potential referral advocate.`
            : 'Recent positive support resolution and open expansion conversations signal near-term upsell opportunity.',
        evidenceIds: [interactionIds[interactionIds.length - 1]],
      },
    ],
    nextBestActions: getMockNBAs(customer),
  };
}

function getMockNBAs(customer: Customer) {
  const availableServices = customer.services.filter((s) => s.status === 'available');
  const actions = [];
  let idCounter = 1;

  if (customer.billingStatus === 'Overdue' || customer.billingStatus === 'Collections') {
    actions.push({
      id: `nba-${idCounter++}`,
      variant: 'retention',
      title: 'Resolve billing to protect account',
      description:
        'Schedule executive call to address outstanding balance and agree on a structured payment plan.',
      confidence: 90,
      estimatedValue: customer.monthlyRevenue * 12,
      reasoning: [
        `Account is ${customer.billingStatus} — suspension risk is high`,
        'Customer has shown past willingness to engage when reached directly',
        'Resolving billing unlocks cross-sell conversations',
      ],
      evidenceIds: ['0'],
    });
  }

  if (customer.healthScore < 50) {
    actions.push({
      id: `nba-${idCounter++}`,
      variant: 'retention',
      title: 'Proactive retention outreach needed',
      description:
        'Assign senior account manager for recovery plan. Offer service credits and SLA review.',
      confidence: 85,
      estimatedValue: customer.monthlyRevenue * 12,
      reasoning: [
        `Health score ${customer.healthScore}/100 indicates churn risk`,
        'Recent negative interactions without resolution follow-up',
        'Competitor alternatives being evaluated',
      ],
      evidenceIds: ['0', '1'],
    });
  }

  if (availableServices.length > 0) {
    const topService = availableServices[0];
    actions.push({
      id: `nba-${idCounter++}`,
      variant: 'upsell',
      title: `Propose ${topService.name}`,
      description: `Customer qualifies for ${topService.name} — demonstrated need based on recent interaction history.`,
      confidence: 72,
      estimatedValue: topService.monthlyValue,
      reasoning: [
        'Service aligns with expressed customer needs from recent QBR',
        `Estimated $${topService.monthlyValue}/mo revenue uplift`,
        'Customer tier and tenure make this a warm conversation',
      ],
      evidenceIds: ['1', '2'],
    });
  }

  while (actions.length < 3) {
    actions.push({
      id: `nba-${idCounter++}`,
      variant: customer.tenureYears >= 5 ? 'referral' : 'bundle',
      title:
        customer.tenureYears >= 5 ? 'Activate referral program' : 'Bundle services for savings',
      description:
        customer.tenureYears >= 5
          ? 'Long-tenure customer is a natural advocate — introduce formal referral incentive program.'
          : 'Bundle existing and available services for 10% discount, improving stickiness.',
      confidence: 65,
      estimatedValue: 200,
      reasoning: [
        'Customer interaction data shows satisfaction with current services',
        'Loyalty and tenure support a trust-based conversation',
        'Program has shown 23% conversion rate with similar customer profiles',
      ],
      evidenceIds: ['2'],
    });
  }

  return actions.slice(0, 3);
}
