'use client';

import { useState, useCallback } from 'react';

interface ApiKeyInputProps {
  value: string;
  onChange: (key: string) => void;
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);
  const [pwd, setPwd] = useState('');
  const [checking, setChecking] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const verify = useCallback(async (): Promise<boolean> => {
    if (verified) return true;
    if (!pwd.trim()) { setPwdError('请输入密码'); return false; }
    setChecking(true);
    setPwdError('');
    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        setVerified(true);
        setPwd('');
        return true;
      }
      setPwdError(data.error || '密码错误');
      return false;
    } catch {
      setPwdError('验证请求失败');
      return false;
    } finally {
      setChecking(false);
    }
  }, [verified, pwd]);

  const handleToggle = useCallback(async () => {
    if (!verified && !(await verify())) return;
    setVisible(!visible);
  }, [visible, verified, verify]);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    if (!verified && !(await verify())) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value, verified, verify]);

  const masked = value ? value.slice(0, 8) + '···' + value.slice(-4) : '';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-[#8c8780]">
          API 密钥
        </span>
        {value && (
          <span className="text-[12px] font-mono text-[#8c8780] select-all">
            {masked}
          </span>
        )}
      </div>
      <div className="flex rounded-md overflow-hidden border border-[#e4ded6] bg-white
                      focus-within:border-[#bfb9b0] focus-within:ring-1 focus-within:ring-[#d9d4cc]
                      transition-all">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="sk-..."
          spellCheck={false}
          className="flex-1 bg-transparent px-4 py-2.5 text-[14px] text-[#2d2a26]
                     placeholder:text-[#bfb9b0]
                     focus:outline-none font-mono"
          style={visible ? undefined : ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)}
        />
        <button
          type="button"
          onClick={handleToggle}
          className="px-2.5 text-[#bfb9b0] hover:text-[#2d2a26] transition-colors shrink-0
                     border-l border-[#f0ece6]"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {visible ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="px-3.5 text-[12px] font-medium text-[#8c8780]
                     hover:text-[#d97757] disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors shrink-0 border-l border-[#f0ece6]"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {!verified && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setPwdError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleToggle(); }}
            placeholder="输入密码以查看/复制…"
            autoComplete="off"
            name="pwd"
            className="flex-1 rounded-sm border border-[#e4ded6] bg-white px-3 py-1.5
                       text-[13px] text-[#2d2a26] placeholder:text-[#bfb9b0]
                       focus:border-[#bfb9b0] focus:outline-none focus:ring-1 focus:ring-[#d9d4cc]
                       transition-all"
          />
          {pwdError && (
            <span className="text-[12px] text-[#c4554d] shrink-0">{pwdError}</span>
          )}
          {checking && (
            <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#e4ded6] border-t-[#d97757] animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
