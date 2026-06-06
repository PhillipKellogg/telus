export type CustomerTier = 'Gold' | 'Silver' | 'Bronze';
export type BillingStatus = 'Current' | 'Overdue' | 'Collections' | 'Suspended';
export type ServiceStatus = 'active' | 'available' | 'unavailable';
export type InteractionType = 'crm' | 'billing' | 'support' | 'marketing';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Service {
  id: string;
  name: string;
  category: string;
  status: ServiceStatus;
  monthlyValue: number;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  agent?: string;
  subject: string;
  summary: string;
  sentiment: Sentiment;
  fullTranscript: string;
  tags: string[];
}

export interface CustomerLocation {
  address: string;
  city: string;
  state: string;
  zip: string;
  serviceZone: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tenureYears: number;
  tier: CustomerTier;
  healthScore: number;
  billingStatus: BillingStatus;
  monthlyRevenue: number;
  location: CustomerLocation;
  accountManager: string;
  lastContactDate: string;
  services: Service[];
  interactions: Interaction[];
}
