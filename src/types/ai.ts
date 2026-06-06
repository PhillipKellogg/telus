export type NBAVariant =
  | 'upsell'
  | 'cross-sell'
  | 'retention'
  | 'win-back'
  | 'service-upgrade'
  | 'reactivation'
  | 'bundle'
  | 'referral';

export type FeedbackReason =
  | 'already-sold'
  | 'wrong-timing'
  | 'customer-declined'
  | 'not-eligible'
  | 'other';

export interface NextBestAction {
  id: string;
  variant: NBAVariant;
  title: string;
  description: string;
  confidence: number;
  estimatedValue: number;
  reasoning: string[];
  evidenceIds: string[];
}

export interface AIInsightBullet {
  label: string;
  content: string;
  evidenceIds: string[];
}

export interface AIInsight {
  customerId: string;
  summary: AIInsightBullet[];
  nextBestActions: NextBestAction[];
  generatedAt: string;
}

export interface FeedbackPayload {
  actionId: string;
  customerId: string;
  positive: boolean;
  reason?: FeedbackReason;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
