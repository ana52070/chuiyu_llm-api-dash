import { NextResponse } from 'next/server';

export async function GET() {
  const result: Record<string, unknown> = {};

  const raw = process.env.LLM_API_KEYS;
  if (raw) {
    try {
      result.apiKeys = JSON.parse(raw);
    } catch {
      result.error = 'LLM_API_KEYS 格式错误，应为 JSON 对象';
    }
  }

  result.ocCookie = process.env.OPENCODE_COOKIE || '';
  result.ocServerId = process.env.OPENCODE_SERVER_ID || '';

  return NextResponse.json(result);
}
