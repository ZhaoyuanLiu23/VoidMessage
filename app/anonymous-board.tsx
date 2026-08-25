'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Category = { id: string; name: string; icon: string; note: string };
type InterestBoard = {
  id: string;
  name: string;
  suit: string;
  code: string;
  accent: string;
  note: string;
  slogan: string;
  categories: readonly Category[];
};

const interestBoards = [
  {
    id: 'sports', name: '体育', suit: '♠', code: 'SPADE / 01', accent: '#ef3e4f',
    note: '热爱、训练与每一次突破', slogan: '身体记得每一次坚持，也记得有人与你并肩。',
    categories: [
      { id: 'running', name: '中长跑', icon: '↗', note: '配速、耐力与赛道故事' },
      { id: 'badminton', name: '羽毛球', icon: '◒', note: '挥拍之间找到默契' },
      { id: 'yoga', name: '瑜伽', icon: '◎', note: '呼吸、平衡与身体觉察' },
      { id: 'fitness', name: '健身', icon: '◇', note: '训练计划与持续进阶' },
      { id: 'weight-loss', name: '减肥', icon: '↘', note: '健康改变，不独自硬撑' },
      { id: 'basketball', name: '篮球', icon: '◉', note: '球场、战术与热血瞬间' },
    ],
  },
  {
    id: 'interests', name: '兴趣', suit: '♥', code: 'HEART / 02', accent: '#ff315c',
    note: '找到让你眼睛发亮的同类', slogan: '世界很大，偏爱会让陌生人立刻拥有共同语言。',
    categories: [
      { id: 'astrology', name: '星座', icon: '✦', note: '星盘、性格与宇宙暗号' },
      { id: 'tarot', name: '塔罗', icon: '☾', note: '牌面之外，看见内心' },
      { id: 'mbti', name: 'MBTI', icon: 'M', note: '十六种表达，一样真诚' },
      { id: 'celebrity', name: '明星', icon: '☆', note: '作品、舞台与闪光时刻' },
      { id: 'travel', name: '旅游', icon: '⌁', note: '目的地、路线与远方见闻' },
      { id: 'pets', name: '宠物', icon: '∴', note: '毛孩子与治愈日常' },
    ],
  },
  {
    id: 'technology', name: '科技', suit: '♣', code: 'CLUB / 03', accent: '#28c4d8',
    note: '讨论正在发生的未来', slogan: '好奇心不必有边界，让复杂的未来在讨论里变得清晰。',
    categories: [
      { id: 'robotics', name: '机器人', icon: '⌘', note: '机械、控制与智能协作' },
      { id: 'chips', name: '芯片', icon: '▦', note: '架构、制造与算力浪潮' },
      { id: 'ai', name: '人工智能', icon: 'AI', note: '模型、应用与未来想象' },
      { id: 'astrophysics', name: '天体物理', icon: '◌', note: '恒星、引力与深空谜题' },
      { id: 'quantum', name: '量子力学', icon: 'ψ', note: '微观世界的奇异规则' },
      { id: 'theory', name: '理论探究', icon: '∞', note: '追问规律与底层逻辑' },
    ],
  },
  {
    id: 'arts', name: '艺术', suit: '♦', code: 'DIAMOND / 04', accent: '#c768ff',
    note: '感受、表达与灵感共振', slogan: '有些情绪不适合解释，适合被听见、被看见、被创造。',
    categories: [
      { id: 'music', name: '音乐', icon: '♪', note: '旋律、现场与私藏歌单' },
      { id: 'painting', name: '绘画', icon: '◩', note: '线条、色彩与视觉表达' },
      { id: 'dance', name: '舞蹈', icon: '✳', note: '身体跟随节拍说话' },
      { id: 'photography', name: '摄影', icon: '◫', note: '用光影保留瞬间' },
      { id: 'film', name: '电影', icon: '▻', note: '镜头、叙事与银幕余韵' },
      { id: 'design', name: '设计', icon: '△', note: '审美、秩序与创意方法' },
    ],
  },
  {
    id: 'study', name: '学习', suit: 'A', code: 'ACE / 05', accent: '#e8b84a',
    note: '把漫长进步变成彼此陪伴', slogan: '答案很重要，寻找答案时遇见的思路同样珍贵。',
    categories: [
      { id: 'math', name: '数学', icon: '∑', note: '公式、证明与解题思路' },
      { id: 'ielts', name: '雅思', icon: 'Aa', note: '听说读写与备考同行' },
      { id: 'cet', name: '四六级', icon: 'CET', note: '词汇、真题与冲刺计划' },
      { id: 'coding', name: '编程', icon: '</>', note: '代码、项目与灵感分享' },
      { id: 'physics', name: '物理', icon: 'φ', note: '理解世界运行的方式' },
      { id: 'chemistry', name: '化学', icon: '⚗', note: '反应、实验与物质奥秘' },
    ],
  },
  {
    id: 'games', name: '游戏', suit: 'J', code: 'JOKER / 06', accent: '#5b7dff',
    note: '交换攻略，也分享快乐', slogan: '胜负之外，还有共同经历过的世界与值得复盘的故事。',
    categories: [
      { id: 'genshin', name: '原神', icon: '✧', note: '提瓦特见闻与版本日常' },
      { id: 'honor-of-kings', name: '王者荣耀', icon: '♛', note: '阵容、上分与峡谷故事' },
      { id: 'delta-force', name: '三角洲', icon: 'Δ', note: '战术、装备与行动复盘' },
      { id: 'minecraft', name: '我的世界', icon: '▣', note: '建造、冒险与无限创造' },
      { id: 'league', name: '英雄联盟', icon: 'L', note: '英雄、版本与团队配合' },
      { id: 'indie-games', name: '独立游戏', icon: '●', note: '发现小而特别的世界' },
    ],
  },
] as const satisfies readonly InterestBoard[];

const allCategories = interestBoards.flatMap((board) => board.categories.map((category) => ({ ...category, boardId: board.id })));

const identityColors = [
  '#ff385c', '#ff8a00', '#ffd60a', '#24d66c', '#00c2ff', '#3568ff',
  '#7c4dff', '#c83cff', '#ff3d9a', '#00d4b4', '#e84c3d', '#a3e635',
];

type Message = {
  id: number;
  body: string;
  color: string;
  createdAt: number;
  mine: boolean;
};

type ApiError = Error & { status?: number };

const POLL_INTERVAL_MS = 1200;
const REQUEST_TIMEOUT_MS = 10000;

function isBoardId(value: string | null) {
  return interestBoards.some((board) => board.id === value);
}

function findCategory(value: string | null) {
  return allCategories.find((category) => category.id === value);
}

function sortAndDedupeMessages(items: Message[]) {
  const unique = new Map<number, Message>();
  items.forEach((message) => unique.set(message.id, message));
  return [...unique.values()].sort((left, right) => left.createdAt - right.createdAt || left.id - right.id);
}

async function requestJson<T>(input: string, init: RequestInit = {}, externalSignal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromOutside = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromOutside, { once: true });
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, { ...init, cache: 'no-store', signal: controller.signal });
    const text = await response.text();
    const data = (text ? JSON.parse(text) : {}) as T & { error?: string };
    if (!response.ok) {
      const error = new Error(data.error || `请求失败（${response.status}）`) as ApiError;
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (externalSignal?.aborted) throw new DOMException('请求已取消', 'AbortError');
    if (timedOut) throw new Error('连接超时，请重试');
    if (error instanceof SyntaxError || error instanceof TypeError) throw new Error('网络连接中断，请重试');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromOutside);
  }
}

function Avatar({ color, small = false }: { color: string; small?: boolean }) {
  return <span className={small ? 'mini-avatar' : 'bat-avatar'} style={{ '--avatar-color': color } as React.CSSProperties} aria-hidden="true"><i /></span>;
}

function timeLabel(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp * 1000));
}

export default function AnonymousBoard({ signedIn }: { signedIn: boolean }) {
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [identityColor, setIdentityColor] = useState('#7c4dff');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);
  const latestMessageIdRef = useRef(0);
  const pollAbortRef = useRef<AbortController | null>(null);
  const activeBoard = useMemo(() => interestBoards.find((board) => board.id === activeBoardId), [activeBoardId]);
  const activeCategory = useMemo(() => activeBoard?.categories.find((category) => category.id === activeCategoryId), [activeBoard, activeCategoryId]);
  const activeBoardIndex = activeBoard ? interestBoards.findIndex((board) => board.id === activeBoard.id) : -1;
  const activeCategoryIndex = activeBoard && activeCategory ? activeBoard.categories.findIndex((category) => category.id === activeCategory.id) : -1;
  const returnTo = activeCategory && activeBoard ? `/?board=${activeBoard.id}&community=${activeCategory.id}` : activeBoard ? `/?board=${activeBoard.id}` : '/';
  const loginHref = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    const syncViewFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const boardParam = params.get('board');
      const category = findCategory(params.get('community'));
      const resolvedBoardId = category?.boardId ?? (isBoardId(boardParam) ? boardParam : null);
      setActiveBoardId(resolvedBoardId);
      setActiveCategoryId(category && category.boardId === resolvedBoardId ? category.id : null);
    };
    syncViewFromUrl();
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, []);

  useEffect(() => {
    activeRef.current = activeCategoryId;
  }, [activeCategoryId]);

  useEffect(() => {
    if (!signedIn) return;
    requestJson<{ color?: string }>('/api/session')
      .then((data: { color?: string }) => data.color && setIdentityColor(data.color))
      .catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    if (!paletteOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setPaletteOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPaletteOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [paletteOpen]);

  const loadMessages = useCallback(async (communityId: string, showLoading = false) => {
    if (showLoading) setLoading(true);
    const controller = new AbortController();
    pollAbortRef.current = controller;
    try {
      const after = showLoading || latestMessageIdRef.current === 0 ? '' : `&after=${latestMessageIdRef.current}`;
      const data = await requestJson<{ messages: Message[] }>(`/api/messages?community=${encodeURIComponent(communityId)}${after}`, {}, controller.signal);
      if (activeRef.current !== communityId) return;
      setMessages((current) => {
        const next = sortAndDedupeMessages(showLoading ? data.messages : [...current, ...data.messages]);
        latestMessageIdRef.current = next.reduce((latest, message) => Math.max(latest, message.id), 0);
        return next;
      });
      setNotice('');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (activeRef.current === communityId) setNotice(error instanceof Error ? error.message : '连接中断，正在重新尝试…');
    } finally {
      if (pollAbortRef.current === controller) pollAbortRef.current = null;
      if (showLoading && activeRef.current === communityId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;
    activeRef.current = activeCategoryId;
    latestMessageIdRef.current = 0;
    queueMicrotask(() => {
      if (activeRef.current !== activeCategoryId) return;
      setMessages([]);
      setNotice('');
    });
    let stopped = false;
    let timer: number | undefined;
    const poll = async (initial = false) => {
      await loadMessages(activeCategoryId, initial);
      if (!stopped) timer = window.setTimeout(() => void poll(false), POLL_INTERVAL_MS);
    };
    void poll(true);
    window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      pollAbortRef.current?.abort();
    };
  }, [activeCategoryId, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!activeCategory || !activeBoard) return;
    if (!signedIn) {
      window.location.href = `/auth?returnTo=${encodeURIComponent(`/?board=${activeBoard.id}&community=${activeCategory.id}`)}`;
      return;
    }
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setNotice('');
    try {
      const data = await requestJson<{ message: Message; error?: string }>('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ community: activeCategory.id, body }),
      });
      if (!data.message) throw new Error(data.error ?? '消息发送失败');
      if (activeRef.current === activeCategory.id) {
        setMessages((current) => {
          const next = sortAndDedupeMessages([...current, data.message]);
          latestMessageIdRef.current = Math.max(latestMessageIdRef.current, data.message.id);
          return next;
        });
      }
      setDraft('');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        window.location.href = `/auth?returnTo=${encodeURIComponent(`/?board=${activeBoard.id}&community=${activeCategory.id}`)}`;
        return;
      }
      setNotice(error instanceof Error ? error.message : '消息发送失败，请重试');
    } finally {
      setSending(false);
    }
  }

  async function changeColor(color: string) {
    const previous = identityColor;
    setIdentityColor(color);
    setMessages((current) => current.map((message) => message.mine ? { ...message, color } : message));
    try {
      await requestJson<{ color: string }>('/api/session', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ color }),
      });
    } catch {
      setIdentityColor(previous);
      setNotice('颜色没有保存，请稍后再试');
    }
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    window.location.href = '/';
  }

  function openBoard(boardId: string) {
    window.history.pushState(null, '', `/?board=${boardId}`);
    setActiveBoardId(boardId);
    setActiveCategoryId(null);
  }

  function openCategory(boardId: string, categoryId: string) {
    window.history.pushState(null, '', `/?board=${boardId}&community=${categoryId}`);
    setActiveBoardId(boardId);
    setActiveCategoryId(categoryId);
  }

  function goHome() {
    window.history.pushState(null, '', '/');
    setActiveBoardId(null);
    setActiveCategoryId(null);
  }

  function goBack() {
    if (activeCategory && activeBoard) {
      window.history.pushState(null, '', `/?board=${activeBoard.id}`);
      setActiveCategoryId(null);
    } else if (activeBoard) {
      goHome();
    } else {
      window.history.back();
    }
  }

  return (
    <main className="site-shell">
      <div className="noise" aria-hidden="true" />
      <div className="frame-line" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-two" aria-hidden="true" />
      <header className="topbar">
        <button className="back-button" type="button" onClick={goBack} aria-label="返回上一页">
          <span className="back-icon" aria-hidden="true">←</span><span>返回上一页</span>
        </button>
        <button className="brand-lockup" type="button" onClick={goHome} aria-label="返回 VOID MESSAGE 首页">
          <span className="brand-sigil" aria-hidden="true">V</span>
          <span className="brand-copy"><strong>VOID MESSAGE</strong><small>ANONYMOUS SOCIAL</small></span>
        </button>
        {signedIn ? (
          <div className="profile-area" ref={profileRef}>
            <button className="profile-button" type="button" onClick={() => setPaletteOpen((value) => !value)} aria-expanded={paletteOpen} aria-label="切换匿名身份颜色" title="点击切换身份颜色">
              <Avatar color={identityColor} />
            </button>
            {paletteOpen && (
              <div className="palette-popover">
                <div><strong>你的匿名颜色</strong><small>头像颜色就是你的身份</small></div>
                <div className="color-grid">
                  {identityColors.map((color) => <button key={color} type="button" aria-label={`选择颜色 ${color}`} className={color === identityColor ? 'color-dot selected' : 'color-dot'} style={{ backgroundColor: color }} onClick={() => void changeColor(color)} />)}
                </div>
                <button className="logout-link" type="button" onClick={() => void signOut()}>退出登录</button>
              </div>
            )}
          </div>
        ) : (
          <a className="login-button" href={loginHref}>邮箱登录</a>
        )}
      </header>

      {activeCategory && activeBoard ? (
        <section className="chat-view" aria-label={`${activeCategory.name}社区聊天`} style={{ '--board-accent': activeBoard.accent } as React.CSSProperties}>
          <div className="chat-heading">
            <span className="community-icon large">{activeCategory.icon}</span>
            <div><p>{activeBoard.name}板块 · ROOM {String(activeBoardIndex + 1).padStart(2, '0')}-{String(activeCategoryIndex + 1).padStart(2, '0')}</p><h1>{activeCategory.name}</h1></div>
            <span className="online-mark">实时更新</span>
          </div>
          <div className="message-list" aria-live="polite">
            <div className="date-divider"><span>现在</span></div>
            {loading ? (
              <div className="chat-state"><span className="loading-ring" />正在进入社区…</div>
            ) : messages.length === 0 ? (
              <div className="chat-state empty"><span className="empty-bubble" />这里还很安静<br /><small>说第一句话吧</small></div>
            ) : messages.map((message) => (
              <article className={message.mine ? 'message-row mine' : 'message-row'} key={message.id}>
                <Avatar color={message.color} small />
                <div className="message-stack"><p className="message-bubble">{message.body}</p><time>{timeLabel(message.createdAt)}</time></div>
              </article>
            ))}
            <div ref={endRef} />
          </div>
          <div className="composer-wrap">
            {notice && <p className="notice" role="status">{notice}</p>}
            <form className="composer" onSubmit={sendMessage}>
              <span className={draft ? 'composer-dot typing' : 'composer-dot'} />
              <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} autoComplete="off" placeholder="请输入文字" aria-label="输入匿名留言" />
              <button type="submit" disabled={sending || (!draft.trim() && signedIn)}>{signedIn ? (sending ? '发送中' : '发送') : '邮箱登录后发送'}</button>
            </form>
          </div>
        </section>
      ) : activeBoard ? (
        <section className="category-view" style={{ '--board-accent': activeBoard.accent } as React.CSSProperties}>
          <div className="board-hero">
            <div className="board-hero-copy">
              <p className="board-code">{activeBoard.code} · INTEREST DECK</p>
              <h1><span>{activeBoard.name}</span>兴趣场</h1>
              <p>{activeBoard.slogan}</p>
              <div className="board-meta"><span>06 个分类</span><i /><span>匿名讨论</span><i /><span>实时更新</span></div>
            </div>
            <div className="hero-playing-card" aria-hidden="true">
              <span className="card-corner"><b>{activeBoard.suit}</b><small>{String(activeBoardIndex + 1).padStart(2, '0')}</small></span>
              <strong>{activeBoard.suit}</strong>
              <span className="card-corner bottom"><b>{activeBoard.suit}</b><small>VOID</small></span>
            </div>
          </div>
          <div className="category-section">
            <div className="section-label"><span>选择分类</span><span className="section-line" /><span>{activeBoard.name} · 06</span></div>
            <div className="category-grid">
              {activeBoard.categories.map((category, index) => (
                <button key={category.id} type="button" className="category-card" style={{ '--card-order': index } as React.CSSProperties} onClick={() => openCategory(activeBoard.id, category.id)}>
                  <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-copy"><strong>{category.name}</strong><small>{category.note}</small></span>
                  <span className="category-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </div>
          <div className="board-promo"><span>{activeBoard.suit}</span><p><strong>不需要完美开场。</strong>从一个真正感兴趣的话题开始，就会有人接住你的表达。</p><small>NO NAME · JUST COLOR</small></div>
        </section>
      ) : (
        <section className="home-view">
          <div className="hero-copy">
            <div className="hero-kicker"><p className="eyebrow">NO NAME, JUST COLOR.</p><span>EST. MMXXVI</span></div>
            <h1>匿名，也可以<br />认真地说话。</h1>
            <div className="hero-foot">
              <p className="intro">先选择一个兴趣板块，再走进属于你的分类。<br className="desktop-only" />没有昵称，只用一种颜色表达此刻的你。</p>
              <span className="privacy-seal" aria-hidden="true"><i />PRIVATE BY DESIGN</span>
            </div>
          </div>
          <div className="poker-stage" aria-label="三张暗黑扑克牌">
            <span className="poker-halo" />
            <span className="poker-card poker-left"><i>♠</i><b>V</b><em>♠</em></span>
            <span className="poker-card poker-center red"><i>♥</i><b>O</b><em>♥</em></span>
            <span className="poker-card poker-right"><i>♣</i><b>I</b><em>♣</em></span>
            <span className="poker-caption">CHOOSE YOUR SUIT</span>
          </div>
          <div className="community-section">
            <div className="section-label"><span>选择兴趣板块</span><span className="section-line" /><span>06 副牌面</span></div>
            <div className="board-grid">
              {interestBoards.map((board, index) => (
                <button key={board.id} type="button" className="board-card" style={{ '--board-accent': board.accent, '--card-order': index } as React.CSSProperties} onClick={() => openBoard(board.id)}>
                  <span className="board-card-top"><i>{board.suit}</i><small>{String(index + 1).padStart(2, '0')}</small></span>
                  <span className="board-card-copy"><small>{board.code}</small><strong>{board.name}</strong><em>{board.note}</em></span>
                  <span className="board-card-count">06 <small>CATEGORIES</small></span>
                  <span className="board-card-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
          <button className="quick-message" type="button" onClick={() => openBoard('interests')}>
            <span className="quick-icon" aria-hidden="true" /><span>匿名留言</span><small>翻开一张兴趣牌，开始认真地说话</small><span className="quick-arrow" aria-hidden="true">→</span>
          </button>
          <a className="guide-entrance" href="/guide">
            <span className="guide-entrance-index">GUIDE / 001</span>
            <span className="guide-entrance-copy"><strong>第一次来？先看使用说明</strong><small>三分钟视频 · 登录、颜色身份、实时消息完整介绍</small></span>
            <span className="guide-entrance-suit" aria-hidden="true">♠</span>
            <span className="guide-entrance-arrow" aria-hidden="true">↗</span>
          </a>
        </section>
      )}
      <footer>VOID MESSAGE · 匿名兴趣社区</footer>
    </main>
  );
}

