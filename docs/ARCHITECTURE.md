# VOID MESSAGE 系统架构

## 1. 设计目标

VOID MESSAGE 需要同时满足三个约束：公开层不泄露账号身份、多房间消息互不串流、多用户并发时仍保持稳定时间顺序。系统因此采用“账号认证域”和“公开消息域”分离的边缘应用架构。

## 2. 运行时组成

| 组件 | 职责 |
| --- | --- |
| React / Vinext 客户端 | 板块选择、房间聊天、输入状态、增量轮询与自动滚动 |
| Auth API | 注册、登录、退出、身份恢复、限流与 Cookie 管理 |
| Message API | 房间校验、消息写入、首次加载与游标增量查询 |
| Session Guard | 读取 Cookie、哈希令牌、校验有效期并解析用户 |
| Cloudflare D1 | 保存 users、sessions、messages 三类持久数据 |
| Cloudflare Worker | 在边缘运行页面与 API，绑定 D1 数据库 |

## 3. 请求数据流

~~~mermaid
sequenceDiagram
    participant C as Browser
    participant A as Auth API
    participant M as Message API
    participant D as D1

    C->>A: POST /api/auth/login
    A->>D: 查询用户并校验密码摘要
    A->>D: 写入会话令牌摘要
    A-->>C: HttpOnly session cookie + color
    C->>M: GET /api/messages?community=fitness
    M->>D: 校验会话与房间，读取最近 100 条
    M-->>C: 最小公开消息结构
    loop Incremental polling
        C->>M: GET community + after=lastId
        M->>D: WHERE id > after ORDER BY created_at, id
        M-->>C: 仅返回新增消息
    end
~~~

## 4. 消息顺序与隔离

- community 参数必须通过服务端白名单，防止任意频道写入。
- 首次加载查询最近 100 条，数据库降序读取后在响应前恢复正序。
- 增量加载使用最后一条消息 ID 作为游标，只读取 **id > after** 的记录。
- 结果使用 **created_at ASC, id ASC** 排序；相同时间戳仍由自增 ID 决定稳定先后。
- 客户端按消息 ID 合并，避免轮询重叠造成重复渲染。
- 每次查询都携带 community 条件，不同社区的数据流相互隔离。

当前实现采用轻量轮询，适合项目早期用户规模。高并发阶段可迁移至 WebSocket 与 Durable Objects，由单房间对象维护连接和广播顺序。

## 5. 数据模型

~~~mermaid
erDiagram
    ACCOUNTS ||--|| USERS : owns_identity
    ACCOUNTS ||--o{ AUTH_SESSIONS : owns
    USERS ||--o{ MESSAGES : sends

    ACCOUNTS {
        text user_id PK
        text email UK
        text password_hash
        integer created_at
        integer updated_at
    }
    USERS {
        text user_id PK
        text color
        integer created_at
        integer updated_at
    }
    AUTH_SESSIONS {
        text token_hash PK
        text user_id FK
        integer expires_at
        integer created_at
    }
    MESSAGES {
        integer id PK
        text user_id FK
        text community
        text body
        integer created_at
    }
~~~

## 6. 关键设计决策

### 颜色属于账号，而不是单条消息

邮箱凭据保存在 accounts，颜色身份保存在 users。两者通过同一个不可公开的 user_id 关联，确保同一账号跨房间保持一致辨识；公开响应只返回颜色，不返回 user_id 或邮箱。

### 服务端时间是唯一顺序来源

客户端时间可能漂移或被修改。消息创建时间和 ID 均由服务端数据层产生，UI 只负责展示和增量合并。

### 先保证正确，再升级传输层

轮询实现更容易验证恢复、重试和排序语义。未来升级 WebSocket 时，数据库仍是事实来源，断线后继续通过游标补齐消息。

## 7. 扩展方向

- Durable Objects：按房间维护实时广播和在线状态。
- Queue：异步内容安全检查、举报和通知。
- R2：可控的图片与语音附件。
- Analytics Engine：匿名化留存、消息延迟和失败率观测。
- Turnstile：增强注册与登录的自动化攻击防护。

