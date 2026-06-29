import { PROVIDERS } from '@/lib/providers';
import ProviderDashboard from '@/hooks/useProviders';

export default function Home() {
  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.25em] text-[#d97757] mb-2">
              信号通道
            </p>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#2d2a26]">
              LLM API 仪表盘
            </h1>
          </div>
          <span className="text-[11px] text-[#8c8780] font-mono">
            {PROVIDERS.length} 个提供商
          </span>
        </div>
        <p className="mt-2 text-[13px] text-[#8c8780] max-w-md leading-relaxed">
          管理密钥、测试连通、浏览模型、监控额度——一站式管理所有大模型 API 接入。
        </p>
      </header>

      <ProviderDashboard providers={PROVIDERS} />

      <footer className="mt-16 pt-5 border-t border-[#e8e3dc] flex items-center justify-between text-[11px] text-[#bfb9b0]">
        <span>密钥仅存储在浏览器本地 · 不会上传到任何服务器</span>
        <span className="font-mono">v0.1</span>
      </footer>
    </main>
  );
}
