# PoE Ninja 中文化 Chrome 插件

将 [poe.ninja](https://poe.ninja) 页面内容实时翻译为**简体中文**或**繁体中文**，方便中文玩家查阅构筑、物价、天赋树等信息。

## 功能

- 实时翻译页面文本（构筑、物价、技能、天赋树等所有主要页面）
- 支持简体中文 / 繁体中文 / 关闭（保持英文原文）切换
- 收录约 1000 条 PoE2 专业术语词典，覆盖技能、装备、通货、Boss 等
- 支持罗马数字后缀匹配（如 "Execute II" → "处决 II"）
- 使用 MutationObserver 监听动态加载内容，无需刷新页面

## 安装

目前尚未上架 Chrome Web Store，需手动加载：

1. 下载或克隆本仓库到本地
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角**开发者模式**
4. 点击**加载已解压的扩展程序**，选择本仓库根目录
5. 访问 [poe.ninja](https://poe.ninja)，页面内容将自动翻译

## 使用

点击浏览器工具栏的插件图标，可切换语言：

- **简体中文**（默认）
- **繁体中文**
- **关闭**（还原英文）

## 文件结构

```
├── manifest.json       # 插件配置
├── dictionary.js       # 中文词典（简体 + 繁体）
├── content.js          # 主翻译逻辑
├── observer.js         # 动态内容监听
├── ui.js               # UI 辅助
├── popup/
│   ├── popup.html      # 弹出界面
│   └── popup.js        # 弹出逻辑
├── icons/              # 插件图标
└── references/
    └── term-dictionary.md  # 术语参考文档
```

## 词典维护

词典位于 `dictionary.js`，分为 `DICT_ZH_CN`（简体）和 `DICT_ZH_TW`（繁体）两个 Map。

添加新词条：

```js
["Skill Name", "技能名称"],
```

## 版本

`0.1.0` — 初始版本
