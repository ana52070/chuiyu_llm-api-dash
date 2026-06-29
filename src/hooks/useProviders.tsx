'use client';

import { useState, useEffect, useRef } from 'react';
import { ProviderConfig } from '@/lib/types';
import { getAllKeys, setKey, setOpencodeCookie, getOpencodeCookie, setOpencodeServerId, getOpencodeServerId } from '@/lib/storage';
import ProviderCard from '@/components/ProviderCard';

interface ProviderDashboardProps {
  providers: ProviderConfig[];
}

export default function ProviderDashboard({ providers }: ProviderDashboardProps) {
  const [search, setSearch] = useState('');
  const [keys, setKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    setKeys(getAllKeys());
    const onStorage = () => setKeys(getAllKeys());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const envLoaded = useRef(false);
  useEffect(() => {
    if (envLoaded.current) return;
    envLoaded.current = true;
    (async () => {
      try {
        const res = await fetch('/api/keys');
        const data = await res.json();

        if (data.apiKeys) {
          const existing = getAllKeys();
          for (const [id, key] of Object.entries(data.apiKeys)) {
            if (typeof key !== 'string' || !key) continue;
            if (!existing[id]) {
              setKey(id, key);
            }
          }
        }

        if (data.ocCookie && !getOpencodeCookie()) {
          setOpencodeCookie(data.ocCookie);
        }
        if (data.ocServerId && !getOpencodeServerId()) {
          setOpencodeServerId(data.ocServerId);
        }

        setKeys(getAllKeys());
      } catch { /* ignore */ }
    })();
  }, []);

  const filtered = providers.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.baseUrl.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const keyCount = Object.values(keys).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bfb9b0]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
          >
            <path strokeLinecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索提供商…"
            autoComplete="off"
            name="search"
            className="w-full rounded-md border border-[#e4ded6] bg-white pl-10 pr-4 py-2.5
                       text-[14px] text-[#2d2a26] placeholder:text-[#bfb9b0]
                       focus:border-[#bfb9b0] focus:outline-none focus:ring-1 focus:ring-[#d9d4cc]
                       transition-all"
          />
        </div>
        <span className="text-[12px] text-[#8c8780] shrink-0 tabular-nums font-mono">
          {keyCount}/{providers.length} 已填密钥
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {filtered.map((provider, i) => (
          <div key={provider.id} className="animate-[fade-in_0.4s_ease-out_both]" style={{ animationDelay: `${i * 60}ms` }}>
            <ProviderCard config={provider} index={i} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[13px] text-[#bfb9b0] py-16">
          无匹配结果
        </p>
      )}
    </div>
  );
}
