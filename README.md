# 原神抽卡点名器 · 修复增强版

> ⚠️ **本项目是修改版（fork）**
>
> 基于 [animation-picker/genshin-impact](https://github.com/animation-picker/genshin-impact) 二次修改，
> 原作者与贡献者：AguzzTN54、cyanial、luyanci 等。
>
> 遵循原项目的 **CC BY-NC-SA 4.0** 协议：**禁止商业用途**，转载/发布必须署名并使用相同协议。
> 本修改版同样**不得用于任何商业用途**。

---

## 这个版本做了什么

### 1. 修复：Electron 版卡在加载界面（对应上游 Issue #83）

**现象**：Windows 压缩包版双击后，窗口能弹出，但进度条永远停在 "Connecting"、0%，等多久都不动。

**根因**（已定位到具体文件）：

打包产物里的 static/index.html 引用了 **start-f8fe3a3c.js**，
而该版本实际打包出来的入口脚本是 **start-d03a7c04.js**。

两者对不上 → 入口脚本 404 → SvelteKit 无法 hydrate →
页面就停在预渲染出来的静态加载画面上，永远不会前进。

**修复**：把 index.html 里的两处引用改成实际存在的 start-d03a7c04.js。

### 2. 修复：每次启动都要重新导入名单

**根因**：main.js 中 express 使用 listen(0, ...) 随机端口（上游 Issue #52 也提到这点）。
浏览器存储按"源（协议+域名+端口）"隔离，端口一变就等于换了一个新网站，
localStorage 里的名单、设置、保底记录全部丢失。

**修复**：改为固定端口 47821；若被占用则自动回退到随机端口（此时存储仍会重置，但至少能启动）。

### 3. 新增：点名抽过不重复

- 一轮内每个人只会被抽到一次
- 全部抽完自动开启新一轮
- 每次启动程序时重置本轮（关闭再打开 = 新的一轮）

记录存在 localStorage 的 __md 键，不影响名单本身。

### 4. 改进：随机数质量

点名抽人由 Math.random() 改为 crypto.getRandomValues()，
并使用拒绝采样消除取模偏差。

### 5. 改进：窗口

- 显示系统标题栏（最小化 / 最大化 / 关闭按钮）
- 启动即最大化，但**保留边框**（不是全屏）
- 按显示器可用区自动计算尺寸，兼容 350% 等高 DPI 缩放，保证窗口永不超出屏幕

---

## 文件说明

本仓库中，被修改的文件只有以下几个（其余与上游一致）：

    electron-static/
    ├── main.js                                  ← 端口固定 / 窗口 / 缩放
    ├── package.json                             ← 与上游一致
    └── static/
        ├── index.html                           ← 入口修正 + 启动重置
        └── internal/immutable/chunks/
            ├── i18n-9a7a1fd0.js                 ← 点名池过滤 + crypto 随机
            └── _page-3e92b9ab.js                ← 记录已抽取成员

详细的逐文件改动见 [CHANGES.md](./CHANGES.md)。

---

## 如何使用

### 方式一：使用我打包好的程序

见本仓库的 **Releases** 页面。

### 方式二：自己用上游的包 + 本仓库的文件

1. 从上游 Releases 下载 genish-impact-Windows-X64.zip（v0.1.3-fix2）
2. 解压后，把本仓库 electron-static 下的对应文件覆盖进去
   （注意：本仓库对应的是解包后的 resources/app 明文目录结构）
3. 双击 genish-impact.exe

### 点名名单格式

新建一个 txt（UTF-8 编码），每行一个：

    5 张三
    4 李四
    3 王五

星级只能填 3、4、5。进程序后点左上角的问号按钮上传。

---

## 许可证

本项目沿用上游的 **CC BY-NC-SA 4.0**，详见 [LICENSE](./LICENSE)。

- ✅ 可以自由使用、修改、分发
- ✅ 必须署名原作者
- ✅ 修改版必须使用相同协议
- ❌ **不得用于商业用途**

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
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
## Star History

<a href="https://star-history.com/#animation-picker/genshin-impact&Timeline">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=animation-picker/genshin-impact&type=Timeline&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=animation-picker/genshin-impact&type=Timeline" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=animation-picker/genshin-impact&type=Timeline" />
 </picture>
</a>>
