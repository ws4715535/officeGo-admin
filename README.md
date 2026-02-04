# 来了么 · 管理端 (OfficeGo Admin)

管理端 Web，用于查看「来了么到岗助手」小程序的团队、用户与考勤数据。与小程序共用同一 CloudBase 环境，通过云函数 `admin-api` 只读访问数据。

## 技术栈

- React 18 + Vite 5
- React Router 6
- @cloudbase/js-sdk

## 环境要求

- Node.js 18+
- 小程序项目已部署云函数 `admin-api`，并在 CloudBase 控制台为 `admin-api` 配置环境变量 `ADMIN_SECRET`（管理员密码）

## 配置

1. 复制 `.env.example` 为 `.env.development`（开发）或 `.env.production`（生产）。
2. 设置 `VITE_CLOUD_ENV_ID` 为与小程序相同的 CloudBase 环境 ID（如 `dev-2g131pqic0b2596c`）。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:5174 ，使用与 `ADMIN_SECRET` 相同的密码登录。

## 构建

```bash
npm run build
```

产物在 `dist/` 目录。

## 部署到 CloudBase 静态托管

1. 在 CloudBase 控制台开通「静态网站托管」，与小程序使用同一环境即可。
2. 本地执行 `npm run build`。
3. 使用 CloudBase MCP 的 `uploadFiles` 工具，或将 `dist` 目录内容上传到静态托管根目录。
4. 绑定自定义域名（可选），或使用默认域名 `https://<envId>.tcloudbaseapp.com` 访问。

部署后首次访问会进入登录页，输入与云函数环境变量 `ADMIN_SECRET` 一致的管理员密码即可查看数据。

## 功能说明

- **概览**：团队数、用户数、今日到岗人数；最近团队列表。
- **团队**：团队列表（名称、邀请码、成员数、创建时间）；点击进入团队详情与成员列表。
- **考勤统计**：按月份查看到岗/远程/请假记录汇总及按日明细。

## 下一步操作（首次使用）

1. **在 CloudBase 控制台部署 admin-api 并设置 ADMIN_SECRET**
   - 进入 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)，选择与小程序一致的环境（如 `dev-2g131pqic0b2596c`）。
   - 若尚未部署：在小程序项目中上传/部署云函数 `admin-api`（云开发 → 云函数 → 上传并部署）。
   - 云函数 → 找到 `admin-api` → 配置 → 环境变量：新增 `ADMIN_SECRET`，值为你设定的管理员密码（请使用强密码并妥善保管）。

2. **本地验证**
   - 在项目根目录执行：`npm run dev`。
   - 浏览器打开 http://localhost:5174 ，在登录页输入与 `ADMIN_SECRET` 相同的密码，登录成功后即可查看概览、团队、考勤统计等数据。

## 安全说明

- 管理端不调用小程序端的 `team-api` / `attendance-api`（依赖微信 OPENID），仅调用 `admin-api`。
- `admin-api` 通过环境变量 `ADMIN_SECRET` 校验请求；请勿在前端代码或公开仓库中暴露该值。
- 建议生产环境使用 HTTPS 与强密码，并限制静态托管访问来源（如 IP 或域名白名单）。
