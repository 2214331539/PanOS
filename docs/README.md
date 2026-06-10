# PanOS 项目文档索引

版本：v0.1  
日期：2026-06-07  
需求来源：根目录 [产品介绍.md](/Users/admin/Research/PanOS/产品介绍.md)

本目录是 PanOS 后续开发的约束源。每次开发前必须先阅读本目录；每次完成会影响产品、UI、接口、数据库或开发规则的功能后，必须同步更新对应文档。

## 文档列表

| 文件 | 用途 |
| --- | --- |
| [01-产品定位与范围说明.md](/Users/admin/Research/PanOS/docs/01-产品定位与范围说明.md) | 明确 PanOS 是什么、不是什么、给谁用、V1 到 V4 的边界 |
| [02-页面与功能模块划分.md](/Users/admin/Research/PanOS/docs/02-页面与功能模块划分.md) | 明确页面、模块、按钮、跳转、数据来源和后台管理范围 |
| [03-UI视觉与交互规范.md](/Users/admin/Research/PanOS/docs/03-UI视觉与交互规范.md) | 固定视觉语言、组件样式、动效、响应式和主题规则 |
| [04-技术架构文档.md](/Users/admin/Research/PanOS/docs/04-技术架构文档.md) | 固定唯一技术栈、目录结构、缓存、存储、安全和部署方式 |
| [05-数据库设计文档.md](/Users/admin/Research/PanOS/docs/05-数据库设计文档.md) | 固定数据表、字段、关系、枚举、索引和迁移原则 |
| [06-API接口文档.md](/Users/admin/Research/PanOS/docs/06-API接口文档.md) | 固定前后端交互接口、请求响应格式和权限规则 |
| [07-开发任务拆解文档.md](/Users/admin/Research/PanOS/docs/07-开发任务拆解文档.md) | 明确开发阶段、交付物、验收标准和优先级 |
| [08-AIcoding约束文档.md](/Users/admin/Research/PanOS/docs/08-AIcoding约束文档.md) | 约束 AI 或人工开发时不得偏离技术栈、接口、UI 和文档 |
| [09-部署文档.md](/Users/admin/Research/PanOS/docs/09-部署文档.md) | Vercel + Railway 部署步骤、环境变量清单和上线检查清单 |

## 文档优先级

当不同文档出现冲突时，按以下顺序处理：

1. [08-AIcoding约束文档.md](/Users/admin/Research/PanOS/docs/08-AIcoding约束文档.md)
2. [04-技术架构文档.md](/Users/admin/Research/PanOS/docs/04-技术架构文档.md)
3. [05-数据库设计文档.md](/Users/admin/Research/PanOS/docs/05-数据库设计文档.md)
4. [06-API接口文档.md](/Users/admin/Research/PanOS/docs/06-API接口文档.md)
5. [03-UI视觉与交互规范.md](/Users/admin/Research/PanOS/docs/03-UI视觉与交互规范.md)
6. [02-页面与功能模块划分.md](/Users/admin/Research/PanOS/docs/02-页面与功能模块划分.md)
7. [01-产品定位与范围说明.md](/Users/admin/Research/PanOS/docs/01-产品定位与范围说明.md)

冲突修复方式：先修改高优先级文档，再同步低优先级文档，最后再写代码。

