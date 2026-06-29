'use client';

import { QuotaData } from '@/lib/types';

interface QuotaSectionProps {
  data: QuotaData | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function QuotaSection({ data, error, loading, onRefresh }: QuotaSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[#8c8780]">
          额度余量
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-[12px] text-[#8c8780] hover:text-[#d97757] transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? '查询中…' : '刷新'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-[#8c8780]">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-[#e4ded6] border-t-[#d97757] animate-spin" />
          查询中…
        </div>
      ) : error ? (
        <div className="rounded-sm border border-[#e8e3dc] bg-[#faf8f4] p-3 text-[13px] text-[#c4554d]">
          {error}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="rounded-sm border border-[#e8e3dc] bg-[#f5f2ee] divide-y divide-[#e8e3dc]">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 gap-3">
              <span className="text-[12px] text-[#8c8780] shrink-0">{item.label}</span>
              <span className="text-[13px] text-[#2d2a26] font-medium text-right font-mono">
                {item.value}
                {item.sub && (
                  <span className="block text-[11px] text-[#bfb9b0] font-normal">{item.sub}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-[#e4ded6] bg-[#faf8f4] p-4">
          <p className="text-center text-[13px] text-[#bfb9b0]">
            {data && data.items.length === 0 ? '暂无数据' : '点击刷新查询额度'}
          </p>
        </div>
      )}
    </div>
  );
}
