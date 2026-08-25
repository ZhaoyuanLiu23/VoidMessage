<div align="center">

# VOID MESSAGE

### 匿名，也可以认真地说话。

一个以颜色代替昵称、以兴趣房间组织对话的实时匿名社区。

[![Vinext](https://img.shields.io/badge/Vinext-1.0-090909?style=for-the-badge)](https://github.com/cloudflare/vinext)
[![React](https://img.shields.io/badge/React-19-b4141b?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-171717?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-b4141b?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![D1](https://img.shields.io/badge/D1-SQLite-171717?style=for-the-badge&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)

![VOID MESSAGE 黑红暗黑扑克牌主题预览](public/og.png)

[在线体验](https://void-message.priyankapatel2624.chatgpt.site) ·
[三分钟产品演示](public/void-message-guide-email.mp4) ·
[使用指南](https://void-message.priyankapatel2624.chatgpt.site/guide) ·
[系统架构](docs/ARCHITECTURE.md) ·
[安全设计](docs/SECURITY.md)

</div>

---

## 项目定位

VOID MESSAGE 不是传统“注册昵称—经营人设”的社交产品。它将公开身份压缩为一种颜色，让用户先选择真正关心的话题，再进入独立房间交流。

> **Private by design**：邮箱只负责认证，颜色只负责表达，公开消息不携带昵称和邮箱。

| 产品目标 | 工程实现 |
| --- | --- |
| 降低匿名交流的表演压力 | 不设置昵称、关注数、个人主页与公开邮箱 |
| 让陌生人仍可被稳定辨认 | 登录时分配颜色身份，统一使用蝙蝠侠轮廓头像 |
| 多人消息互不干扰 | 每个房间独立查询，按服务端消息 ID 与时间稳定排序 |
| 新消息及时抵达 | 首屏拉取最近消息，之后使用增量游标持续同步 |
| 保持暗黑主题的高级感 | 黑灰基底、克制暗红、镂空扑克牌动效与响应式排版 |

## 产品路径

~~~mermaid
flowchart LR
    A[邮箱注册或登录] --> B[获得匿名颜色身份]
    B --> C[选择六大兴趣板块]
    C --> D[进入细分讨论房间]
    D --> E[发送匿名消息]
    E --> F[按时间增量同步]
    F --> D
~~~

六大板块共包含 36 个讨论房间：

- **体育**：中长跑、羽毛球、瑜伽、健身、减肥、篮球
- **兴趣**：星座、塔罗、MBTI、明星、旅游、宠物
- **科技**：机器人、芯片、人工智能、天体物理、量子力学、理论探究
- **艺术**：音乐、绘画、舞蹈、摄影、电影、设计
- **学习**：数学、雅思、四六级、编程、物理、化学
- **游戏**：原神、王者荣耀、三角洲、我的世界、英雄联盟、独立游戏

## 核心竞争力

### 01 · 颜色身份系统

服务端为每个账号保存一种受控颜色，客户端只接收消息展示所需的最小字段。邮箱、密码摘要与会话令牌不会进入公开消息响应，实现“可辨认，但不过度暴露”。

### 02 · 稳定的实时消息顺序

首次进入房间只加载最近 100 条消息；后续请求携带最后一条消息 ID，仅获取新增内容。查询同时使用 **created_at** 与 **id** 保持稳定顺序，避免多用户并发时重复、跳动或彼此覆盖。

### 03 · 服务端安全边界

密码使用 **PBKDF2-HMAC-SHA256**、随机盐和 210,000 次迭代生成摘要；会话使用 32 字节随机令牌，数据库只保存 SHA-256 摘要。认证 Cookie 采用 **HttpOnly**、**SameSite=Lax**，HTTPS 环境启用 **Secure**。

### 04 · 完整产品交付

仓库包含产品页面、邮箱认证、D1 数据迁移、消息 API、响应式设计、使用文档、中文字幕与三分钟温柔男声产品演示，可直接用于继续开发、评审与部署。

## 系统架构

~~~mermaid
flowchart TB
    UI[React 19 / Vinext UI]
    AUTH[Auth API]
    MSG[Message API]
    SESSION[Session Guard]
    D1[(Cloudflare D1)]
    WORKER[Cloudflare Worker]

    UI -->|register / login / logout| AUTH
    UI -->|initial + cursor polling| MSG
    AUTH --> SESSION
    MSG --> SESSION
    SESSION --> D1
    AUTH --> D1
    MSG --> D1
    WORKER --> UI
    WORKER --> AUTH
    WORKER --> MSG
~~~

更完整的边界、数据流和设计决策见 [架构说明](docs/ARCHITECTURE.md)。

## 技术栈

| 层级 | 技术 | 用途 |
| --- | --- | --- |
| UI | React 19、TypeScript、CSS | 页面状态、交互、暗黑视觉系统与响应式布局 |
| 应用框架 | Vinext / Next.js 兼容路由 | React Server Components、路由与 API handlers |
| 边缘运行时 | Cloudflare Workers | 低延迟请求处理与静态资源交付 |
| 数据库 | Cloudflare D1 / SQLite | 用户、会话和房间消息持久化 |
| 数据访问 | Drizzle ORM | 类型安全 schema、查询与迁移 |
| 密码学 | Web Crypto API | PBKDF2、SHA-256、随机盐和会话令牌 |
| 部署 | OpenAI Sites | 构建、D1 绑定与线上发布 |

## API 概览

| Method | Endpoint | 说明 |
| --- | --- | --- |
| **POST** | **/api/auth/register** | 创建邮箱账号并建立匿名会话 |
| **POST** | **/api/auth/login** | 校验密码并轮换会话 |
| **POST** | **/api/auth/logout** | 注销当前会话 |
| **GET** | **/api/session** | 返回当前匿名颜色身份 |
| **PATCH** | **/api/session** | 更新服务端受控颜色身份 |
| **GET** | **/api/messages?community=...&after=...** | 首次或增量获取房间消息 |
| **POST** | **/api/messages** | 向指定房间发送消息 |

消息公开结构只包含 **id**、**body**、**color**、**createdAt** 和 **mine**。

## 本地运行

环境要求：Node.js 22.13+ 与 pnpm。

~~~bash
pnpm install
pnpm dev
~~~

默认访问 <code>http://localhost:3000</code>。生产构建与本地预览：

~~~bash
pnpm build
pnpm start
~~~

生成数据库迁移：

~~~bash
pnpm db:generate
~~~

部署前的环境、D1 绑定和迁移步骤见 [部署指南](docs/DEPLOYMENT.md)。

## 项目结构

~~~text
VoidMessage/
├─ app/                  页面、邮箱认证、消息接口与视觉系统
├─ db/                   D1 查询层与 Drizzle 数据结构
├─ drizzle/              SQLite 迁移
├─ public/               品牌图、三分钟视频、字幕与社交预览
├─ docs/                 产品、架构、安全和部署文档
├─ .github/              Issue 与 Pull Request 模板
├─ .openai/hosting.json  Sites 托管配置
└─ README.md             项目展示与开发入口
~~~

## 文档中心

- [产品与交互说明](docs/PRODUCT.md)
- [系统架构与数据流](docs/ARCHITECTURE.md)
- [认证、隐私与安全设计](docs/SECURITY.md)
- [部署与发布指南](docs/DEPLOYMENT.md)
- [协作与提交规范](CONTRIBUTING.md)
- [三分钟讲解视频](public/void-message-guide-email.mp4) / [中文字幕](public/void-message-guide.vtt)

## Roadmap

- [x] 六大板块与 36 个兴趣房间
- [x] 邮箱注册、登录、退出与颜色身份
- [x] 多房间增量消息同步和自动滚动
- [x] 三分钟站内视频指南与中文字幕
- [ ] 邮箱验证与安全找回密码
- [ ] WebSocket / Durable Objects 实时通道
- [ ] 举报、限流观测与内容治理后台
- [ ] PWA 安装、消息提醒与无障碍审计

## 创作者

由 **gonna** 设计与开发。项目会根据真实用户反馈持续更新功能、兴趣分类、安全边界与使用体验。

<div align="center">

**VOID MESSAGE · Speak freely. Stay undefined.**

</div>

