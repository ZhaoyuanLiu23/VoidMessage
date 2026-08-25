'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type Mode = 'login' | 'register';

export default function AuthForm({ returnTo, signedIn }: { returnTo: string; signedIn: boolean }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      setNotice('两次输入的密码不一致');
      return;
    }
    setSending(true);
    setNotice('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || '请求失败，请重试');
      window.location.replace(returnTo);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '请求失败，请重试');
    } finally {
      setSending(false);
    }
  }

  async function signOut() {
    setSending(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    window.location.replace('/auth');
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setNotice('');
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-frame" aria-hidden="true" />
      <header className="auth-topbar">
        <Link className="auth-back" href={returnTo}><span>←</span> 返回上一页</Link>
        <Link className="auth-brand" href="/" aria-label="VOID MESSAGE 首页">
          <span>V</span><div><strong>VOID MESSAGE</strong><small>PRIVATE ACCESS</small></div>
        </Link>
        <span className="auth-encryption">ENCRYPTED<br />SESSION</span>
      </header>

      <section className="auth-stage">
        <div className="auth-intro">
          <p>PERSONAL EMAIL · ANONYMOUS COLOR</p>
          <h1>留下邮箱，<br /><em>隐藏名字。</em></h1>
          <div className="auth-intro-line"><i /><span>邮箱只用于登录，不会出现在公开聊天中</span></div>
          <div className="auth-card-stack" aria-hidden="true">
            <span className="auth-playing-card left"><i>♠</i><b>NO</b><em>♠</em></span>
            <span className="auth-playing-card center"><i>♥</i><b>NAME</b><em>♥</em></span>
            <span className="auth-playing-card right"><i>♣</i><b>JUST<br />COLOR</b><em>♣</em></span>
          </div>
        </div>

        <div className="auth-panel">
          {signedIn ? (
            <div className="auth-signed-in">
              <span className="auth-success-mark">✓</span>
              <p>SESSION ACTIVE</p>
              <h2>你已经登录</h2>
              <span>公开页面仍只显示匿名颜色，不显示邮箱。</span>
              <Link href={returnTo}>继续进入社区 <b>→</b></Link>
              <button type="button" onClick={() => void signOut()} disabled={sending}>退出当前邮箱</button>
            </div>
          ) : (
            <>
              <div className="auth-panel-heading">
                <p>WELCOME TO THE VOID</p>
                <h2>{mode === 'login' ? '邮箱登录' : '创建匿名身份'}</h2>
              </div>
              <div className="auth-tabs" role="tablist" aria-label="登录方式">
                <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>登录</button>
                <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>注册</button>
              </div>
              <form className="auth-form" onSubmit={submit}>
                <label><span>个人邮箱</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="you@example.com" required /></label>
                <label><span>密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 10 : undefined} maxLength={128} placeholder={mode === 'login' ? '输入你的密码' : '至少 10 位，包含字母和数字'} required /></label>
                {mode === 'register' && <label><span>确认密码</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} maxLength={128} placeholder="再次输入密码" required /></label>}
                <p className="auth-notice" role="status">{notice || (mode === 'register' ? '注册成功后自动生成一种匿名颜色。' : '登录后将回到刚才浏览的房间。')}</p>
                <button className="auth-submit" type="submit" disabled={sending}>{sending ? '请稍候…' : mode === 'login' ? '登录并继续' : '注册并进入'}<span>→</span></button>
              </form>
              <p className="auth-fineprint"><i /> PBKDF2-SHA256 加密密码 · HttpOnly 安全会话 · 不公开邮箱</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

