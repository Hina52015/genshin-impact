# 改动清单（逐文件）

本修改版相对上游 `animation-picker/genshin-impact` v0.1.3-fix2 的全部改动。

---

## 1. electron-static/main.js

**改动**：整个文件重写（原版仅 2285 字节）。

| 项 | 原版 | 本版 |
|---|---|---|
| 端口 | `listen(0)` 随机端口 | 固定 `47821`，占用时回退随机 |
| 窗口边框 | `frame: false`（无边框） | `frame: true`（系统标题栏） |
| 窗口尺寸 | 固定 1080×1920 | 按显示器可用区计算，9:16，永不超出 |
| 最大化 | 无 | 启动即最大化（保留边框） |
| 最小尺寸 | 无 | 240×360 |

**为什么改端口**：浏览器存储按源隔离，端口随机会导致每次启动都是"新站点"，
localStorage 全部丢失（名单、设置、保底记录）。

---

## 2. electron-static/static/index.html

**改动 1**：入口脚本引用（2 处）

    改前：start-f8fe3a3c.js
    改后：start-d03a7c04.js

**原因**：包里实际存在的入口是 start-d03a7c04.js，原引用指向的文件不存在，
导致整站 JS 不执行，界面停在预渲染的加载画面（上游 Issue #83）。

**改动 2**：在 </head> 前插入一行脚本

    <script>try{localStorage.removeItem('__md')}catch(e){}</script>

**原因**：实现"关闭再打开 = 新一轮点名"。
只清除 __md 这一个键（本轮已抽名单），不影响用户名单与抽卡记录。

---

## 3. electron-static/static/internal/immutable/chunks/i18n-9a7a1fd0.js

（该文件是打包后的 itemdrop-base 模块）

**改动 1**：点名候选池过滤

    改前：ie=()=>v.map(e=>(e.type="member",e.weaponType="catalyst",e))
    改后：读取 localStorage 的 __md，过滤掉本轮已抽过的人；
          若全部抽完则清空记录、重新开始一轮

**改动 2**：随机选取函数

    改前：e[Math.floor(Math.random()*e.length)]
    改后：crypto.getRandomValues + 拒绝采样（消除取模偏差）

---

## 4. electron-static/static/internal/immutable/chunks/_page-3e92b9ab.js

**改动**：在 _memberWish 抽中成员后，把该成员写入 localStorage 的 __md。

    位置：wo.init({stdver:e,phase:t,version:s}).get(l) 之后、return 之前

**原因**：配合第 3 项的过滤逻辑，实现"抽过不重复"。

---

## 5. electron-static/package.json

**改动**：无（与原版一致，仅用于对照/打包）。

---

## 未改动的部分

- 抽卡概率、50/50、保底、定轨逻辑：**完全未改**
- 所有图片素材：**未改**
- 名单导入解析逻辑：**未改**

---

## 验证方式

改动后已通过以下验证：

1. asar 解包完整：4461 个文件，大小与官方 app.asar（156,782,821 字节）一致
2. 三个 JS 文件 `node --check` 语法通过
3. package.json 可正常 JSON.parse
4. 起本地 express 实测：首页、入口脚本、图片均返回 HTTP 200 且 MIME 正确
5. index.html 引用的 12 个缺失文件中有 11 个属于 modulepreload（非致命），
   唯一致命的入口引用已修复

**注意**：以上为静态验证，未在真实 Windows 环境运行过（开发环境不含 Windows）。
