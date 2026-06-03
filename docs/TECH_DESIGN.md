# 理工课探 · 技术方案设计

> 版本：v1.0
> 日期：2026-06-04
> 关联文档：[PRD](./PRD.md) · [API 设计](./API.md)

---

## 1. 总览

全栈单体（Next.js App Router），前端 RSC + Client Components，后端用 Route Handlers 提供 REST API，数据层 Prisma + SQLite（本地）/ PostgreSQL（生产目标）。鉴权用 Auth.js v5（Credentials）。

```
浏览器
  │ HTTP
  ▼
┌──────────────────────── Next.js (Node runtime) ────────────────────────┐
│  app/                                                                   │
│   ├─ (页面) RSC：直查 prisma（读路径，无需经过 /api）                     │
│   ├─ (交互) Client Components：fetch('/api/...')                         │
│   └─ api/  Route Handlers：REST，写路径 + 需要鉴权的读                   │
│  middleware.ts  鉴权/路由保护                                            │
│  lib/                                                                    │
│   ├─ db.ts        Prisma client 单例（better-sqlite3 adapter）          │
│   ├─ auth.ts      Auth.js 配置                                          │
│   ├─ session.ts   读取当前用户的服务端工具                              │
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
| 鉴权 | Auth.js v5（next-auth）Credentials + JWT session | 学号密码登录 |
| 密码哈希 | bcryptjs | 纯 JS，免原生编译，Vercel 友好 |
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
│   ├── login/page.tsx             登录
│   ├── register/page.tsx          注册
│   ├── courses/
│   │   ├── new/page.tsx           提交新课程
│   │   └── [id]/page.tsx          课程详情 + 评价列表（RSC）
│   ├── reviews/
│   │   └── new/page.tsx           写评价（带 courseId 参数）
│   ├── me/                        个人中心
│   │   ├── page.tsx               我的评价
│   │   └── settings/page.tsx      账号设置
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── register/route.ts
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
│   ├── db.ts                      Prisma 单例（已建）
│   ├── auth.ts                    Auth.js 配置
│   ├── session.ts                 getCurrentUser() 等
│   ├── api.ts                     统一响应/错误封装
│   ├── ratelimit.ts               简单限流
│   └── validations/
│       ├── auth.ts                注册/登录 schema
│       ├── course.ts              提交课程 schema
│       └── review.ts              评价/评论 schema
├── generated/prisma/              Prisma client（gitignore）
└── middleware.ts                  路由保护
```

---

## 4. 鉴权设计

### 4.1 方案
- Auth.js v5，`Credentials` provider，session 策略 `jwt`。
- 注册走自有 `/api/register`（Auth.js 不管注册），登录走 Auth.js 的 `authorize`。

### 4.2 注册流程
```
POST /api/register { studentNo, password, nickname? }
  → Zod 校验（学号 6-20 位字母数字；密码 ≥8 位含字母+数字）
  → 查 studentNo 是否已存在 → 存在则 409
  → bcrypt.hash(password, 10)
  → nickname 缺省时生成「匿名的{动物}#{4位数}」
  → 创建 User，返回 { id, nickname }（绝不返回 studentNo/hash）
```

### 4.3 登录流程
```
signIn('credentials', { studentNo, password })
  → authorize(): 查 User by studentNo
  → bcrypt.compare → 失败计数（见 4.4）
  → 通过则 JWT 写入 { sub: user.id, role, nickname }
```

### 4.4 防爆破
- 登录失败计数（内存 Map 或后续接 Redis），同一学号 15 分钟内失败 5 次锁定。
- V1 用进程内内存实现，标注「单实例有效，上线多实例需换 Redis」。

### 4.5 会话与授权
- JWT 中只放 `userId / role / nickname`，**不放 studentNo**。
- `middleware.ts` 保护需要登录的路由：`/me/**`、`/reviews/new`、`/courses/new`，以及写类 `/api/**`。
- 管理员路由 `/admin/**`（V1.5）校验 `role === 'admin'`。
- 服务端用 `getCurrentUser()` 从 session 取用户；API 内二次校验 `status !== 'banned'`。

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
| M0（本周） | ✅ 脚手架 + Prisma + 迁移 + seed；接 Auth.js + 注册/登录 + middleware |
| M1 | 课程列表/详情/搜索（RSC）+ 提交新课程 API |
| M2 | 发/编辑/追加评价 API + 评价表单 + 评分聚合 |
| M3 | 点赞/有用/评论 API + 个人中心 |
| M4 | 限流、敏感词钩子、安全自查、整体联调 |
| M5 | 举报 + 管理后台（V1.5） |

---

*下一步：基于本方案接入 Auth.js（M0 收尾），随后按 M1 推进课程模块。*
