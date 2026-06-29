import { QuotaData } from './types';

export function parseDeepSeek(data: unknown): QuotaData {
  const items: QuotaData['items'] = [];
  const d = data as Record<string, unknown>;
  if (!d) return { items };

  if (d.is_available !== undefined) {
    items.push({
      label: '状态',
      value: d.is_available ? '可用' : '不可用',
    });
  }

  const info = (d.balance_infos as Array<Record<string, unknown>>)?.[0];
  if (info) {
    if (info.currency) {
      items.push({ label: '货币', value: String(info.currency) });
    }
    items.push({ label: '总余额', value: `${info.total_balance || '—'}` });
    items.push({ label: '赠送余额', value: `${info.granted_balance || '—'}` });
    items.push({ label: '充值余额', value: `${info.topped_up_balance || '—'}` });
  }
  return { items };
}

export function parseHakimi(data: unknown): QuotaData {
  const items: QuotaData['items'] = [];
  const d = data as Record<string, unknown>;
  const inner = d?.data as Record<string, unknown> | undefined;
  if (!inner) return { items };

  const toUSD = (v: number) => (v / 500000).toFixed(2);

  if (inner.name) {
    items.push({ label: '令牌名称', value: String(inner.name) });
  }

  const granted = Number(inner.total_granted);
  const used = Number(inner.total_used);
  const available = Number(inner.total_available);

  if (!isNaN(granted)) {
    items.push({
      label: '总授予',
      value: `$${toUSD(granted)}`,
      sub: `${granted.toLocaleString()} 内部单位`,
    });
  }
  if (!isNaN(used)) {
    items.push({
      label: '已使用',
      value: `$${toUSD(used)}`,
      sub: `${used.toLocaleString()} 内部单位`,
    });
  }
  if (!isNaN(available)) {
    items.push({
      label: '可用剩余',
      value: `$${toUSD(available)}`,
      sub: `${available.toLocaleString()} 内部单位`,
    });
  }

  if (inner.expires_at !== undefined) {
    const ts = Number(inner.expires_at);
    items.push({
      label: '到期时间',
      value: ts === 0 ? '永不过期' : new Date(ts * 1000).toLocaleDateString('zh-CN'),
    });
  }

  return { items };
}

export function parseOpencode(raw: string): QuotaData {
  const items: QuotaData['items'] = [];

  const extract = (key: string, source: string): string | null => {
    const re = new RegExp(`${key}[:"'\\s]+([^,"'}\\]]+)`, 'i');
    const m = source.match(re);
    return m ? m[1] : null;
  };

  const monthlyStatus = extract('monthlyUsage.*?status', raw);
  const monthlyPercent = extract('monthlyUsage.*?usagePercent', raw);
  const monthlyReset = extract('monthlyUsage.*?resetInSec', raw);

  if (monthlyStatus) {
    items.push({ label: '月用量状态', value: monthlyStatus === 'ok' ? '正常' : monthlyStatus });
  }
  if (monthlyPercent !== null) {
    items.push({ label: '月用量占比', value: `${monthlyPercent}%` });
  }
  if (monthlyReset !== null) {
    const hours = Math.floor(Number(monthlyReset) / 3600);
    items.push({ label: '月用量重置', value: `${hours} 小时后` });
  }

  return { items };
}

export function parseRaw(data: unknown): QuotaData {
  return {
    items: [
      { label: '原始响应', value: JSON.stringify(data, null, 2) },
    ],
  };
}
