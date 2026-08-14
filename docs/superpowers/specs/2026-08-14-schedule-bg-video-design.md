# 行程日程背景美景视频 — 设计规格

日期：2026-08-14  
状态：已确认并实现

## 目标

在「详细时间表」切换到某一天时，整页固定背景自动播放对应地点的短视频；**播放时长固定为 5 秒**，到时暂停并定格当前帧、不循环。滚动页面时内容移动，背景视频/定格画面始终铺满视口（`position: fixed`）。后续可用同名文件替换素材。

## 已确认决策

| 项 | 选择 |
|----|------|
| 素材来源 | 本地免版权短视频（`assets/videos/`），后续可同名替换 |
| 背景范围 | 整页固定层 |
| 滚动行为 | 背景跟随视口（fixed），不随内容滚走 |
| D5 映射 | 桂林市区 |
| 播放时长 | 固定 5 秒后 pause 定格（片源不足 5 秒则 ended 定格） |
| 画面比例 | 手机/桌面分别铺满视口；允许裁切，禁止拉伸变形 |

## 地点与文件映射

| 天数 | 地点 key | 视频文件 | Poster（可选） |
|------|----------|----------|----------------|
| D1–D2 | `yangshuo` | `assets/videos/yangshuo.mp4` | `assets/videos/yangshuo.jpg` |
| D3–D4 | `longji` | `assets/videos/longji.mp4` | `assets/videos/longji.jpg` |
| D5 | `guilin` | `assets/videos/guilin.mp4` | `assets/videos/guilin.jpg` |
| D6–D9 | `beihai` | `assets/videos/beihai.mp4` | `assets/videos/beihai.jpg` |

同地点多天共用同一文件；仅在地点 key 变化时切换并播放。

## 结构

```
body
├── #bgMedia.bg-media          (fixed, inset 0, z-index 底层)
│   ├── video#bgVideo          (object-fit: cover; muted; playsinline)
│   └── .bg-media-overlay      (半透明遮罩，保证正文对比度)
└── article.page               (正常文档流，相对更高 z-index)
```

- 不改动现有章节 DOM 语义；仅增加背景层与脚本钩子。
- 遮罩建议：浅青/白半透明渐变，与现有 `--bg` 色系协调，避免紫色/高对比霓虹。

### 比例与裁切（手机 / 电脑）

- 视频与 poster 均：`width/height: 100%`；`object-fit: cover`；`object-position: center`（必要时按地点微调，如海平线略偏下）。
- **允许裁切边缘，禁止 `fill` / 非等比缩放**，保证横竖屏、手机与桌面都无变形。
- 容器始终铺满视口（含 `100dvh` / `100vh`），不随设备改用不同变形策略；仅靠 cover 自适应。
- 横屏手机同样 cover，不单独拉扁画面。

## 行为

1. **切日**：`selectDay(day)` 根据映射得到 `locationKey`。
2. **同 key**：不重播；保持当前定格或已在播状态。
3. **异 key**：
   - 更新 `video.src`（及 poster）；
   - `currentTime = 0`，`play()`（静音）；
   - `loop = false`；
   - **固定播 5 秒**：用 `timeupdate` / `setTimeout(5000)` 在 `currentTime >= 5`（或超时）时 `pause()` 并定格；若片源短于 5 秒则在 `ended` 时定格（不强行拉长）。
4. **首次进入 D1**：加载并播放 `yangshuo` 共 5 秒。
5. **自动播放失败 / reduced-motion**：只显示对应 poster（或视频首帧），不自动播放。
6. **预加载**：可对下一可能地点做轻量 `preload="metadata"`；不全量预下全部视频以控制流量。
7. **切日打断**：换地点时清除上一轮 5s 定时器，避免旧定时器误停新视频。

## 脚本改动

- 在 `assets/js/main.js` 的 Day Selector 模块中：
  - 为每个 `timeline-item` 增加 `data-location`（或用 day→key 表）；
  - `selectDay` 末尾调用 `setBackgroundLocation(key)`。
- 新建 `assets/js/bg-media.js`（或同文件内独立 IIFE）暴露 `setBackgroundLocation`，职责单一：换源、播一次、定格、降级。
- `index.html` 增加背景 DOM，并在 `main.js` 之前或之后按依赖引入 `bg-media.js`（若独立文件，需在 day selector 可调用到）。

推荐：`data-location` 写在各 `timeline-item` 上，避免 JS 硬编码与 HTML 漂移。

## 素材要求

- 来源：Pexels / Pixabay 等可商用免版权；题材贴近漓江/喀斯特、梯田、桂林城景、海滨。
- 规格：片源建议 ≥5 秒（实现侧只播前 5 秒）；尽量压缩到每条约 &lt;5MB（H.264 mp4）；分辨率约 1280×720 或更低即可做背景。
- 仓库内保留简短 `assets/videos/README.md` 说明替换方式与建议命名。

## 错误与边界

- 文件 404：保持上一有效背景或纯色 `--bg`，控制台警告，不打断日程切换。
- 快速连点不同天：取消/忽略过期的 `play()` Promise；以最后一次选中的 key 为准。
- 移动端：`playsinline` + `muted`；iOS 定格依赖 pause-at-end，一般可用。

## 验收标准

- [ ] 切换 D1↔D3↔D5↔D6 时背景视频切换，各播约 5 秒后定格停住。
- [ ] 在同一地点天数间切换（如 D1↔D2）不重播。
- [ ] 页面上下滚动时背景始终铺满视口。
- [ ] 手机与桌面（含横竖屏）背景无拉伸变形；可裁切但不失真。
- [ ] 正文（时间表、卡片）可读，不被视频淹没。
- [ ] 用同名 mp4 替换后无需改代码即可生效。

## 非目标

- 不嵌入 YouTube/B 站外链播放器。
- 不做音轨（背景必须静音）。
- 不按小时段细分到景点级视频（仅按四大地点）。
