# 原神抽卡点名器 · 修复增强版

> 一个用「原神抽卡」的方式点名 / 抽人的小工具。抽到谁，就像抽卡出金一样。

**这个版本修好了官方版的两个毛病：**

- ❌ 官方 Electron 版双击后 **卡在加载界面**（进度条永远停在 0%）
- ❌ **每次启动都要重新导入名单**

**并新增：一圈内点名不重复。**

---

## ⬇️ 直接下载（Windows，解压即用）

### [点这里下载 → genish-impact-win32-x64-fixed.zip（250 MB）](https://github.com/Hina52015/genshin-impact/releases/download/v0.1.3-fix2-fixed/genish-impact-win32-x64-fixed.zip)

**三步就能用：**

1. 下载后 **右键 → 解压到当前文件夹**
2. 双击里面的 **genish-impact.exe**
3. 防火墙弹窗 → 点 **允许**；出现「未知发布者」→ **更多信息 → 仍要运行**

> 不需要安装、不需要管理员权限、不需要联网。

---

## 📋 怎么用

**1. 准备名单** —— 新建一个 txt 文件（**保存时选 UTF-8 编码**），每行一个人：

```
5 张三
4 李四
3 王五
```

- 格式是「**星级 空格 名字**」
- 星级只能填 **3、4、5**（填别的不会出结果）
- 名字里**不要有空格**

**2. 导入名单** —— 打开程序，点**页面左上角的问号按钮**，选择那个 txt。

**3. 开始点名** —— 选点名模式，点抽卡。一圈之内每个人只会被抽到一次，全部抽完自动开始新一轮。

> 💡 导入一次就够了，以后打开程序名单还在。

---

## 🧾 关于文件名的小提示

文件名叫 genish-impact.exe，这里少了一个 n —— **这是上游项目本来的拼写，不是笔误**。

上游的打包脚本里写死的就是这个名字（electron-packager ./ genish-impact），
官方发布的所有文件也都叫这个。为了和原版保持一致，这里没有改名。

---

## 🔧 修复了什么（技术细节）

### 1. 修复：Electron 版卡在加载界面（对应上游 Issue #83）

**现象**：Windows 压缩包版双击后，窗口能弹出，但进度条永远停在 Connecting、0%，等多久都不动。

**根因**：打包产物中的 static/index.html 引用了 start-f8fe3a3c.js，
而该版本实际打包出的入口脚本是 start-d03a7c04.js。
两者不一致 → 入口脚本 404 → SvelteKit 无法 hydrate → 页面停在预渲染的加载画面。

**修复**：将 index.html 中的引用改为实际存在的 start-d03a7c04.js。

### 2. 修复：每次启动都要重新导入名单

**根因**：main.js 中 express 使用 listen(0) 随机端口（上游 Issue #52 也提到）。
浏览器存储按「源（协议+域名+端口）」隔离，端口一变就等于换了一个新网站，
localStorage 里的名单、设置、保底记录全部丢失。

**修复**：固定端口 47821；若被占用则自动回退到随机端口。

### 3. 新增：点名抽过不重复

- 一轮内每个人只会被抽到一次
- 全部抽完自动开启新一轮
- 每次启动程序时重置本轮（关闭再打开 = 新的一轮）

记录存在 localStorage 的 __md 键，不影响名单本身。

### 4. 改进：随机数质量

点名抽人由 Math.random() 改为 crypto.getRandomValues()，并使用拒绝采样消除取模偏差。

### 5. 改进：窗口

- 显示系统标题栏（最小化 / 最大化 / 关闭按钮）
- 启动即最大化，但**保留边框**（不是全屏）
- 按显示器可用区自动计算尺寸，兼容 350% 等高 DPI 缩放，保证窗口永不超出屏幕

### 改动的文件

只有以下几个（其余与上游一致）：

```
electron-static/
├── main.js                                  ← 端口固定 / 窗口 / 缩放
└── static/
    ├── index.html                           ← 入口修正 + 启动重置
    └── internal/immutable/chunks/
        ├── i18n-9a7a1fd0.js                 ← 点名池过滤 + crypto 随机
        └── _page-3e92b9ab.js                ← 记录已抽取成员
```

---

## 📄 许可证

沿用上游的 **CC BY-NC-SA 4.0**，详见 [LICENSE](./LICENSE)。

- ✅ 可以自由使用、修改、分发
- ✅ 必须署名原作者
- ✅ 修改版必须使用相同协议
- ❌ **不得用于商业用途**

## 🙏 致谢

- 上游项目：[animation-picker/genshin-impact](https://github.com/animation-picker/genshin-impact)
- 原始作者：AguzzTN54、cyanial、luyanci 等
- 原始 Wish Simulator：[Mantan21/Genshin-Impact-Wish-Simulator](https://github.com/Mantan21/Genshin-Impact-Wish-Simulator)

> 上游项目目前已归档（Archived），本仓库为其修复分支。

---

## 以下为上游原始 README

<div align="center">

# 原神抽卡模拟器

[文档](https://docs.tpsw.xyz/)·[下载](https://github.com/cyanial/genshin-impact-picker/releases/latest)

![原神点名器](https://stats.deeptrain.net/repo/cyanial/genshin-impact-picker/?theme=light)

</div>

[![发布状态](https://github.com/cyanial/genshin-impact-picker/actions/workflows/release.yml/badge.svg)](https://github.com/cyanial/genshin-impact-picker/actions/workflows/release.yml) [![页面状态](https://github.com/cyanial/genshin-impact-picker/actions/workflows/page.yml/badge.svg)](https://github.com/cyanial/genshin-impact-picker/actions/workflows/page.yml) [![应用构建状态](https://github.com/cyanial/genshin-impact-picker/actions/workflows/app.yml/badge.svg)](https://github.com/cyanial/genshin-impact-picker/actions/workflows/app.yml)

## 注意

> 感谢 [Genshin-Impact-Wish-Simulator](https://github.com/Mantan21/Genshin-Impact-Wish-Simulator) 作者的[批准](https://github.com/Mantan21/Genshin-Impact-Wish-Simulator/issues/95)。

## 使用方法

>以下任一方式完成后，请查看[配置教程](http://docs.mznet.pro/users/configure)

### 应用程序(推荐)

从[github release](https://github.com/cyanial/genshin-impact-picker/releases/latest)中按照发行说明来获取对应系统的程序包即可

### 公共站点

> 尽量先使用应用程序，站点可能存在网络波动

> 欢迎大家在不影响正常使用的情况下，分享自己部署的点名器站点，以供大家共同使用：


1. [genshin.jerryz.com.cn](https://genshin.jerryz.com.cn/)
2. [demo-picker.shawn404.top](https://demo-picker.shawn404.top)

更多的公共站点可在[文档：公共站点](http://docs.tpsw.xyz/users/public)中查看

## 更多

更多的使用方法及开发文档可在[这里](http://docs.tpsw.xyz)查看

## 许可证

本项目采用 `CC BY-NC-SA 4.0` 许可证，不得用于商业用途。

### 原仓库许可证：WishSimulator（MIT 许可证）

```
MIT License

Copyright (c) 2022 WishSimulator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAM
