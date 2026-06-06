'use client';

import { useRef } from 'react';
import { Copy, Check, X, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StreamingText } from './StreamingText';

interface AIDraftPanelProps {
  isOpen: boolean;
  type: 'call-script' | 'email';
  text: string;
  isStreaming: boolean;
  onClose: () => void;
}

export function AIDraftPanel({ isOpen, type, text, isStreaming, onClose }: AIDraftPanelProps) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  const Icon = type === 'call-script' ? Phone : Mail;
  const title = type === 'call-script' ? 'AI Call Script' : 'AI Email Draft';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-500" />
              <SheetTitle className="text-base">{title}</SheetTitle>
              {isStreaming && (
                <span className="flex items-center gap-1 text-xs text-blue-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                  Generating...
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={handleCopy}
                disabled={!text || isStreaming}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4">
          <div
            ref={textRef}
            className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap border min-h-[200px]"
          >
            {text ? (
              <StreamingText text={text} isStreaming={isStreaming} />
            ) : (
              <span className="text-muted-foreground italic">
                Generating your {type === 'call-script' ? 'call script' : 'email'}...
              </span>
            )}
          </div>
        </div>

        {!isStreaming && text && (
          <div className="shrink-0 pt-3 border-t text-xs text-muted-foreground">
            AI-generated draft · Review before sending · Based on interaction history
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
