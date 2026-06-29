'use client';

interface ModelListProps {
  models: string[];
  loading: boolean;
}

export default function ModelList({ models, loading }: ModelListProps) {
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

  return (
    <div>
      <span className="text-[11px] font-medium text-[#8c8780]">
        可用模型 · {models.length}
      </span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {models.map(m => (
          <span
            key={m}
            className="rounded-sm bg-[#f5f2ee] px-2.5 py-1 text-[12px] text-[#5c5750] font-mono
                       border border-[#e8e3dc]"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
