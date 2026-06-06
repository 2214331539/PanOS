# AIcoding 约束文档

版本：v0.1  
日期：2026-06-07

本文档约束所有 AI coding 和人工开发行为。任何功能开发前必须先阅读 `docs` 目录，任何偏离本文档的实现都视为需要返工。

## 十条硬约束

1. 不允许随意更改技术栈。技术栈以 [04-技术架构文档.md](/Users/admin/Research/PanOS/docs/04-技术架构文档.md) 为准。
2. 不允许随意新增大型依赖。新增依赖前必须说明用途、替代方案、体积影响和维护成本。
3. 不允许修改数据库字段前不更新文档。任何表、字段、枚举、索引变更必须先更新 [05-数据库设计文档.md](/Users/admin/Research/PanOS/docs/05-数据库设计文档.md)。
4. 所有接口必须符合 API 文档。新增、修改、删除接口必须先更新 [06-API接口文档.md](/Users/admin/Research/PanOS/docs/06-API接口文档.md)。
5. 所有页面必须符合 UI 规范。视觉、布局、动效、响应式和组件状态必须符合 [03-UI视觉与交互规范.md](/Users/admin/Research/PanOS/docs/03-UI视觉与交互规范.md)。
6. 每次开发前先阅读 docs 目录。至少阅读与当前任务相关的产品、页面、UI、架构、数据库、API 文档。
7. 每个功能开发完成后必须更新对应文档。如果实现细节和文档不同，优先修正文档和代码保持一致。
8. 前端组件必须放在指定目录。桌面组件放 `apps/web/src/components/desktop`，App 组件放 `apps/web/src/components/apps`，基础 UI 放 `apps/web/src/components/ui`，后台组件放 `apps/web/src/components/admin`。
9. 后端接口必须按模块拆分。FastAPI 路由放 `apps/api/app/api/routes`，业务逻辑放 `apps/api/app/modules/[module]`，不得把复杂业务直接堆在 router 文件里。
10. 不允许把临时测试代码混入正式代码。临时 mock、console、测试页面、调试按钮不得进入生产路径。

## 开发前检查清单

每次开始开发前，必须回答：

| 问题 | 必须确认 |
| --- | --- |
| 当前功能属于哪个阶段？ | 对照 [07-开发任务拆解文档.md](/Users/admin/Research/PanOS/docs/07-开发任务拆解文档.md) |
| 涉及哪些页面或 App？ | 对照 [02-页面与功能模块划分.md](/Users/admin/Research/PanOS/docs/02-页面与功能模块划分.md) |
| 是否涉及 UI？ | 对照 [03-UI视觉与交互规范.md](/Users/admin/Research/PanOS/docs/03-UI视觉与交互规范.md) |
| 是否涉及技术栈或依赖？ | 对照 [04-技术架构文档.md](/Users/admin/Research/PanOS/docs/04-技术架构文档.md) |
| 是否涉及数据库？ | 先更新 [05-数据库设计文档.md](/Users/admin/Research/PanOS/docs/05-数据库设计文档.md) |
| 是否涉及 API？ | 先更新 [06-API接口文档.md](/Users/admin/Research/PanOS/docs/06-API接口文档.md) |
| 是否需要后台管理？ | 同步页面文档、API 文档和数据库文档 |

## 目录约束

```text
apps/
  web/
    src/
      routes/
      components/
        desktop/
        apps/
        ui/
        admin/
        content/
      lib/
        api/
        constants/
        hooks/
        utils/
      stores/
      styles/
  api/
    app/
      api/
        routes/
          public/
          admin/
      modules/
        auth/
        articles/
        projects/
        gallery/
        media/
        search/
      db/
        models/
        migrations/
      schemas/
      services/
```

规则：

- `apps/web/src/components/ui` 只放通用基础组件，不写业务逻辑。
- `apps/web/src/components/desktop` 只放桌面系统组件。
- `apps/web/src/components/apps` 按 App 建目录，如 `articles`、`projects`。
- `apps/web/src/components/admin` 只放后台组件。
- `apps/web/src/lib/api` 只放 API client 和 TanStack Query hooks，不写业务规则。
- `apps/api/app/modules` 中每个模块必须有清晰的 `router.py`、`service.py`、`repository.py`、`schemas.py` 拆分。
- SQLAlchemy session 只能从统一封装导入。
- Supabase service role 只能在 FastAPI 后端使用。

## 依赖新增规则

允许直接使用的依赖仅限 [04-技术架构文档.md](/Users/admin/Research/PanOS/docs/04-技术架构文档.md) 已列出的技术栈。

新增依赖必须满足：

1. 现有技术栈无法合理完成。
2. 不是一次性工具。
3. 不与已有依赖功能重复。
4. 有明确维护者和稳定版本。
5. 已更新技术架构文档。

禁止为了一个按钮、一个小动画、一个简单工具函数新增大型依赖。

## UI 开发约束

- 不允许做普通博客首页，首页必须是 Personal OS 桌面。
- 不允许把页面做成营销落地页。
- 不允许大面积使用单一紫色或蓝紫渐变。
- 不允许卡片套卡片。
- 不允许在桌面端把 App 打开成普通页面跳转而丢失窗口体验。
- 移动端不允许强行保留多窗口桌面，应使用全屏 App。
- 所有图标按钮必须有 tooltip 或 `aria-label`。
- 所有文本必须在 390px 移动端和 1440px 桌面端检查不溢出。

## API 开发约束

- FastAPI router 只负责鉴权、解析请求、调用 module service、返回响应。
- 业务逻辑必须放在 `apps/api/app/modules/[module]`。
- 所有后端输入必须经过 Pydantic 校验；前端表单必须经过 Zod 校验。
- 所有错误必须返回统一错误结构。
- 公开 API 不得返回草稿、私有内容、后台字段。
- 后台 API 必须写 audit log，至少对发布、归档、删除、设置修改写日志。

## 数据库开发约束

- 任何 schema 修改先改文档，再改 SQLAlchemy model，再生成 Alembic migration。
- 不允许直接在生产数据库手动改表。
- 不允许用 JSONB 逃避清晰建模，除非文档明确字段为灵活配置，如 `site_settings.value`、`widgets.payload`。
- slug 必须唯一。
- 公开查询必须过滤 `status` 和 `visibility`。
- 媒体文件必须先进入 `media_assets`，内容表只引用 media id。

## 内容和后台约束

- Dock App 列表是产品结构，不允许通过后台随意新增核心 App。
- 文章、项目、图片、链接、Widget 必须能后台维护。
- About 的核心品牌文案可以静态，但头像、当前状态、联系方式应允许后台更新。
- Contact 留言不得通过前端直连数据库写入，必须走 `/api/contact`。

## 测试约束

每个阶段至少满足：

| 类型 | 要求 |
| --- | --- |
| 类型检查 | `pnpm --dir apps/web typecheck`、`uv run --project apps/api mypy app` |
| Lint | `pnpm --dir apps/web lint`、`uv run --project apps/api ruff check .` |
| 单元测试 | 前端工具函数、Zod schema、后端 service、Pydantic schema |
| 组件测试 | 复杂 UI 组件 |
| E2E | 关键用户路径 |
| 视觉检查 | 重大 UI 改动后使用 Playwright 截图 |

不得以“后面再测”为理由合并会影响公开体验或后台数据的改动。

## 文档更新规则

| 改动类型 | 必须更新 |
| --- | --- |
| 新页面、新按钮、新跳转 | 页面与功能模块文档 |
| 颜色、圆角、布局、动效变化 | UI 规范 |
| 新依赖、新部署方式、新服务 | 技术架构文档 |
| 新表、新字段、新 enum、新索引 | 数据库设计文档 |
| 新接口、接口字段变化、权限变化 | API 文档 |
| 阶段优先级变化 | 开发任务拆解文档 |
| 开发规则变化 | AIcoding 约束文档 |

## 变更例外流程

如果确实需要偏离当前文档，必须按顺序执行：

1. 说明为什么当前方案无法满足需求。
2. 给出最小变更方案。
3. 更新对应文档。
4. 再修改代码。
5. 补充测试。
6. 在最终说明中明确变更点。

没有完成以上步骤，不允许用代码事实覆盖文档约束。
