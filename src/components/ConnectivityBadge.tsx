'use client';

interface ConnectivityBadgeProps {
  status: 'unknown' | 'testing' | 'connected' | 'failed';
}

const COLORS: Record<string, { dot: string; text: string; pulse: string }> = {
  unknown:   { dot: 'bg-[#bfb9b0]', text: 'text-[#8c8780]', pulse: '' },
  testing:   { dot: 'bg-[#d97757]', text: 'text-[#d97757]', pulse: 'animate-pulse' },
  connected: { dot: 'bg-[#4a8c6f]', text: 'text-[#4a8c6f]', pulse: '' },
  failed:    { dot: 'bg-[#c4554d]', text: 'text-[#c4554d]', pulse: '' },
};

const LABELS: Record<string, string> = {
  unknown: '未测试', testing: '测试中', connected: '已连接', failed: '失败',
};

export default function ConnectivityBadge({ status }: ConnectivityBadgeProps) {
  const c = COLORS[status];
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-medium ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot} ${c.pulse}`} />
      {LABELS[status]}
    </span>
  );
}
