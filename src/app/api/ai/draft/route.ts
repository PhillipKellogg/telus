import type { NextRequest } from 'next/server';
import { createDeepSeekClient, AI_MODEL } from '@/lib/deepseek';
import { getCustomerById } from '@/lib/mock-data';

type DraftType = 'call-script' | 'email';

interface DraftRequest {
  customerId: string;
  type: DraftType;
  context: string; // NBA title or additional instructions
}

function buildPrompt(type: DraftType, context: string, customerId: string): string {
  const customer = getCustomerById(customerId);
  if (!customer) {
    return '';
  }

  const recent = customer.interactions
    .slice(0, 5)
    .map((i) => `[${i.date}] ${i.type}: ${i.summary} (${i.sentiment})`)
    .join('\n');

  const active = customer.services
    .filter((s) => s.status === 'active')
    .map((s) => s.name)
    .join(', ');
  const available = customer.services
    .filter((s) => s.status === 'available')
    .map((s) => s.name)
    .join(', ');

  if (type === 'call-script') {
    return `You are a B2B telecom sales coach. Write a concise call script for a sales agent calling ${customer.name} at ${customer.company}.

GOAL: ${context}

CUSTOMER CONTEXT:
- ${customer.tenureYears}-year ${customer.tier} tier customer, health score ${customer.healthScore}/100
- Billing: ${customer.billingStatus} | MRR: $${customer.monthlyRevenue.toLocaleString()}
- Active: ${active}
- Available to sell: ${available}

RECENT INTERACTIONS:
${recent}

Write a natural, conversational call script with:
1. Opening (reference something personal/specific from history)
2. Bridge (check-in question)
3. Pitch (1-2 sentences, benefit-focused)
4. Handling one likely objection
5. Close / next step

Keep it under 200 words. Use plain text, no markdown headers.`;
  }

  return `You are a B2B telecom account manager. Write a professional follow-up email to ${customer.name} at ${customer.company}.

GOAL: ${context}

CUSTOMER CONTEXT:
- ${customer.tenureYears}-year ${customer.tier} customer | Health: ${customer.healthScore}/100
- Billing: ${customer.billingStatus} | MRR: $${customer.monthlyRevenue.toLocaleString()}
- Active services: ${active}
- Opportunity: ${available}

RECENT INTERACTIONS:
${recent}

Write a concise, personalized email:
- Subject line on the first line prefixed with "Subject: "
- Blank line
- Body (3-4 short paragraphs max, conversational but professional)
- Sign off as "Your Account Manager"

Keep it under 180 words total.`;
}

const MOCK_CALL_SCRIPT = (
  context: string,
) => `Opening: "Hi [Name], it's [Agent] from [Company] — last time we spoke you mentioned the new warehouse opening in Q4, hope that's going well!"

Bridge: "I wanted to check in quickly — how has the network been performing for your team lately?"

Pitch: "The reason I'm calling is about ${context}. Based on what you've told us about your growth plans, I think this is a natural next step — it would give you [specific benefit] without changing anything about your current setup."

Objection handling: If they say "we're happy with what we have" → "Totally understand, and that's actually why I'm reaching out now rather than during a problem. Customers who add this proactively tend to see [outcome] before they ever need it."

Close: "Would it be worth 20 minutes on Thursday or Friday to walk through the numbers? I can pull together a side-by-side comparison."`;

const MOCK_EMAIL = (
  name: string,
  context: string,
) => `Subject: Quick thought on your account, ${name}

Hi ${name},

I hope things are going well at [Company]. I was reviewing your account this week and wanted to share a quick thought.

Given your growth trajectory and what you've shared with us over the past few months, I think now is a great time to explore ${context}. A few of our similar customers have seen strong results, and I believe the timing makes sense for you too.

I'd love to spend 20 minutes walking you through what this would look like in practice — no pressure, just want to make sure you have the full picture.

Would Thursday or Friday afternoon work for a quick call?

Best,
Your Account Manager`;

export async function POST(req: NextRequest) {
  const { customerId, type, context } = (await req.json()) as DraftRequest;

  const customer = getCustomerById(customerId);

  const mockText =
    type === 'call-script'
      ? MOCK_CALL_SCRIPT(context)
      : MOCK_EMAIL(customer?.name ?? 'there', context);

  if (!process.env.DEEPSEEK_API_KEY) {
    return streamText(mockText);
  }

  const client = createDeepSeekClient();
  try {
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: buildPrompt(type, context, customerId) }],
      stream: true,
      max_tokens: 400,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          controller.enqueue(new TextEncoder().encode(chunk.choices[0]?.delta?.content ?? ''));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch {
    return streamText(mockText);
  }
}

function streamText(text: string) {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const words = text.split(' ');
      for (const word of words) {
        controller.enqueue(enc.encode(word + ' '));
        await new Promise((r) => setTimeout(r, 28));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
