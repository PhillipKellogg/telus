import type { NextRequest } from 'next/server';
import { createDeepSeekClient, AI_MODEL } from '@/lib/deepseek';
import { getCustomerById } from '@/lib/mock-data';
import type { ChatMessage } from '@/types/ai';

interface ChatRequest {
  messages: ChatMessage[];
  customerId: string;
}

function buildSystemPrompt(customerId: string): string {
  const customer = getCustomerById(customerId);
  if (!customer) {
    return 'You are a helpful sales assistant.';
  }

  return `You are an AI sales assistant helping a sales agent understand and sell to a specific customer account.

CUSTOMER CONTEXT:
- ${customer.name} at ${customer.company}
- ${customer.tenureYears}-year customer | ${customer.tier} tier | Health: ${customer.healthScore}/100
- Monthly Revenue: $${customer.monthlyRevenue.toLocaleString()} | Billing: ${customer.billingStatus}
- Active services: ${customer.services
    .filter((s) => s.status === 'active')
    .map((s) => s.name)
    .join(', ')}
- Available/upsell: ${customer.services
    .filter((s) => s.status === 'available')
    .map((s) => s.name)
    .join(', ')}

Answer questions about this customer concisely. Be specific and data-driven. Suggest talking points for sales conversations. Keep responses under 150 words unless a longer analysis is specifically requested.`;
}

export async function POST(req: NextRequest) {
  const { messages, customerId } = (await req.json()) as ChatRequest;

  if (!process.env.DEEPSEEK_API_KEY) {
    const mockStream = new ReadableStream({
      start(controller) {
        const response =
          "I'm your AI assistant. Add your DEEPSEEK_API_KEY to .env.local to enable live AI responses. In the meantime, I can see all customer data and interaction history in my context.";
        controller.enqueue(new TextEncoder().encode(response));
        controller.close();
      },
    });
    return new Response(mockStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const client = createDeepSeekClient();

  try {
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(customerId) }, ...messages],
      stream: true,
      max_tokens: 300,
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AI Chat]', message);
    const fallback = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`AI error: ${message}`));
        controller.close();
      },
    });
    return new Response(fallback, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
