# Schedule Background Video Implementation Plan

> **For agentic workers:** Execute task-by-task in this session (inline). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full-viewport fixed scenic background that plays ~5s when the schedule day location changes, then freezes without distortion on mobile/desktop.

**Architecture:** Fixed `#bgMedia` layer under page content; `assets/js/bg-media.js` owns play/stop; day selector reads `data-location` and calls `window.setBackgroundLocation(key)`.

**Tech Stack:** Static HTML/CSS/JS, local H.264 mp4 under `assets/videos/`.

## Global Constraints

- Play duration fixed at 5 seconds then pause (shorter sources end on `ended`).
- `object-fit: cover` only — crop OK, never stretch.
- Background `position: fixed` full viewport; content scrolls over it.
- Mapping: D1–2 yangshuo, D3–4 longji, D5 guilin, D6–9 beihai.
- Muted + `playsinline`; reduced-motion → poster only.

---

### Task 1: Markup + data-location

**Files:**
- Modify: `index.html`

- [x] Add `#bgMedia` before `<article class="page">`
- [x] Set `data-location` on each `.timeline-item`
- [x] Include `assets/js/bg-media.js` before `main.js`

### Task 2: CSS cover background + readability

**Files:**
- Modify: `assets/css/style.css`

- [x] `.bg-media` fixed full viewport, video/img cover
- [x] Overlay for text contrast; `article.page` / cards stay readable
- [x] Soften solid body background so video shows through

### Task 3: bg-media.js

**Files:**
- Create: `assets/js/bg-media.js`

- [x] Implement `window.setBackgroundLocation(key)` with 5s cap, same-key no replay, reduced-motion fallback

### Task 4: Wire day selector

**Files:**
- Modify: `assets/js/main.js`

- [x] On `selectDay`, read `data-location` and call `setBackgroundLocation`

### Task 5: Stock videos + README

**Files:**
- Create: `assets/videos/{yangshuo,longji,guilin,beihai}.mp4` (+ optional `.jpg`)
- Create: `assets/videos/README.md`

- [x] Download free stock, compress ~≤5MB each if possible
- [x] Document replace-by-same-name workflow

### Task 6: Smoke verify

- [x] Open page locally; switch D1/D3/D5/D6; confirm 5s play, freeze, no stretch, scroll keeps bg fixed
