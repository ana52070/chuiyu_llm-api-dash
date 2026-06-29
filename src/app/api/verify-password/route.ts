import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const target = process.env.DASHBOARD_PASSWORD;
    if (!target) {
      return NextResponse.json({ ok: false, error: '未配置 DASHBOARD_PASSWORD' });
    }
    if (password === target) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: '密码错误' });
  } catch {
    return NextResponse.json({ ok: false, error: '请求无效' }, { status: 400 });
  }
}
