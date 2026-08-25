import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '使用说明 · VOID MESSAGE',
  description: 'VOID MESSAGE 匿名兴趣社区的使用方法、功能介绍与三分钟视频指南。',
};

const steps = [
  { no: '01', suit: '♠', title: '选择兴趣板块', copy: '从体育、兴趣、科技、艺术、学习、游戏六副牌面中，选中此刻最想聊的方向。' },
  { no: '02', suit: '♥', title: '进入细分房间', copy: '每个板块收纳六个分类。点开一张分类牌，就进入对应的匿名实时讨论房间。' },
  { no: '03', suit: '♣', title: '登录并设定颜色', copy: '使用个人邮箱和密码登录。邮箱不会公开，头像颜色是唯一身份特征，全程不展示昵称。' },
  { no: '04', suit: '♦', title: '输入并发送消息', copy: '在底部输入框写下内容，点击发送。新消息按时间顺序更新，溢出后自动跟随到底部。' },
];

const features = [
  ['NO NAME', '没有昵称与关注关系，让表达先于身份。'],
  ['JUST COLOR', '每位登录用户用一种头像颜色彼此辨认。'],
  ['LIVE FLOW', '消息实时轮询更新，按时间顺序自然向下生长。'],
  ['36 ROOMS', '六个兴趣板块、三十六个分类房间，讨论彼此独立。'],
];

const chapters = [
  ['00:00', '认识 VOID MESSAGE'],
  ['00:24', '选择兴趣板块'],
  ['00:47', '进入细分分类'],
  ['01:10', '登录、颜色与匿名身份'],
  ['01:34', '输入、发送与实时消息'],
  ['02:17', '社区边界与使用建议'],
  ['02:42', '关于创作者 gonna'],
];

export default function GuidePage() {
  return (
    <main className="guide-shell">
      <div className="guide-noise" aria-hidden="true" />
      <div className="guide-frame" aria-hidden="true" />

      <header className="guide-topbar">
        <Link className="guide-back" href="/" aria-label="返回网站首页"><span>←</span> 返回首页</Link>
        <Link className="guide-brand" href="/" aria-label="VOID MESSAGE 首页">
          <span className="guide-brand-mark">V</span>
          <span><strong>VOID MESSAGE</strong><small>FIELD MANUAL · 001</small></span>
        </Link>
        <span className="guide-edition">MMXXVI<br />FIRST EDITION</span>
      </header>

      <section className="guide-hero">
        <div className="guide-hero-copy">
          <p className="guide-kicker">PRIVATE BY DESIGN · USER GUIDE</p>
          <h1>翻牌前，<br /><em>先读规则。</em></h1>
          <p className="guide-lead">这是一份写给第一次进入 VOID MESSAGE 的简短指南。<br />三分钟，了解如何匿名、如何说话，也了解这里为什么存在。</p>
          <div className="guide-creator-line">
            <span>CREATED BY</span><strong>gonna</strong><i />
            <small>会根据用户反馈持续更新功能</small>
          </div>
        </div>
        <div className="guide-deck" aria-hidden="true">
          <span className="guide-orbit" />
          <span className="guide-card guide-card-left"><i>♠</i><b>G</b><em>♠</em></span>
          <span className="guide-card guide-card-center"><i>♥</i><b>V</b><em>♥</em></span>
          <span className="guide-card guide-card-right"><i>♣</i><b>01</b><em>♣</em></span>
          <small>OPEN THE UNKNOWN</small>
        </div>
      </section>

      <section className="guide-video-section" id="video">
        <div className="guide-section-heading">
          <span>01 / VIDEO GUIDE</span><i /><strong>03:00</strong>
        </div>
        <div className="guide-video-frame">
          <div className="guide-video-corner top-left" aria-hidden="true" />
          <div className="guide-video-corner bottom-right" aria-hidden="true" />
          <video className="guide-video" controls playsInline preload="metadata" poster="/guide-poster.png">
            <source src="/void-message-guide-email.mp4" type="video/mp4" />
            <track kind="captions" src="/void-message-guide.vtt" srcLang="zh-CN" label="中文字幕" default />
            你的浏览器暂不支持视频播放，请下载视频后观看。
          </video>
          <div className="guide-video-badge"><span /> AI 中文温柔男声 · 邮箱登录实时演示</div>
        </div>
        <div className="guide-chapters" aria-label="视频章节">
          {chapters.map(([time, title]) => <div key={time}><time>{time}</time><span>{title}</span></div>)}
        </div>
      </section>

      <section className="guide-steps-section">
        <div className="guide-section-heading">
          <span>02 / HOW TO USE</span><i /><strong>四步开始</strong>
        </div>
        <div className="guide-steps">
          {steps.map((step) => (
            <article className="guide-step" key={step.no}>
              <span className="guide-step-no">{step.no}</span>
              <span className="guide-step-suit">{step.suit}</span>
              <div><h2>{step.title}</h2><p>{step.copy}</p></div>
              <span className="guide-step-arrow">↘</span>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-feature-section">
        <div className="guide-section-heading">
          <span>03 / WHAT MAKES IT DIFFERENT</span><i /><strong>核心功能</strong>
        </div>
        <div className="guide-features">
          {features.map(([title, copy], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h2>{title}</h2><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="guide-notes">
        <div className="guide-note-card red">
          <span>♥</span><div><small>BE SERIOUS, EVEN ANONYMOUS</small><h2>匿名，也可以认真地说话。</h2><p>尊重不同观点，不发布隐私、攻击、违法或让他人不适的内容。颜色可以隐藏名字，但不该隐藏善意。</p></div>
        </div>
        <div className="guide-note-card">
          <span>♠</span><div><small>ABOUT THE CREATOR</small><h2>创作者：我，gonna。</h2><p>这是一个仍在生长的兴趣社区。我会认真阅读使用反馈，持续修复体验、补充分类并更新功能。</p></div>
        </div>
      </section>

      <section className="guide-cta">
        <p>THE NEXT MESSAGE COULD BE YOURS.</p>
        <h2>翻开一张牌，<br />去遇见同频的人。</h2>
        <Link href="/">进入 VOID MESSAGE <span>→</span></Link>
        <div className="guide-cta-suits" aria-hidden="true"><span>♠</span><span>♥</span><span>♣</span><span>♦</span></div>
      </section>

      <footer className="guide-footer"><span>VOID MESSAGE · USER GUIDE</span><span>CREATED &amp; CARED FOR BY gonna</span></footer>
    </main>
  );
}

