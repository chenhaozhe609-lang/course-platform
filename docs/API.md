# 理工课探 · API 接口设计

> 版本：v1.0
> 日期：2026-06-04
> 关联：[PRD](./PRD.md) · [技术方案](./TECH_DESIGN.md)

REST 风格，JSON 交互。基址 `/api`。除注明「公开」外，写类接口均需登录（cookie session）。

---

## 通用约定

### 响应包络
成功 `2xx`：
```json
{ "data": <payload>, "error": null }
```
失败：
```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "学号格式不正确" } }
```

### 错误码
| HTTP | code | 含义 |
|------|------|------|
| 400 | VALIDATION_ERROR | 入参不合法 |
| 401 | UNAUTHORIZED | 未登录 |
| 403 | FORBIDDEN | 无权限 / 已封禁 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 冲突（已注册 / 重复评价） |
| 429 | RATE_LIMITED | 触发限流 |
| 500 | INTERNAL | 服务端异常 |

### 分页
查询参数 `?page=1&pageSize=20`（pageSize 上限 50）。列表返回：
```json
{ "data": { "items": [], "page": 1, "pageSize": 20, "total": 0 } }
```

### 公共数据结构（DTO，前台可见）
```ts
// 用户（前台，匿名）—— 注意：不含 studentNo
UserPublic = { id: string; nickname: string; role: 'student' | 'admin' }

Course = {
  id: string; courseNo: string | null; name: string; teacher: string;
  department: string | null; credit: number | null;
  type: 'required' | 'elective' | 'general' | null;
  status: 'pending' | 'published' | 'delisted';
  reviewCount: number;
  ratings?: { overall: number; score: number; workload: number; gain: number }; // 详情页带平均分
}

Review = {
  id: string; courseId: string; author: UserPublic;
  ratingOverall: number; ratingScore: number; ratingWorkload: number; ratingGain: number;
  content: string; tags: string[]; term: string | null;
  helpfulCount: number; likeCount: number;
  myReactions?: ('like' | 'helpful')[];   // 登录时返回当前用户的反应
  appends: { id: string; content: string; createdAt: string }[];
  createdAt: string; updatedAt: string;
}

Comment = { id: string; reviewId: string; author: UserPublic; content: string; createdAt: string }
```

---

## 1. 账号 Auth（Server Actions，M0 已实现）

> 鉴权未走 REST，而是 Next.js 16 的 **Server Actions**（`src/app/(auth)/actions.ts`），配合 HttpOnly cookie session。表单用 `useActionState` 接收返回的错误状态。其余数据接口（课程/评价）仍为下文的 REST。

### 1.1 注册 `register(prevState, formData)`
入参（表单字段）：`studentNo`、`password`、`nickname?`
校验：`studentNo` 6–20 位字母/数字；`password` ≥8 位且含字母+数字；`nickname` 可空（缺省随机生成「匿名的{动物}#{4位数}」）。
- 成功：写 session cookie 并 `redirect('/')`
- 失败返回 `AuthState`：
  - 字段不合法 → `{ fieldErrors: { studentNo?: string[], password?: string[], nickname?: string[] } }`
  - 学号已注册 → `{ error: "该学号已注册，请直接登录" }`

### 1.2 登录 `login(prevState, formData)`
入参：`studentNo`、`password`
- 成功：写 session cookie、更新 `lastLoginAt`、`redirect('/')`
- 凭据错误：统一 `{ error: "学号或密码错误" }`（不区分账号/密码，防枚举）
- 封禁：`{ error: "该账号已被封禁" }`
- 防爆破：同一学号 15 分钟内失败 5 次 → `{ error: "登录尝试过多，请 15 分钟后再试" }`

### 1.3 登出 `logout()`
清除 session cookie 并 `redirect('/login')`。

### 1.4 读取当前用户（服务端）
RSC / Server Action 内用 `getCurrentUser()`（`lib/dal.ts`）→ `UserPublic | null`；需要登录的页面用 `requireUser()`（未登录自动 `redirect('/login')`）。前端无需单独的 session 接口。

---

## 2. 课程 Courses

> **实现说明（M1 已落地）**：读路径（列表/详情）由 **RSC 直查 Prisma** 实现（`lib/courses.ts`：`listCourses`/`getCourseDetail`/`listDepartments`），页面通过 URL searchParams 承接 `q/department/type/sort/page`；提交新课程由 **Server Action** `submitCourse`（`app/courses/actions.ts`）实现，登录可用、同名同教师去重、状态 `pending`、提交者可即时评价。下方 REST 端点为「将来给非表单/外部客户端」预留的可选面，字段契约一致。

### 2.1 课程列表（公开）
`GET /api/courses`
| 参数 | 说明 |
|------|------|
| `q` | 关键词，匹配 课程名/教师/课程号 |
| `department` | 院系筛选 |
| `type` | required\|elective\|general |
| `sort` | `rating`(默认) \| `reviews` \| `latest` |
| `page` `pageSize` | 分页 |

仅返回 `status = published`。
```jsonc
// 200
{ "data": { "items": [Course], "page": 1, "pageSize": 20, "total": 42 }, "error": null }
```

### 2.2 课程详情（公开）
`GET /api/courses/:id`
返回 `Course`（含各维度平均分 `ratings` 与评分分布）。
```jsonc
// 200
{ "data": {
    "id": "...", "name": "数据结构", "teacher": "王强",
    "ratings": { "overall": 4.3, "score": 3.8, "workload": 2.9, "gain": 4.5 },
    "ratingHistogram": { "overall": { "1":0,"2":1,"3":4,"4":10,"5":7 } },
    "reviewCount": 22
  }, "error": null }
```
错误：`404`（不存在或未上架且非本人提交）。

### 2.3 提交新课程（登录）
`POST /api/courses`
```jsonc
// Request
{ "name": "编译原理", "teacher": "赵敏", "department": "计算机学院", "credit": 3, "type": "elective" }
```
- 校验：`name`、`teacher` 必填；`credit` 0–10；`type` 枚举可空。
- 去重：按 `name + teacher` 模糊匹配，命中已上架课程则 `409 CONFLICT`，错误体附 `data.suggestion`（疑似已有课程）。
- 创建后 `status = pending`，`submittedById = 当前用户`；提交者可立即对其评价。
```jsonc
// 201
{ "data": { "id": "...", "status": "pending" }, "error": null }
```

---

## 3. 评价 Reviews

### 3.1 某课程的评价列表（公开）
`GET /api/courses/:id/reviews?sort=helpful&page=1`
- `sort`：`helpful`(默认) | `latest`
- 仅返回 `status = visible`；登录时每条带 `myReactions`。
```jsonc
{ "data": { "items": [Review], "page": 1, "pageSize": 20, "total": 22 }, "error": null }
```

### 3.2 发表评价（登录）
`POST /api/courses/:id/reviews`
```jsonc
// Request
{
  "ratingOverall": 4.5, "ratingScore": 4, "ratingWorkload": 3, "ratingGain": 5,
  "content": "老师讲得清楚，给分友好……", "tags": ["考试简单","老师好"], "term": "2025秋"
}
```
- 校验：四项评分 1–5（0.5 步进）；`content` 10–2000 字；`tags` ≤6 项。
- 约束：**一人一课一评**，已评返回 `409 CONFLICT`（前端应引导去编辑）。
- 课程需存在且（已上架 或 当前用户为提交者）。
```jsonc
// 201
{ "data": Review, "error": null }
```

### 3.3 单条评价详情（公开）
`GET /api/reviews/:id` → `Review`（含 appends、comments 计数）。

### 3.4 编辑自己的评价（登录，仅作者）
`PATCH /api/reviews/:id`
入参为可选子集（评分/content/tags/term）。校验同发表。非作者 `403`。

### 3.5 删除自己的评价（登录，仅作者）
`DELETE /api/reviews/:id` → `204`。级联删除 appends/comments/reactions。

### 3.6 追加评价（登录，仅作者）
`POST /api/reviews/:id/appends`
```jsonc
{ "content": "结课补充：期末难度适中。" }
```
`content` 10–2000 字。→ `201` 返回新 append。

---

## 4. 互动 Reactions / Comments

### 4.1 点赞 / 标记有用（登录）
`POST /api/reviews/:id/reactions`
```jsonc
{ "type": "like" }   // 或 "helpful"
```
- 幂等：已存在同型反应直接返回当前计数（不报错）。
- 事务内更新明细 + `Review.likeCount/helpfulCount`。
```jsonc
// 200
{ "data": { "likeCount": 13, "helpfulCount": 8, "myReactions": ["like"] }, "error": null }
```

### 4.2 取消反应（登录）
`DELETE /api/reviews/:id/reactions?type=like` → 同上返回最新计数。

### 4.3 评价的评论列表（公开）
`GET /api/reviews/:id/comments?page=1` → `Comment[]`（分页）。

### 4.4 发表评论（登录）
`POST /api/reviews/:id/comments`
```jsonc
{ "content": "请问点名严吗？" }
```
`content` 1–500 字。→ `201` 返回 `Comment`。

### 4.5 删除自己的评论（登录，仅作者）
`DELETE /api/comments/:id` → `204`。

---

## 5. 个人中心 Me（登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/me/reviews` | 我发布的评价（分页） |
| GET | `/api/me/reactions?type=like` | 我点赞/标记有用的评价 |
| GET | `/api/me/comments` | 我的评论 |
| PATCH | `/api/me` | 改昵称 `{ nickname }` |
| PATCH | `/api/me/password` | 改密码 `{ oldPassword, newPassword }` |

`GET /api/auth/session` 已提供当前用户基本信息，无需单独 `/api/me` GET。

---

## 6. 举报 Reports（V1.5）

### 6.1 提交举报（登录）
`POST /api/reports`
```jsonc
{ "targetType": "review", "targetId": "...", "reason": "广告/辱骂/不实信息" }
```
→ `201`，`status = pending`。同一用户对同一目标去重。

### 6.2 管理：举报处理（admin）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/reports?status=pending` | 举报队列 |
| PATCH | `/api/admin/reports/:id` | `{ action: 'resolve'｜'reject', hideTarget?: boolean }` |
| PATCH | `/api/admin/courses/:id` | 审核课程 `{ status: 'published'｜'delisted' }` |
| PATCH | `/api/admin/users/:id` | 封禁/解封 `{ status }` |

所有 admin 写操作记 `AuditLog`。

---

## 7. 限流建议（写接口）

| 接口 | 限制（每用户） |
|------|---------------|
| 注册 | 5 次 / 小时 / IP |
| 发评价 | 10 次 / 天 |
| 评论 | 30 次 / 小时 |
| 点赞/有用 | 120 次 / 小时 |
| 举报 | 20 次 / 天 |

V1 进程内内存限流，多实例上线换 Redis。

---

## 8. 接口清单速查

```
[Action] register / login / logout           账号（Server Actions，见 §1）
GET    /api/courses                           课程列表（公开）
POST   /api/courses                           提交新课程（登录）
GET    /api/courses/:id                        课程详情（公开）
GET    /api/courses/:id/reviews                评价列表（公开）
POST   /api/courses/:id/reviews                发表评价（登录）
GET    /api/reviews/:id                         评价详情（公开）
PATCH  /api/reviews/:id                         编辑评价（作者）
DELETE /api/reviews/:id                         删除评价（作者）
POST   /api/reviews/:id/appends                 追加评价（作者）
POST   /api/reviews/:id/reactions               点赞/有用（登录）
DELETE /api/reviews/:id/reactions               取消反应（登录）
GET    /api/reviews/:id/comments                评论列表（公开）
POST   /api/reviews/:id/comments                发评论（登录）
DELETE /api/comments/:id                         删评论（作者）
GET    /api/me/reviews | reactions | comments    个人数据（登录）
PATCH  /api/me | /api/me/password                改资料/密码（登录）
POST   /api/reports                              举报（登录, V1.5）
*      /api/admin/*                              管理后台（admin, V1.5）
```
