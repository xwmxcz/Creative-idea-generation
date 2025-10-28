## Run Locally

# Creative Idea Generation — 运行与部署说明

这是一个基于 AI Studio 的创意生成应用模板，用于快速在本地运行和部署应用。项目核心功能是通过 AI（例如 Gemini）生成创意点子，并可在 AI Studio 中查看与管理。

应用演示（在 AI Studio 中查看）：
https://ai.studio/apps/drive/18yalBUwL-hLeJcXDohGYNW1SDPOn66s7

## 主要特性
- 使用大型语言模型（如 Gemini）生成创意想法
- 本地开发与调试支持
- 简单的环境配置（通过 .env.local 设置 API Key）
- 可部署到 AI Studio

## 快速开始

先决条件：
- Node.js（建议使用 LTS 版本）

1. 克隆仓库并安装依赖：
```bash
git clone https://github.com/xwmxcz/Creative-idea-generation.git
cd Creative-idea-generation
npm install
```

2. 配置环境变量：
- 在项目根目录创建 `.env.local` 文件，添加你的 Gemini API Key：
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
（将 `your_gemini_api_key_here` 替换为真实的 API key）

3. 启动开发服务器（本地预览）：
```bash
npm run dev
```
默认情况下，应用会在 `http://localhost:3000`（或项目配置的端口）可访问。

## 生产构建与启动
构建：
```bash
npm run build
```
构建完成后启动：
```bash
npm run start
```

## 部署
- 项目已集成可在 AI Studio 中查看的版本。要在 AI Studio 或其它平台部署，请确保在目标环境中设置了 `GEMINI_API_KEY` 环境变量。
- 若部署到自托管服务器或云平台（如 Vercel、Netlify、Heroku 等），请参考各平台文档设置环境变量并使用相应的部署流程。

## 配置说明
- .env.local：本地开发时使用的环境变量文件（不应提交到仓库）
  - GEMINI_API_KEY — 必需，调用 Gemini 或其他 LLM 服务的密钥

## 常见问题（FAQ）
- Q：未设置 GEMINI_API_KEY 会怎么样？
  A：应用无法调用模型接口，相关功能会报错或不可用。
- Q：如何更换/使用其它模型？
  A：在调用模型的代码处替换相应的客户端或 API 接口（查看项目源码中的模型调用实现）。

## 贡献与反馈
欢迎提 issue 或 pull request 来修复 bug、添加功能或改进文档。

## 许可证
请在仓库中查看 LICENSE 文件（如果有）以了解许可信息。
