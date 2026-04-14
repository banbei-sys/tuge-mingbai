# ✨ 图个明白 - 右键点击网页图片，一键生成中英双语 AI 绘图提示词

<img width="943" height="650" alt="Snipaste_2026-04-15_00-44-41" src="https://github.com/user-attachments/assets/17bac71d-a149-4888-bd96-f7abfa1b04ea" />


![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 功能特性

- 右键任意网页图片，一键触发 AI 分析
- 同时生成**英文 Prompt** 和**中文提示词**
- 自动提取图片风格关键词（含中英对照）
- 支持编辑提示词，实时中英互译同步
- 本地缓存历史记录，已分析图片秒出结果
- 支持批量分析，队列进度实时展示
- 浮窗面板可拖拽、可缩放
- 兼容 OpenAI / Gemini / Claude 及任意 OpenAI 格式接口

## 安装方法

1. 下载或克隆本仓库
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择本项目文件夹
5. 点击扩展图标，配置 API Key 即可使用

## 配置说明

| 字段 | 说明 |
|------|------|
| API Key | 你的 OpenAI / Gemini / Claude 密钥 |
| Base URL | API 服务地址，默认 `https://api.openai.com` |
| 模型 | 需支持视觉（Vision）能力，推荐 `gpt-4o` |

所有配置**仅存储在本地浏览器**，不会上传至任何服务器。

## 使用方法

1. 在任意网页上**右键点击图片**
2. 选择「✨ 图个明白：生成 AI 提示词」
3. 等待分析完成，结果以浮窗形式展示
4. 点击「复制」按钮一键复制提示词
5. 点击关键词标签可单独复制

## 技术栈

- Chrome Extension Manifest V3
- Vanilla JavaScript（无框架依赖）
- OpenAI Chat Completions API（Vision）

## 开发者

基于 AI 技术，由 **CHEN** 设计开发 · Chrome 插件
