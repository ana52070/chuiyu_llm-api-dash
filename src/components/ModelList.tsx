'use client';

import { useState } from 'react';

interface ModelListProps {
  models: string[];
  loading: boolean;
}

const PREVIEW_COUNT = 10;

export default function ModelList({ models, loading }: ModelListProps) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div>
        <span className="text-[11px] font-medium text-[#8c8780]">
          可用模型
        </span>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-[#8c8780]">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-[#e4ded6] border-t-[#d97757] animate-spin" />
          加载中…
        </div>
      </div>
    );
  }

  if (models.length === 0) return null;

  const visible = showAll ? models : models.slice(0, PREVIEW_COUNT);
  const hidden = models.length - PREVIEW_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#8c8780]">
          可用模型 · {models.length}
        </span>
        {models.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[12px] text-[#8c8780] hover:text-[#d97757] transition-colors"
          >
            {showAll ? '收起' : `展开全部 (+${hidden})`}
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {visible.map(m => (
          <span
            key={m}
            className="rounded-sm bg-[#f5f2ee] px-2.5 py-1 text-[12px] text-[#5c5750] font-mono
                       border border-[#e8e3dc]"
          >
            {m}
          </span>
        ))}
        {!showAll && hidden > 0 && (
          <span className="rounded-sm bg-transparent px-2.5 py-1 text-[12px] text-[#bfb9b0] font-mono
                          border border-dashed border-[#e4ded6]">
            …还有 {hidden} 个
          </span>
        )}
      </div>
    </div>
  );
}
