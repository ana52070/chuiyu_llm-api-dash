'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProviderConfig, QuotaData } from '@/lib/types';
import { getKey, setKey, getOpencodeCookie, setOpencodeCookie, getOpencodeServerId, setOpencodeServerId } from '@/lib/storage';
import { parseDeepSeek, parseHakimi, parseOpencode, parseRaw } from '@/lib/quota';
import ConnectivityBadge from './ConnectivityBadge';
import ApiKeyInput from './ApiKeyInput';
import ModelList from './ModelList';
import QuotaSection from './QuotaSection';

interface ProviderCardProps {
  config: ProviderConfig;
  index: number;
}

const SIGNAL: Record<string, string> = {
  unknown:   'bg-[#d9d4cc]',
  testing:   'bg-[#d97757]',
  connected: 'bg-[#4a8c6f]',
  failed:    'bg-[#c4554d]',
};

export default function ProviderCard({ config, index }: ProviderCardProps) {
  const [apiKey, setApiKey] = useState('');
  const [connectivity, setConnectivity] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [ocCookie, setOcCookie] = useState('');
  const [ocServerId, setOcServerId] = useState('');

  useEffect(() => {
    setApiKey(getKey(config.id));
    if (config.id === 'opencode') {
      setOcCookie(getOpencodeCookie());
      setOcServerId(getOpencodeServerId());
    }
  }, [config.id]);

  const handleKeyChange = useCallback((key: string) => {
    setApiKey(key);
    setKey(config.id, key);
  }, [config.id]);

  const handleOcCookieChange = useCallback((v: string) => {
    setOcCookie(v);
    setOpencodeCookie(v);
  }, []);

  const handleOcServerIdChange = useCallback((v: string) => {
    setOcServerId(v);
    setOpencodeServerId(v);
  }, []);

  const proxyRequest = useCallback(async (
    url: string,
    method: 'GET' | 'POST',
    body?: unknown,
    authType?: string,
    customHeaders?: Record<string, string>,
  ) => {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, method, apiType: config.apiType, apiKey, body, authType, customHeaders }),
    });
    return res.json();
  }, [config.apiType, apiKey]);

  const testConnectivity = useCallback(async () => {
    if (!apiKey) return;
    setConnectivity('testing');
    try {
      const result = await proxyRequest(`${config.baseUrl}/v1/models`, 'GET');
      setConnectivity(result.ok ? 'connected' : 'failed');
    } catch {
      setConnectivity('failed');
    }
  }, [apiKey, config.baseUrl, proxyRequest]);

  const fetchModels = useCallback(async () => {
    if (!apiKey) return;
    setModelsLoading(true);
    try {
      const result = await proxyRequest(`${config.baseUrl}/v1/models`, 'GET');
      if (result.ok && result.data?.data) {
        setModels(result.data.data.map((m: { id: string }) => m.id).sort());
      } else if (result.ok && Array.isArray(result.data)) {
        setModels(result.data.sort());
      }
    } catch { /* ignore */ }
    finally { setModelsLoading(false); }
  }, [apiKey, config.baseUrl, proxyRequest]);

  const checkQuota = useCallback(async () => {
    const qa = config.quotaApi;
    if (!apiKey || !qa) return;
    setQuotaLoading(true);
    setQuotaError(null);
    setQuotaData(null);
    try {
      let url = qa.endpoint;
      let ch: Record<string, string> | undefined;

      if (qa.parser === 'opencode') {
        if (!ocCookie || !ocServerId) {
          setQuotaError('需要填写 Cookie 和 Server ID');
          setQuotaLoading(false);
          return;
        }
        const wsId = config.website.match(/wrk_[a-zA-Z0-9]+/)?.[0] || '';
        const args = JSON.stringify({
          t: { t: 9, i: 0, l: 1, a: [{ t: 1, s: wsId }], o: 0 },
          f: 31, m: [],
        });
        url = `${qa.endpoint}?id=${encodeURIComponent(ocServerId)}&args=${encodeURIComponent(args)}`;
        ch = {
          'X-Server-Id': ocServerId,
          'X-Server-Instance': 'server-fn:0',
          Referer: `https://opencode.ai/workspace/${wsId}/go`,
          Cookie: ocCookie,
        };
      }

      const result = await proxyRequest(url, qa.method, undefined, qa.authType, ch);
      if (result.ok) {
        let parsed: QuotaData;
        switch (qa.parser) {
          case 'deepseek':
            parsed = parseDeepSeek(result.data);
            break;
          case 'hakimi':
            parsed = parseHakimi(result.data);
            break;
          case 'opencode':
            parsed = parseOpencode(typeof result.data === 'string' ? result.data : JSON.stringify(result.data));
            break;
          default:
            parsed = parseRaw(result.data);
        }
        setQuotaData(parsed);
      } else {
        setQuotaError(`HTTP ${result.status}`);
      }
    } catch {
      setQuotaError('请求失败');
    } finally {
      setQuotaLoading(false);
    }
  }, [apiKey, config.quotaApi, config.website, ocCookie, ocServerId, proxyRequest]);

  const autoRan = useRef(false);
  useEffect(() => {
    if (!apiKey || autoRan.current) return;
    autoRan.current = true;
    (async () => {
      await testConnectivity();
      await fetchModels();
      checkQuota();
    })();
  }, [apiKey, testConnectivity, fetchModels, checkQuota]);

  return (
    <div
      className="flex rounded-lg overflow-hidden border border-[#e8e3dc] bg-white
                 hover:border-[#d9d4cc] hover:shadow-sm transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 信号条 */}
      <div className={`shrink-0 w-[3px] transition-colors duration-500 ${SIGNAL[connectivity]}`} />

      <div className="flex-1 min-w-0">
        {/* 头部 */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4.5 text-left
                     hover:bg-[#faf8f4]/70 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="shrink-0 text-[12px] font-bold text-[#bfb9b0] font-mono uppercase">
              {config.id.slice(0, 3)}
            </span>
            <div className="min-w-0">
              <h3 className="text-[16px] font-medium text-[#2d2a26] leading-tight truncate">
                {config.name}
              </h3>
              <p className="text-[13px] text-[#8c8780] truncate font-mono mt-0.5">
                {new URL(config.baseUrl).hostname}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ConnectivityBadge status={connectivity} />
            <svg
              className={`w-4 h-4 text-[#bfb9b0] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </button>

        {/* 展开内容 */}
        {expanded && (
          <div className="px-5 pb-5 space-y-5 border-t border-[#f0ece6] pt-5 animate-[fade-in_0.2s_ease-out]">
            <ApiKeyInput value={apiKey} onChange={handleKeyChange} />

            {config.id === 'opencode' && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-medium text-[#8c8780]">Opencode 额度凭证</p>
                <input
                  type="text"
                  value={ocCookie}
                  onChange={e => handleOcCookieChange(e.target.value)}
                  placeholder="Cookie（以 auth= 开头）"
                  autoComplete="off"
                  name="oc-cookie"
                  className="w-full rounded-sm border border-[#e4ded6] bg-white px-3 py-2
                             text-[13px] text-[#2d2a26] placeholder:text-[#bfb9b0]
                             focus:border-[#bfb9b0] focus:outline-none focus:ring-1 focus:ring-[#d9d4cc]
                             transition-all font-mono"
                />
                <input
                  type="text"
                  value={ocServerId}
                  onChange={e => handleOcServerIdChange(e.target.value)}
                  placeholder="X-Server-Id"
                  autoComplete="off"
                  name="oc-server-id"
                  className="w-full rounded-sm border border-[#e4ded6] bg-white px-3 py-2
                             text-[13px] text-[#2d2a26] placeholder:text-[#bfb9b0]
                             focus:border-[#bfb9b0] focus:outline-none focus:ring-1 focus:ring-[#d9d4cc]
                             transition-all font-mono"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={testConnectivity}
                disabled={!apiKey || connectivity === 'testing'}
                className="rounded-sm border border-[#e4ded6] bg-[#faf8f4] px-4 py-2
                           text-[12px] font-medium
                           text-[#5c5750] hover:text-[#d97757] hover:border-[#d9d4cc]
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
              >
                {connectivity === 'testing' ? '测试中…' : '测试连通'}
              </button>
              <button
                type="button"
                onClick={fetchModels}
                disabled={!apiKey || modelsLoading}
                className="rounded-sm border border-[#e4ded6] bg-[#faf8f4] px-4 py-2
                           text-[12px] font-medium
                           text-[#5c5750] hover:text-[#d97757] hover:border-[#d9d4cc]
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
              >
                {modelsLoading ? '加载中…' : '查看模型'}
              </button>
              <a
                href={config.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-[#e4ded6] bg-[#faf8f4] px-4 py-2
                           text-[12px] font-medium
                           text-[#5c5750] hover:text-[#d97757] hover:border-[#d9d4cc]
                           transition-colors inline-flex items-center gap-1.5"
              >
                官网
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>

            <ModelList models={models} loading={modelsLoading} />
            <QuotaSection data={quotaData} error={quotaError} loading={quotaLoading} onRefresh={checkQuota} />
          </div>
        )}
      </div>
    </div>
  );
}
