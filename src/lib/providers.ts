import { ProviderConfig } from './types';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'opencode',
    name: 'Opencode Go',
    baseUrl: 'https://opencode.ai/zen/go',
    apiType: 'openai',
    website: 'https://opencode.ai/workspace/wrk_01KW0SQVKSPRG4YG3NK51QMTTE/go',
    quotaApi: {
      endpoint: 'https://opencode.ai/_server',
      method: 'GET',
      parser: 'opencode',
    },
  },
  {
    id: 'agens',
    name: 'Agens Free',
    baseUrl: 'https://apihub.agnes-ai.com/v1',
    apiType: 'openai',
    website: 'https://agnes-ai.com/',
  },
  {
    id: 'modelscope',
    name: 'ModelScope Free',
    baseUrl: 'https://api-inference.modelscope.cn',
    apiType: 'anthropic',
    website: 'https://modelscope.cn',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/anthropic',
    apiType: 'anthropic',
    website: 'https://platform.deepseek.com',
    quotaApi: {
      endpoint: 'https://api.deepseek.com/user/balance',
      method: 'GET',
      authType: 'openai',
      parser: 'deepseek',
    },
  },
  {
    id: 'hakimi',
    name: '哈基米',
    baseUrl: 'https://api.ricardochat.xyz/v1',
    apiType: 'openai',
    website: 'https://ai.ricardochat.cn/',
    quotaApi: {
      endpoint: 'https://api.ricardochat.xyz/api/usage/token/',
      method: 'GET',
      parser: 'hakimi',
    },
  },
];
