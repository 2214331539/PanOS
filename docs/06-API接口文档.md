# API 接口文档

版本：v0.1  
日期：2026-06-07

## 基本约定

- API Base：`/api`
- 格式：JSON
- 字段命名：请求和响应使用 camelCase，数据库内部使用 snake_case。
- 时间格式：ISO 8601。
- 公开接口只返回已发布且公开的内容。
- 后台接口必须校验 Supabase access token，并在 FastAPI 中检查 `admin_users` 权限。

## 通用响应

### 成功

```json
{
  "data": {},
  "meta": {}
}
```

列表接口：

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 12,
    "total": 48,
    "hasMore": true
  }
}
```

### 失败

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数不合法",
    "fields": {
      "email": "邮箱格式不正确"
    }
  }
}
```

## 状态码

| 状态码 | 含义 |
| --- | --- |
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除或无内容成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | slug 或唯一字段冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务端错误 |

## 公开接口

### `GET /api/desktop/bootstrap`

用途：桌面首页初始化。

查询参数：无。

响应：

```json
{
  "data": {
    "profile": {
      "name": "潘廷峰",
      "englishName": "Pan Daniel",
      "subtitle": "欢迎来到小潘同学的个人创作空间",
      "currentMode": "Building",
      "roles": ["AI Agent Researcher", "Web Builder", "Product Explorer", "Content Creator"]
    },
    "wallpaper": {
      "type": "image",
      "url": "https://...",
      "alt": "PanOS desktop wallpaper"
    },
    "widgets": [],
    "latest": {
      "articles": [],
      "projects": [],
      "timeline": []
    },
    "links": []
  }
}
```

说明：Dock App 列表不从 API 返回，由前端代码常量提供。

### `GET /api/articles`

用途：文章列表。

查询参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `page` | number | 默认 1 |
| `pageSize` | number | 默认 12，最大 24 |
| `category` | string | 分类 slug |
| `tag` | string | 标签 slug |
| `q` | string | 标题和摘要搜索 |
| `featured` | boolean | 是否只看精选 |

响应项：

```json
{
  "id": "uuid",
  "slug": "agent-memory-intro",
  "title": "Agent Memory 的核心价值",
  "excerpt": "一段摘要",
  "cover": {
    "url": "https://...",
    "alt": "cover"
  },
  "category": {
    "name": "AI & Agent",
    "slug": "ai-agent"
  },
  "tags": [],
  "readingMinutes": 6,
  "publishedAt": "2026-06-07T00:00:00.000Z"
}
```

### `GET /api/articles/[slug]`

用途：文章详情。

响应：

```json
{
  "data": {
    "id": "uuid",
    "slug": "agent-memory-intro",
    "title": "Agent Memory 的核心价值",
    "excerpt": "一段摘要",
    "bodyMdx": "# 正文",
    "cover": {},
    "category": {},
    "tags": [],
    "readingMinutes": 6,
    "publishedAt": "2026-06-07T00:00:00.000Z",
    "previous": null,
    "next": null,
    "seo": {
      "title": "Agent Memory 的核心价值",
      "description": "一段摘要"
    }
  }
}
```

### `GET /api/ideas`

V2。

查询参数：`page`、`pageSize`、`status`、`tag`、`q`。

响应项：

```json
{
  "id": "uuid",
  "title": "情侣经期记录 App",
  "summary": "一个更温柔的双人关系记录工具",
  "status": "seed",
  "tags": [],
  "createdAt": "2026-06-07T00:00:00.000Z"
}
```

### `GET /api/projects`

用途：项目列表。

查询参数：`page`、`pageSize`、`category`、`status`、`tag`、`featured`。

响应项：

```json
{
  "id": "uuid",
  "slug": "final-exam-course-rebuilder",
  "name": "Final Exam Course Rebuilder",
  "tagline": "把课程资料重建成期末冲刺复习包",
  "cover": {},
  "status": "launched",
  "techStack": ["TypeScript", "Markdown"],
  "links": [
    {
      "type": "github",
      "label": "GitHub",
      "url": "https://github.com/..."
    }
  ]
}
```

### `GET /api/projects/[slug]`

用途：项目详情。

响应包含：

- 基础信息。
- 大封面。
- 背景。
- 核心功能。
- 技术架构。
- 截图。
- 开发过程。
- 未来计划。
- 相关链接。

### `GET /api/gallery`

用途：图片墙。

查询参数：`page`、`pageSize`、`category`、`tag`。

响应项：

```json
{
  "id": "uuid",
  "slug": "panos-wallpaper",
  "title": "PanOS wallpaper",
  "description": "桌面背景",
  "media": {
    "url": "https://...",
    "width": 1600,
    "height": 1000,
    "alt": "PanOS wallpaper"
  },
  "tool": "Figma",
  "shotAt": "2026-06-07",
  "allowDownload": false
}
```

### `GET /api/gallery/[slug]`

V2，图片详情直达。

### `GET /api/research`

V2。

查询参数：`page`、`pageSize`、`category`、`tag`、`q`。

### `GET /api/research/[slug]`

V2，研究笔记详情。

### `GET /api/timeline`

V2。

查询参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `type` | string | research、project、writing、content、life |
| `from` | date | 开始日期 |
| `to` | date | 结束日期 |

响应按月份分组。

### `GET /api/links`

用途：社交链接。

响应项：

```json
{
  "id": "uuid",
  "platform": "GitHub",
  "slug": "github",
  "description": "My code, experiments, and open-source projects.",
  "url": "https://github.com/...",
  "iconName": "Github",
  "isPrimary": true
}
```

### `GET /api/categories`

用途：公开分类列表（供 Articles 等左侧分类栏）。

查询参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `module` | string | `articles`、`projects`、`gallery`、`research`，默认 `articles` |

响应项：`{ id, module, name, slug, description, sortOrder }`，仅返回 `is_active=true`，按 `sortOrder` 升序。

### `GET /api/search`

V2，Spotlight 搜索。

查询参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `q` | string | 必填，搜索关键词 |
| `types` | string | 可选，逗号分隔，如 `article,project` |
| `limit` | number | 默认 8，最大 20 |

响应项：

```json
{
  "type": "article",
  "id": "uuid",
  "title": "Agent Memory 的核心价值",
  "excerpt": "一段摘要",
  "url": "/articles/agent-memory-intro",
  "icon": "FileText",
  "highlight": "Agent Memory"
}
```

### `POST /api/contact`

用途：提交联系表单。

请求：

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "topic": "Research collaboration",
  "message": "你好，我想聊聊..."
}
```

响应：

```json
{
  "data": {
    "id": "uuid",
    "status": "new"
  }
}
```

限制：

- `name` 1 到 80 字。
- `email` 必须合法。
- `topic` 最多 120 字。
- `message` 10 到 2000 字。
- 同一 IP hash 10 分钟最多 3 次。

## 后台接口

后台接口统一前缀：`/api/admin`。

### `POST /api/admin/login`

用途：管理员账号密码登录（V1 本地鉴权；目标仍 Supabase Auth）。

请求：

```json
{ "username": "admin", "password": "••••••" }
```

响应：

```json
{ "data": { "accessToken": "<jwt>", "expiresAt": "2026-06-09T00:00:00.000Z" } }
```

说明：后端用 `hmac.compare_digest` 比对 `.env` 的 `ADMIN_USERNAME`/`ADMIN_PASSWORD`，成功后用 `AUTH_SECRET` 签发 HS256 JWT。后续后台接口以 `Authorization: Bearer <jwt>` 调用。失败返回 401 `INVALID_CREDENTIALS`。

### `GET /api/admin/me`

用途：获取当前管理员。

响应：

```json
{
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "displayName": "Pan Daniel",
    "role": "owner"
  }
}
```

### 通用 CRUD 资源

以下资源使用同一套 REST 规则：

| 资源 | 路径 | 数据表 |
| --- | --- | --- |
| Articles | `/api/admin/articles` | `articles` |
| Ideas | `/api/admin/ideas` | `ideas` |
| Projects | `/api/admin/projects` | `projects` |
| Gallery | `/api/admin/gallery` | `gallery_items` |
| Research | `/api/admin/research` | `research_notes` |
| Timeline | `/api/admin/timeline` | `timeline_events` |
| Links | `/api/admin/links` | `social_links` |
| Widgets | `/api/admin/widgets` | `widgets` |
| Categories | `/api/admin/categories` | `categories` |
| Tags | `/api/admin/tags` | `tags` |

#### `GET /api/admin/[resource]`

后台列表，返回所有状态，支持分页、状态、关键词筛选。

#### `POST /api/admin/[resource]`

创建资源。请求体必须符合对应 Pydantic schema，前端表单同时使用 Zod 做客户端校验。

#### `GET /api/admin/[resource]/[id]`

获取单个资源，包含草稿和私有内容。

#### `PATCH /api/admin/[resource]/[id]`

更新资源。更新内容字段后必须让公开接口 ETag 变化，并由后台前端刷新对应 TanStack Query cache。

#### `DELETE /api/admin/[resource]/[id]`

默认执行归档或软删除。真正硬删除仅 owner 可用，并且必须写入 `audit_logs`。

### `POST /api/admin/media/upload`（V1 本地直传）

用途：本地开发阶段的图片直传（multipart）。编辑器拖入/粘贴图片时调用，返回可直接插入正文的 URL。目标方案仍是下方 Supabase 的 `sign-upload` + `confirm` 两段式。

请求：`multipart/form-data`，字段 `file`（png/jpg/webp/gif，≤ `UPLOAD_MAX_BYTES`）。后端用 Pillow 校验并读取宽高，按 `年/月/hash.ext` 落盘到 `UPLOAD_DIR`，写入 `media_assets`，静态服务于 `/media/*`。

响应：

```json
{ "data": { "id": "uuid", "url": "http://localhost:8000/media/2026/06/<hash>.png", "width": 1200, "height": 800 } }
```

### `POST /api/admin/media/sign-upload`

用途：创建上传签名或服务端上传目标（Supabase 两段式，接入 Supabase Storage 后启用）。

请求：

```json
{
  "fileName": "cover.png",
  "mimeType": "image/png",
  "fileSize": 204800,
  "bucket": "panos-public-assets",
  "purpose": "article-cover"
}
```

响应：

```json
{
  "data": {
    "bucket": "panos-public-assets",
    "path": "articles/2026/cover.png",
    "uploadUrl": "https://...",
    "token": "signed-token"
  }
}
```

### `POST /api/admin/media/confirm`

用途：上传完成后写入 `media_assets`。

请求：

```json
{
  "bucket": "panos-public-assets",
  "path": "articles/2026/cover.png",
  "type": "image",
  "mimeType": "image/png",
  "fileSize": 204800,
  "width": 1200,
  "height": 800,
  "alt": "Article cover"
}
```

### `GET /api/admin/media`

用途：媒体库列表。

查询参数：`page`、`pageSize`、`type`、`q`。

### `PATCH /api/admin/media/[id]`

用途：更新媒体标题、alt、说明。

### `DELETE /api/admin/media/[id]`

用途：软删除媒体记录。硬删除文件仅 owner 可执行。

### `GET /api/admin/messages`

用途：查看联系表单留言。

查询参数：`status`、`page`、`pageSize`。

### `PATCH /api/admin/messages/[id]`

用途：更新留言状态。

请求：

```json
{
  "status": "read"
}
```

### `GET /api/admin/settings`

用途：读取站点设置。

查询参数：`group` 可选。

### `PATCH /api/admin/settings/[key]`

用途：更新设置项。

请求：

```json
{
  "value": {}
}
```

限制：仅 owner 可修改 `profile`、`wallpaper`、`contact`、`seo`、`theme`。

## 接口变更规则

1. 新增接口前必须更新本文档。
2. 修改请求或响应字段前必须更新本文档和相关类型。
3. 删除接口必须给出迁移方案。
4. 前端不得调用未记录接口。
5. 后台接口不得绕过权限校验。
6. 所有后端接口必须有 Pydantic schema 校验；前端表单必须有 Zod schema 或等价类型校验。
