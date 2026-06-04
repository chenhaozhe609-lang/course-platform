# 理工课探 · 技术方案设计

> 版本：v1.0
> 日期：2026-06-04
> 关联文档：[PRD](./PRD.md) · [API 设计](./API.md)

---

## 1. 总览

全栈单体（Next.js App Router），前端 RSC + Client Components，后端用 Route Handlers 提供 REST API，数据层 Prisma + SQLite（本地）/ PostgreSQL（生产目标）。鉴权采用 **Next.js 16 官方推荐的自管 session 方案**（`jose` 签发 JWT + HttpOnly cookie + DAL），未使用 Auth.js —— 详见 §4 说明。

```
浏览器
  │ HTTP
  ▼
┌──────────────────────── Next.js (Node runtime) ────────────────────────┐
│  app/                                                                   │
│   ├─ (页面) RSC：直查 prisma（读路径，无需经过 /api）                     │
│   ├─ (交互) Client Components：fetch('/api/...')                         │
│   ├─ api/  Route Handlers：REST，写路径 + 需要鉴权的读                   │
│   └─ (auth)/actions.ts  Server Actions：注册/登录/登出                   │
│  proxy.ts  路由保护（Next 16，原 middleware）                            │
│  lib/                                                                    │
│   ├─ db.ts        Prisma client 单例（better-sqlite3 adapter）          │
│   ├─ session.ts   jose 签发/校验 + cookie 读写                          │
│   ├─ dal.ts       getCurrentUser / requireUser（安全校验 + 缓存）       │
│   ├─ password.ts  bcrypt 哈希/校验                                      │
│   └─ validations/ Zod schema（前后端共用）                             │
└─────────────────────────────────────────────────────────────────────────┘
  │ Prisma
  ▼
SQLite (dev.db)  →  PostgreSQL (prod)
```

### 设计原则
- **读路径走 RSC 直查**：课程列表、详情、评价列表等只读页面，服务端组件直接调用 Prisma，省一层 HTTP，SEO 友好。
- **写路径走 /api**：注册、发评价、点赞、评论、举报等改动走 Route Handler，统一鉴权、校验、限流。
- **Zod 单一事实源**：同一份 schema 前端校验表单、后端校验入参，类型自动推导。
- **前台零身份泄漏**：任何返回给前台的 DTO 都不包含 `studentNo`、`passwordHash`。

---

## 2. 技术选型

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | Next.js 16（App Router, Turbopack） | 全栈一体 |
| 语言 | TypeScript（strict） | 类型安全 |
| 样式 | Tailwind CSS v4 | 原子化 |
| UI 组件 | shadcn/ui（按需引入） | 后续接入 |
| 鉴权 | 自管 session：`jose`(HS256 JWT) + HttpOnly cookie | Next 16 官方推荐，零 beta 依赖；见 §4 |
| 密码哈希 | bcryptjs | 纯 JS，免原生编译，Vercel 友好 |
| 表单 | Server Actions + `useActionState` | Next 16 官方认证表单范式 |
| ORM | Prisma 7 + driver adapter | v7 强制走适配器 |
| 适配器 | @prisma/adapter-better-sqlite3 / @prisma/adapter-pg | dev / prod |
| 校验 | Zod + React Hook Form + @hookform/resolvers | 表单与 API |
| 数据库 | SQLite（dev）→ PostgreSQL（prod） | schema 已避开 enum/Json 保证可移植 |

---

## 3. 目录结构（目标）

```
src/
├── app/
│   ├── layout.tsx                 根布局
│   ├── page.tsx                   首页（课程列表，RSC）
│   ├── globals.css
│   ├── (auth)/                    鉴权（路由组，M0 已建）
│   │   ├── actions.ts             Server Actions：register/login/logout
│   │   ├── login/page.tsx         登录
│   │   ├── register/page.tsx      注册
│   │   ├── login-form.tsx         登录表单（client）
│   │   └── register-form.tsx      注册表单（client）
│   ├── courses/
│   │   ├── new/page.tsx           提交新课程
│   │   └── [id]/page.tsx          课程详情 + 评价列表（RSC）
│   ├── reviews/
│   │   └── new/page.tsx           写评价（带 courseId 参数）
│   ├── me/                        个人中心
│   │   ├── page.tsx               我的评价
│   │   └── settings/page.tsx      账号设置
│   └── api/                       （数据接口，M1+ 落地）
│       ├── courses/route.ts                 GET 列表 / POST 提交
│       ├── courses/[id]/route.ts            GET 详情
│       ├── courses/[id]/reviews/route.ts    GET 评价列表 / POST 发评价
│       ├── reviews/[id]/route.ts            GET / PATCH / DELETE
│       ├── reviews/[id]/appends/route.ts    POST 追加
│       ├── reviews/[id]/reactions/route.ts  POST 点赞/有用 / DELETE 取消
│       ├── reviews/[id]/comments/route.ts   GET / POST
│       └── reports/route.ts                 POST 举报（V1.5）
├── components/                    UI 组件
│   ├── ui/                        shadcn 基础件
│   ├── course-card.tsx
│   ├── rating-stars.tsx
│   ├── review-card.tsx
│   └── review-form.tsx
├── lib/
│   ├── db.ts                      Prisma 单例（M0 已建）
│   ├── session.ts                 jose 签发/校验 + cookie（M0 已建）
│   ├── dal.ts                     getCurrentUser/requireUser（M0 已建）
│   ├── password.ts                bcrypt 哈希/校验（M0 已建）
│   ├── nickname.ts                随机匿名昵称（M0 已建）
│   ├── api.ts                     统一响应/错误封装（M1+）
│   ├── ratelimit.ts               简单限流（M4）
│   └── validations/
│       ├── auth.ts                注册/登录 schema（M0 已建）
│       ├── course.ts              提交课程 schema（M1）
│       └── review.ts              评价/评论 schema（M2）
├── generated/prisma/              Prisma client（gitignore）
└── proxy.ts                       路由保护（Next 16，M0 已建）
```

---

## 4. 鉴权设计（M0 已实现）

### 4.0 为什么不用 Auth.js
最初计划用 Auth.js v5。落地时改为 **Next.js 16 官方认证指南的自管 session 方案**，原因：
1. Next 16 把 `middleware` 更名为 `proxy`、运行时调整，Auth.js v5 仍为 **beta**，对全新 Next 16 兼容性无保证，接入风险高。
2. 官方文档直接示范 `jose` + `cookies()` + DAL 模式，为当前版本量身定制，零 beta 依赖、依赖更少、完全满足「学号+密码」的简单需求。
3. 对用户体验无差别，将来如需第三方登录/SSO 可平滑切回 Auth.js。

### 4.1 组成
| 文件 | 职责 |
|------|------|
| `lib/session.ts` | `jose` 签发/校验 HS256 JWT；读写 HttpOnly cookie（`session`，7 天） |
| `lib/password.ts` | bcrypt 哈希/校验（server-only） |
| `lib/dal.ts` | `getCurrentUser()`（回查 DB、`react.cache` 去重、剥离敏感字段）、`requireUser()`/`requireAdmin()` |
| `lib/validations/auth.ts` | Zod：注册/登录入参 |
| `app/(auth)/actions.ts` | Server Actions：`register` / `login` / `logout` |
| `proxy.ts` | 乐观路由保护（仅看 cookie 是否存在） |

### 4.2 注册流程（Server Action `register`）
```
表单 → register(prevState, formData)
  → Zod 校验（学号 6-20 位字母数字；密码 ≥8 位含字母+数字）
  → findUnique(studentNo) 已存在 → 返回 { error: '该学号已注册' }
  → bcrypt.hash(password, 10)
  → nickname 缺省 → generateNickname()「匿名的{动物}#{4位数}」
  → user.create → createSession({ userId, role, nickname }) 写 cookie
  → redirect('/')
```

### 4.3 登录流程（Server Action `login`）
```
表单 → login(prevState, formData)
  → Zod 校验 → 防爆破检查（见 4.4）
  → findUnique(studentNo) + bcrypt.compare
  → 失败：记一次失败，统一返回 '学号或密码错误'（不区分账号/密码，防枚举）
  → banned：返回 '该账号已被封禁'
  → 成功：清除失败计数、更新 lastLoginAt、createSession、redirect('/')
```

### 4.4 防爆破
- 进程内内存计数（`Map<studentNo, {count, firstAt}>`），同一学号 15 分钟内失败 5 次锁定。
- **单实例有效，上线多实例需换 Redis**（已在代码注释标注）。

### 4.5 会话与授权
- JWT payload 只放 `userId / role / nickname`，**不含 studentNo**。
- cookie：`httpOnly` + `sameSite=lax` + `secure`(仅生产) + `maxAge=7d`。
- `proxy.ts` 乐观保护 `/me`、`/reviews/new`、`/courses/new`（只看 cookie 存在与否）；登录用户访问 `/login`、`/register` 重定向回首页。
- **真正的安全校验在数据源**：页面/Action 用 `getCurrentUser()`（回查 DB 确认存在且 `status !== 'banned'`），`requireUser()` 未登录则 `redirect('/login')`。
- 管理员路由 `/admin/**`（V1.5）用 `requireAdmin()`。

---

## 5. 数据层

### 5.1 Prisma client
已实现 `src/lib/db.ts`：全局单例 + better-sqlite3 适配器，避免热重载连接泄漏。

### 5.2 切换到 PostgreSQL（上线时）
1. `datasource db { provider = "postgresql" }`
2. 适配器换 `@prisma/adapter-pg`（`PrismaPg`）
3. `tags` 可由 `String`(JSON) 升级为 `Json`；`String` 枚举字段可选择性改原生 enum
4. 重新生成迁移基线

### 5.3 计数字段一致性
`Review.likeCount / helpfulCount`、未来的课程聚合分为冗余字段。写时在**事务**内同时更新明细表与计数：
```
prisma.$transaction([
  reaction.create(...),
  review.update({ data: { likeCount: { increment: 1 } } }),
])
```
配合 `@@unique([userId, reviewId, type])` 保证幂等，重复点赞由唯一约束兜底。

### 5.4 课程聚合评分
课程详情页的各维度平均分 V1 用查询时 `aggregate` 实时算（数据量小）；数据量上来后再加 `Course` 冗余字段 + 定时/触发更新。

---

## 6. API 约定

### 6.1 统一响应
成功：
```json
{ "data": <payload>, "error": null }
```
失败：
```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 6.2 错误码（HTTP + code）
| HTTP | code | 场景 |
|------|------|------|
| 400 | VALIDATION_ERROR | 入参不合法（Zod） |
| 401 | UNAUTHORIZED | 未登录 |
| 403 | FORBIDDEN | 无权限 / 已封禁 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 学号已注册 / 重复评价 |
| 429 | RATE_LIMITED | 触发限流 |
| 500 | INTERNAL | 服务端异常 |

### 6.3 分页
列表统一 `?page=1&pageSize=20`，返回：
```json
{ "data": { "items": [...], "page": 1, "pageSize": 20, "total": 57 } }
```

### 6.4 鉴权
写类与个人数据接口需登录（cookie session）。前台返回的用户信息只含 `{ nickname }`，不含身份字段。

详见 [API.md](./API.md)。

---

## 7. 安全与治理

| 项 | 措施 |
|----|------|
| 密码 | bcrypt 哈希，永不返回 |
| 身份脱敏 | DTO 层剥离 studentNo / passwordHash |
| XSS | 文字内容输出转义（React 默认），不引入裸 HTML |
| 越权 | 评价/评论的编辑删除校验 `ownerId === currentUserId` |
| 防刷 | 写接口限流；一人一课一评由唯一约束保证 |
| 敏感词 | 发布时基础词表过滤，命中转 `pending`（V1 可先留钩子） |
| 审计 | 管理操作写 `AuditLog` |

---

## 8. 测试与质量

- **单测**：Zod schema、纯函数（评分聚合、昵称生成）用 Vitest。
- **集成**：API Route 用独立测试库（SQLite 内存/临时文件）跑关键流程（注册→登录→发评价→点赞）。
- **类型**：`tsc --noEmit` 纳入 CI。
- **Lint**：ESLint（next 配置）。

---

## 9. 环境与配置

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | 数据库连接（dev：`file:./dev.db`） |
| `AUTH_SECRET` | Auth.js 加密 session 的密钥 |
| `AUTH_TRUST_HOST` | 本地/自托管设 true |

`.env` 已 gitignore，模板见 `.env.example`。

---

## 10. 里程碑映射（对齐 PRD §9）

| 阶段 | 技术任务 |
|------|---------|
| M0（本周） | ✅ 脚手架 + Prisma + 迁移 + seed；✅ 自管 session 鉴权 + 注册/登录/登出 + proxy 路由保护 |
| M1 | ✅ 课程列表/搜索/筛选/分页（RSC）+ 详情页 + 提交新课程（Server Action，待审核） |
| M2 | ✅ 发/编辑/追加/删除评价（Server Action）+ 评价表单 + 详情页评价列表 + 评分聚合 |
| M3 | 点赞/有用/评论 API + 个人中心 |
| M4 | 限流、敏感词钩子、安全自查、整体联调 |
| M5 | 举报 + 管理后台（V1.5） |

---

*下一步：基于本方案接入 Auth.js（M0 收尾），随后按 M1 推进课程模块。*
