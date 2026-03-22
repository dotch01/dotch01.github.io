---
layout: post
title:  "網站大更新：側欄功能、搜尋修復與CI自動化測試"
author: dot
categories: [ github, git page ]
tags: [ github, jekyll, CI ]
image: assets/images/16.jpg
beforetoc: "紀錄這次對個人頁面進行的大規模功能改進，包含右側欄快捷功能、搜尋引擎修復、分頁跳轉、以及GitHub Actions自動化測試的導入過程。"
toc: true
featured: true
hidden: false
---

## 前言

這個個人頁面從建立以來一直使用 Mediumish Jekyll 主題的基本架構，用起來雖然沒有大問題，但一直覺得功能上有很多可以改進的地方。趁這次有空，決定做一次比較全面的更新，同時也藉這個機會練習 CI/CD 自動化測試的佈署。

## 這次改了什麼

### 1. 修復搜尋功能

原本的搜尋功能其實是**完全壞掉的**——搜尋索引裡面存的是原主題的 demo 文章資料，指向 `wowthemesnet.github.io`，根本不是我的文章。

**修復方式：**
- 將 `lunrsearchengine.js` 改為使用 Jekyll 的 Liquid 模板引擎，在**建置時（build time）**自動從 `site.posts` 生成搜尋索引
- 加入 `escapeHtml()` 函數防止 XSS 注入（原本搜尋結果直接用 `innerHTML` 插入未過濾的內容）
- 搜尋結果 Modal 配色改為符合暗色主題

```javascript
// 原本：硬編碼的 demo 資料
var documents = [{ "id": 0, "url": "https://wowthemesnet...", ... }];

// 修改後：Liquid 動態生成
var documents = [
  { "id": 0, "url": "實際文章URL", "title": "實際標題", ... }
];
```

### 2. 新增右側欄（Sidebar）

在首頁加入了右側欄，包含四個快捷元件：

| 元件 | 功能 |
|------|------|
| 搜尋框 | 直接在側欄搜尋文章 |
| 文章分類 | 列出所有分類及文章數量，點擊跳轉 |
| 標籤雲 | 所有標籤一目了然 |
| 最新文章 | 最近 5 篇文章快速連結 |

佈局使用 Bootstrap 的 `col-lg-8` + `col-lg-4`，在大螢幕顯示側欄，手機版自動堆疊到下方。

### 3. 分頁跳轉功能

原本的分頁只有「上一頁 / 下一頁」和頁碼按鈕，如果文章很多、頁數很多，要跳到很後面的頁面很不方便。

新增了一個「跳至第 N 頁」的輸入框，輸入頁碼按 Go 就能直接跳轉。超過 2 頁時才會顯示。

### 4. 文章頁 TOC 浮動側欄

原本啟用 `toc: true` 的文章，目錄（Table of Contents）是嵌在文章內容裡面的。讀到後面就看不到目錄了。

現在改為：
- **桌面版**：TOC 移到右側 `col-md-2` 區域，使用 `sticky-top` 跟隨滾動
- **手機版**：TOC 保持在文章開頭（行動裝置螢幕空間有限，右側欄不適合）

### 5. Bug 修復

- **Categories 計數錯誤**：`default.html` 底部的文章分類區塊，第一個分支條件用了 `site.tags[category].size` 來顯示分類的文章數——但這是分類不是標籤，修正為 `site.categories[category].size`
- **Bootstrap 版本混用**：CSS 載入 4.1.3、JS 載入 4.2.1，統一為 4.2.1

## CI/CD 自動化測試

這次同時建立了 GitHub Actions 的 CI 管線，這是我第一次實際在自己的專案中導入 CI。

### 管線做了什麼

```yaml
# .github/workflows/ci.yml
jobs:
  build:          # Jekyll 建置 + HTML 品質檢查
  markdown-lint:  # Markdown 格式檢查
```

**build job：**
1. 安裝 Ruby 3.2 + 透過 Bundler 安裝所有 gem
2. `bundle exec jekyll build` — 確認網站能成功建置
3. `htmlproofer` — 掃描 `_site/` 目錄，檢查壞連結、HTML 結構

**markdown-lint job：**
- 使用 `markdownlint-cli2-action` 檢查 `_posts/` 的 Markdown 格式
- 設為 `continue-on-error: true`，目前只做提醒不阻擋

### 心得

導入 CI 最大的好處是**推上去之前就知道有沒有問題**。以前改完 HTML 推上 GitHub Pages，壞掉才發現來不及。現在 push 或開 PR 都會自動跑檢查，在 Actions 頁面可以看綠燈紅燈。

`html-proofer` 特別有用，它能抓到：
- 壞掉的內部連結（比如打錯文章路徑）
- 缺少 alt 屬性的圖片
- 不合法的 HTML 結構

## 後續可以再做的事

1. **Lighthouse CI** — 自動跑效能/無障礙/SEO 評分
2. **Google Analytics 遷移** — 目前用的 Universal Analytics 已停止服務，應遷移到 GA4
3. **移除反複製保護** — 禁用右鍵和 Ctrl+C 對使用者體驗影響很大，考慮移除
4. **eslint / stylelint** — JS 和 CSS 的 Lint 檢查

## 涉及的檔案

| 檔案 | 變更 |
|------|------|
| `Gemfile` | 加入 Jekyll 版本聲明 + html-proofer |
| `assets/js/lunrsearchengine.js` | 重寫搜尋索引為動態生成 |
| `_includes/search-lunr.html` | 修復搜尋 UI |
| `_includes/sidebar.html` | 新建右側欄元件 |
| `_includes/pagination.html` | 新增頁碼跳轉 |
| `index.html` | 加入 sidebar 佈局 |
| `_layouts/default.html` | 修復 bug + 統一 Bootstrap |
| `_layouts/post.html` | TOC 移至右側浮動 |
| `assets/css/main.scss` | 側欄 + TOC 樣式 |
| `.github/workflows/ci.yml` | CI 自動化測試管線 |

## 總結

這次更新算是把一些「一直知道有問題但沒動手修」的東西都處理了。最有成就感的是搜尋修復——之前完全不知道搜尋索引裡面居然是別人的 demo 資料。另外 CI 的導入雖然只是基礎版，但也算是踏出了自動化測試的第一步。
