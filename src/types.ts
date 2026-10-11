export interface DataRecord {
  'S.No': number | string;
  'Name': string;
  'Mobile': string;
  'Aadhaar'?: string;
  'RationCard'?: string;
  'Ward'?: string;
  'Status'?: 'Pending' | 'Success' | 'Skipped' | 'Error';
  [key: string]: any;
}

export type PortalType = '1' | '2';

export interface PortalConfig {
  id: PortalType;
  name: string;
  teluguName: string;
  description: string;
  endpointUrl: string;
  fields: string[];
}

export interface DuplicateGroup {
  mobile: string;
  records: DataRecord[];
  count: number;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'field';
  message: string;
  teluguMessage?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  gramPanchayat: string;
  mandal?: string;
  district: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending' | 'rejected';
  registeredAt: string;
  approvedAt?: string;
}

export interface NewsItem {
  id: string;
  text: string;
  isNew: boolean;
  date: string;
}

export interface DynamicForm {
  id: string;
  title: string;
  teluguTitle: string;
  category: string;
  description: string;
  fields: string[];
  version: string;
  lastUpdated: string;
  isLive: boolean;
}

export type SelectedModule = '' | 'tmp' | 'future_updates';

export type PolicyStatus = 'allowed' | 'restricted' | 'unknown';

export interface DomainPolicy {
  id: string;
  domain: string;
  portalName: string;
  status: PolicyStatus;
  policyNotes: string;
  termsUrl?: string;
  lastReviewed: string;
  reviewedBy: string;
}

export interface DomainCheckResult {
  allowed: boolean;
  status: PolicyStatus;
  message: string;
  teluguMessage: string;
  policy?: DomainPolicy;
}

