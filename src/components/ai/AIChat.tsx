'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamingText } from './StreamingText';
import type { ChatMessage } from '@/types/ai';

interface AIChatProps {
  customerId: string;
}

const SUGGESTED_PROMPTS = [
  'What are the top risks for this account?',
  'Suggest talking points for the renewal call',
  'Why is the health score low?',
];

export function AIChat({ customerId }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) {
      return;
    }

    const userMsg: ChatMessage = { role: 'user', content: content.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, customerId }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulated += decoder.decode(value, { stream: true });
        setStreamingContent(accumulated);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: accumulated }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="w-3.5 h-3.5" />
              Ask me anything about this account
            </div>
            <div className="space-y-1.5">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => sendMessage(p)}
                  className="w-full text-left text-xs px-2.5 py-2 rounded-lg bg-muted/60 hover:bg-muted border border-transparent hover:border-border transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] text-xs rounded-xl px-3 py-2 leading-relaxed ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] text-xs rounded-xl px-3 py-2 bg-muted border leading-relaxed">
              <StreamingText text={streamingContent} isStreaming />
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="text-xs rounded-xl px-3 py-2 bg-muted border">
              <span className="flex gap-1 items-center text-muted-foreground">
                <span className="animate-bounce delay-0">·</span>
                <span className="animate-bounce delay-150">·</span>
                <span className="animate-bounce delay-300">·</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t pt-2 mt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-1.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this account..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="sm"
            variant="default"
            className="h-7 w-7 p-0"
            disabled={isStreaming || !input.trim()}
          >
            <Send className="w-3 h-3" />
          </Button>
        </form>
      </div>
    </div>
  );
}
