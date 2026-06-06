import OpenAI from 'openai';

export const AI_MODEL = 'llama-3.3-70b-versatile';

export function createDeepSeekClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}
