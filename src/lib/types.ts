export type ApiType = 'openai' | 'anthropic';

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiType: ApiType;
  website: string;
  quotaApi?: QuotaApiConfig;
}

export interface QuotaApiConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  authType?: ApiType;
  customHeaders?: Record<string, string>;
  parser: 'deepseek' | 'hakimi' | 'opencode' | 'raw';
}

export interface QuotaData {
  items: QuotaItem[];
}

export interface QuotaItem {
  label: string;
  value: string;
  sub?: string;
}
