import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, method, apiType, apiKey, body, authType, customHeaders } =
      await request.json();

    if (!url || !method || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: url, method, apiKey' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const effectiveApiType = authType || apiType;
    if (effectiveApiType === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (effectiveApiType === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Proxy request failed';
    const isTimeout = message.includes('aborted') || message.includes('timeout');
    return NextResponse.json(
      { error: isTimeout ? 'Request timed out' : message, ok: false },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
