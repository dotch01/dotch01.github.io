---
layout: post
title: "OPUS 系列 — 遊戲系統架構分析"
author: dot
date: 2026-03-23 12:30:00 +0800
published: true
categories: [ game-design, system-design ]
tags: [ sigono, OPUS, architecture ]
image: assets/images/16.jpg
beforetoc: "這篇文章從 Sigono 工程師職缺需求與 OPUS 系列公開玩法出發，推理三款作品可能採用的系統架構與工程實作方式。重點不是宣稱我看過原始碼，而是展示我如何把設計需求翻譯成工程問題。"
toc: true
featured: true
hidden: false
---

## 前言

這篇文章的目的，不是宣稱我看過 `Sigono` 的原始碼，而是試著從兩種公開資訊反推出他們在 `OPUS` 系列上**很可能**會遇到的系統設計問題與對應的工程解法：

1. `OPUS` 系列三款作品在 Steam 頁面上可觀察到的玩法結構
2. 104提供的工程師職缺需求與加分條件

因此，本文採取的立場不是「這就是官方架構」，而是：

> 根據作品設計與職缺要求，這些系統長什麼樣子最合理、哪些技術選擇最有可能、又會帶來什麼實際工程代價。

這樣寫的目的，是希望面試官看到我不只會描述遊戲體驗，也能把需求翻譯成具體的系統拆解、工具需求、平台風險與實作策略。

## 資料基礎與推理邊界

本文的推理基礎來自兩部分：

### 1. 可直接支持的職缺資訊

根據已知訊息來看，至少可以直接支持以下幾點：

- 熟悉遊戲引擎與相關程式語言：`Unity 3D / C#` 或 `Unreal / C++`
- 工作內容包含：
  - 製作與分析內部編輯工具
  - 設計與改善內部工具
  - 遊戲移植到多平台
  - 處理玩家與 QA 回報問題
  - 對遊戲功能進行測試
  - 設計、實作與部署自動化測試工具
- 加分條件包含：
  - 具備 Steam / iOS / Android 上架經驗
  - 熟悉 Steam / Android / iOS 平台 SDK 串接
  - 有 `AWS`、`Firebase` 等雲端平台經驗
  - 有 `Jenkins`、`Gitlab`、`Github Actions` 等自動化建置平台經驗

### 2. 可由遊戲公開頁面支持的玩法資訊

從三款作品可以查詢到的頁面，可以直接確認：

- 《地球計畫》核心包含太空望遠鏡掃描與船艙探索
- 《靈魂之橋》核心包含廢土探索、材料收集、工具製作與大量物件敘事
- 《龍脈常歌》核心包含航行、角色分工、輕量解謎與資源管理

### 3. 本文的寫法原則

所以本文會保留具體技術細節，但調整成這種語氣：

- **職缺可直接支持**：可以寫得比較肯定
- **從玩法與職缺交叉推導**：用「高度可能」、「較合理的實作方式」描述
- **無法由公開資訊直接證明的內部命名**：視為架構草圖或示意模型，而不是官方定義

---

## 一、技術棧基準推斷

從職缺需求反推，`Sigono` 的實際工作環境高度可能圍繞以下技術能力展開：

- **引擎 / 主要開發語言**：`Unity 3D + C#`
  - 原因：職缺把 `Unity 3D / C#` 列為首要技能條件，這足以支持本文以 Unity 生態系作為主要推理基準
- **平台與上架鏈**：`Steam / iOS / Android`
  - 原因：職缺加分條件直接寫明 App 上架經驗與平台 SDK 串接經驗
- **後端 / 雲端能力**：`AWS`、`Firebase`
  - 原因：職缺明確列出雲端平台經驗
- **CI / 自動化測試能力**：`Jenkins`、`Gitlab`、`Github Actions`
  - 原因：職缺明確列出自動化建置平台與「設計、實作與部署自動化測試工具」工作內容
- **跨平台整合能力**：Steam / Android / iOS SDK 為明確要求；若考慮系列作品後續跨平台發行經驗，主機平台整合與認證流程也很可能是團隊會接觸到的實務問題

這個技術背景會直接影響整個系統架構的思考方式：

- Unity 專案通常傾向 `scene + state + data-driven content` 的混合模式
- 若要支援 Steam / iOS / Android，就必須從一開始考慮 SDK 整合、存檔位置、應用生命週期與平台差異
- 若工作內容包含內部工具與自動化測試，代表系統設計不能只顧 runtime，還要顧 editor tooling 與 pipeline

---

## 二、三款遊戲的系統架構拆解

## 🌍 地球計畫 — 系統架構

### 核心架構模式：`Scene-State Machine + Event Bus`

```text
[GameManager] ── 全局狀態機
    ├── TelescopeScene (掃描模式)
    │     ├── StarFieldRenderer ← 程序生成星域
    │     ├── ScanTargetSystem ← Mission目標判定
    │     └── PlanetDataGenerator ← 行星數值生成
    ├── ShipScene (船艙模式)
    │     ├── RoomUnlockController　← 進度閘門邏輯
    │     ├── InteractableObjectPool　← 互動物件管理
    │     └── CutsceneDirector　← 過場動畫觸發
    └── NarrativeEventBus　← 全局敘事事件派發
```

這裡的類別名稱不是在聲稱官方真的這樣命名，而是把《地球計畫》的玩法需求翻譯成一個最合理的 Unity 架構草圖。

從公開玩法來看，這款作品至少明確分成兩個互動層：

- 掃描星域的望遠鏡模式
- 船艙敘事探索模式

因此，用狀態機去管理「目前玩家在哪個模式」，再用事件系統把掃描結果與敘事觸發解耦，是相當自然的做法。

### 星域渲染系統

最關鍵的技術挑戰，是「大量星體的渲染與互動判定」。若以 Unity 實作，較合理的方式包括：

- `Procedural Star Generation`
  - 以 `seed-based RNG` 在 runtime 生成星域座標，確保跨裝置與跨存檔的一致性
- `Spatial Partitioning`
  - 使用四叉樹或空間雜湊，掃描判定不對全部星球做碰撞，而只查詢視窗內的 chunk
- `GPU Instancing`
  - 大量相似星點以 `Graphics.DrawMeshInstanced` 或同等方式批次繪製，降低 draw call 壓力

### 行星資料系統

每顆行星的質量、溫度、水覆蓋率等資料若要在掃描時生成、且在讀檔後保持一致，最典型的做法就是：

- 以星球座標或 ID 作為 seed
- 輸入確定性的 hash / pseudo-random 流程
- 產出可重現的 planet profile

這會讓 `PlanetDataGenerator` 類型的模組合理存在，因為它能同時解決：

- 重複探索的一致性
- 存檔後重載的一致性
- 美術資產需求過高的問題

### ✅ 架構優點

- 場景切換明確，`TelescopeScene` 與 `ShipScene` 職責分離，維護邊界清晰
- `Event Bus` 類型的設計讓敘事觸發點與 `gameplay` 邏輯解耦，新增劇情節點不需大改核心邏輯
- 程序生成星域讓小團隊不需要手工製作大量星體資料，是非常務實的資產策略

### ❌ 架構缺點

- 非主線星球若大量回傳同質結果，代表掃描系統背後可能缺乏更細的結果分層與資料驅動設計
- 若存檔直接序列化整個 `GameState`，Unity 專案在版本更新後很容易出現存檔相容性問題

---

## 🚀 靈魂之橋 — 系統架構

### 核心架構模式：`Day-Cycle Loop + Component-Based Entity System`

```text
[DayCycleManager]
    ├── ExplorationPhase (John)
    │     ├── TopDownMovementController
    │     ├── ResourceNodeSystem
    │     │     ├── NodeSpawnConfig　(ScriptableObject)
    │     │     └── NodeStateTracker　(收集進度持久化)
    │     ├── GhostEncounterSystem
    │     │     ├── GhostTriggerZone
    │     │     └── QuestStateTracker
    │     └── WeatherSystem
    │           ├── SnowAudioMixer　(動態音效控制)
    │           └── VisibilityModifier
    ├── BasePhase (Fei)
    │     ├── CraftingSystem
    │     │     ├── RecipeDatabase　(ScriptableObject)
    │     │     └── InventoryManager
    │     └── NarrativeTriggerSystem
    └── PersistenceManager　(跨日存檔)
```

《靈魂之橋》的公開玩法已經很清楚：白天探索、回收材料、夜晚推進劇情、製作工具、再去更遠的地方。這種結構天然適合一個 `DayCycleManager` 類型的全局節拍器，把探索、敘事、回基地與跨日狀態串起來。

### 雙角色切換的工程挑戰

`John` 與 `Fei` 是同一個世界狀態裡的兩個操控主體。若以 Unity 實作，切換時至少需要處理：

- 暫存當前角色的 `Transform`、動畫狀態與互動狀態
- 切換 `Input System` 的 `Action Map`
- 確保 UI 狀態同步，例如背包、製作清單與任務資訊不會在切換後遺失

如果團隊使用 Unity 新版 Input System，那麼以 `PlayerInput` 或相似封裝去切換控制上下文，是很典型的做法。

### 資源節點系統的資料驅動設計

每個可收集節點的種類、數量、位置，如果全部 hardcode 在 scene 中，後續調整 `level design` 會非常痛苦。因此，職缺提到「分析與製作內部編輯工具以協助遊戲製作與素材量產」這件事，會讓我高度傾向相信：

- 他們需要某種 `Node Placement Editor`
- 或至少有一套資料化配置節點的編輯流程

對 Unity 團隊來說，較合理的實作包括：

- 用 `ScriptableObject` 存節點配置模板
- 用 custom editor / editor window 配置場景上的資源節點
- 用 `NodeStateTracker` 持久化玩家已收集的狀態

### 動態音效系統（Weather × Time）

鬼語隨時間漸強、踩雪聲隨天氣變化，這種需求若在 Unity 裡落地，最自然的做法通常是：

- `Audio Mixer + Snapshot`
- 由 `DayCycleManager` 以時間進度驅動 exposed parameters
- 動態調整音量、低通濾波器或環境聲混合比例

這樣能做出連續變化，而不是單純音效硬切。

### ✅ 架構優點

- `ScriptableObject-based Recipe Database` 很符合 Unity 最佳實踐，讓配方新增 / 修改可以完全資料驅動
- `Day Cycle` 作為全局節拍器，能把天氣、鬼語、返回倒數與敘事進度掛在同一時間軸上
- `Component-Based Entity` 很適合處理鬼魂、可互動物件與不同型態的敘事觸發器

### ❌ 架構缺點

- 若日落返回由全局管理器硬性結束，在邊界時間點容易出現突兀或 edge case，例如對話中斷、任務狀態衝突
- 若依賴 `NavMesh` 處理路徑與地表通行性，在雪地動態變化或封路事件上會有額外 bake 與同步成本

---

## 🌌 龍脈常歌 — 系統架構

### 核心架構模式：`Multi-Layer Scene Stack + Data-Driven Encounter System`

```text
[GameCore]
    ├── GalaxyMapSystem
    │     ├── StarNodeGraph　(星球節點圖)
    │     ├── FuelConsumptionCalculator
    │     ├── EncounterSpawnSystem
    │     │     ├── EncounterTable　 (ScriptableObject, 機率權重)
    │     │     └── DiceRollResolver
    │     └── StarsongDetectionSystem
    │           ├── FrequencyMatchEngine ← 核心創新點
    │           └── AudioSpectrumVisualizer
    ├── CaveExplorationSystem
    │     ├── 2.5DPlatformerController
    │     ├── LumenPlantSpawner
    │     ├── GatePuzzleSystem
    │     │     ├── FrequencyCalibrator ← Equalizer UI邏輯
    │     │     └── SongComboValidator
    │     └── MemoryFragmentTrigger
    ├── ShipManagementSystem
    │     ├── InventoryManager 
    │     ├── UpgradeTreeManager
    │     └── TradingSystem
    └── SaveSystem
          ├── AutoSaveOnChoice
          └── StateSnapshotSerializer
```

《龍脈常歌》是三作裡互動層最豐富的一代。公開玩法已能支持它至少存在：

- 銀河航行
- `starsong` 導航 / 感應
- 洞窟探索與解謎
- 資源管理與遭遇事件

因此，以 `Multi-Layer Scene Stack` 這種概念去描述它，比單一場景狀態機更合理，因為它的確像是把多個互動層堆疊在同一個世界進度之上。

### Starsong 頻率系統的工程實作

這是三款作品中技術含量最高、也最值得談的創新點。我認為較合理的實作至少有兩條路：

**方案 A：純邏輯驅動**

- 每個光球對應一個 `frequencyID`
- 玩家旋轉時計算光球與中心的角度差
- 當目標光球角度差 `< threshold` 且穩定停留足夠時間，觸發正確判定
- 角色歌聲的「對準感」用 `Audio Mixer` 的 `pitch` 或音量混合模擬

**方案 B：音訊驅動**

- 直接利用 Unity `Audio DSP` 或相似方式分析頻譜
- 光球位置對應實際頻率範圍
- 玩家把正確頻帶置中時觸發 `peak detection`

方案 B 的主題整合度最高，但工程風險也最大，尤其在低端手機和 Android 碎片化硬體上更敏感。

### SDK 串接與音訊延遲問題

這裡職缺截圖提供了很重要的線索：

- 他們直接要求 Steam / Android / iOS SDK 串接能力
- 也要求完整 App 上架經驗

這代表團隊不是只寫 PC 單平台邏輯，而是實際要面對平台差異。若 `Starsong` 真的有精細音訊判定，那 Android 音訊延遲、裝置表現差異與校準問題，就會從理論風險變成真實工程問題。

### RNG Encounter 系統

如果要支撐遭遇事件、判定係數、資源前提與章節進度，一套 `Weighted Random Table` 類型的資料驅動方式是非常合理的：

- 每個遭遇條目定義機率權重
- 條件包含燃料量、護甲量、章節進度
- 骰子結果再經由升級、裝備或角色特性做 modifier chain 修正

這樣做的好處是內容調整成本低，企劃可以在不動核心程式碼的情況下微調事件分布。

### 存檔系統複雜度

三款作品的存檔需求可以看成逐代升高：

- 地球計畫：場景進度為主
- 靈魂之橋：跨日資源與探索狀態
- 龍脈常歌：選擇後立即自動存檔

到了《龍脈常歌》，「選擇後立即存檔且不可反悔」這件事，會把存檔設計從單純序列化狀態，提升到更重視資料安全與版本控管的層級。較成熟的做法可能包括：

- 先寫入暫存檔
- 驗證完整性後再替換正式存檔
- 對版本號與存檔 schema 做明確管理

若團隊要長期維護更新，這部分是不能靠運氣的。

### ✅ 架構優點

- `Multi-Layer Scene Stack` 能讓銀河 / 感應 / 洞窟三層互動切換保持乾淨
- `Encounter Table` 類型的資料驅動內容，和職缺中「分析與設計內部工具以改善遊戲製程」高度一致
- `UpgradeTree + modifier chain` 的設計能讓後續擴充升級項目時，不必重寫核心判定流程

### ❌ 架構缺點

- 三層玩法切換在行動平台的記憶體管理會是顯著風險點
- 若 `Starsong` 使用更靠近音訊分析的做法，不同裝置的輸入 / 音訊延遲會直接影響判定體驗
- 若 `AutoSave-on-Choice` 沒有完整版本控管，更新後舊存檔失效會是高機率事故

---

## 三、跨系列共通的工程架構挑戰

### 多平台移植

職缺內容明確提到：

- 將遊戲移植到多種不同平台
- 熟悉 Steam / Android / iOS SDK 串接
- 具備完整 App 上架經驗

這表示 `Sigono` 的工程問題不只在遊戲功能本身，也在 build / packaging / deployment 與平台整合層。

若把這件事翻譯成工程架構語言，一條典型 pipeline 會長得像：

```text
Unity Build Pipeline
├── PC (Steam)      → Steamworks SDK、成就、雲端存檔
├── iOS             → StoreKit、Apple 平台生命週期、簽章流程
├── Android         → Google Play Billing、裝置相容性、背景切換
├── Switch         → Nintendo SDK（NDA保護，需特殊申請）
├── PS5 / Xbox     → 主機認證流程（TRC/XR），最嚴格的QA要求
└── QA / Player Fix → 平台特定 bug 與回報處理
```

即使不把每個主機平台細節寫死，這份職缺也已足夠支持一個判斷：

> 這個團隊的工程設計一定不是單機單平台思維，而必須考慮平台差異、SDK 整合與上架維運。

### CI / CD 與自動化測試

職缺直接列出：

- `Jenkins`
- `Gitlab`
- `Github Actions`
- 設計、實作與部署自動化測試工具

這使得下列推論非常合理：

```text
Push to Git
→ CI Trigger
→ Build Target Matrix
→ 自動化測試（Unit Test + 截圖回歸測試）
→ Build Artifact
→ 發佈到測試軌 / 平台渠道(例如：Steam Depots / TestFlight /Google Internal Testing)
```

對敘事型遊戲來說，真正高價值的自動化測試，往往不只是 unit test，而是：

- 劇情流程回歸測試
- 存檔 / 讀檔測試
- 平台 SDK 呼叫回歸測試
- 場景切換與事件順序驗證

因為這類遊戲最怕的，不是單一函式錯誤，而是某段劇情不再觸發、某個事件順序被改壞、某平台存檔行為失效。

---

## 四、系列工程架構總評

| 維度 | 地球計畫 | 靈魂之橋 | 龍脈常歌 |
|---|---|---|---|
| 場景管理複雜度 | 低（2 場景切換） | 中（日夜雙模式） | 高（三層堆疊） |
| 資料驅動成熟度 | 低 | 中（配方 / 收集物資料化） | 高（遭遇、升級、資源管理資料化程度更高） |
| 存檔系統複雜度 | 低 | 中（跨日狀態） | 高（即時 AutoSave） |
| 行動平台風險 | 低 | 中（音效動態混合） | 高（音訊延遲 + 多層切換記憶體風險） |
| 內部工具需求 | 低 | 中（節點 / 配方 / 任務配置） | 高（遭遇設定、謎題編輯、平衡調整） |
| 多平台移植難度 | 中 | 中 | 高 |

## 結語

如果從面試角度來看，這篇文章真正想展示的不是「我知道 Sigono 內部一定用了哪些類別」，而是：

- 我能從職缺要求讀出團隊真正面對的工程問題
- 我能從公開玩法反推出合理的系統拆解方式
- 我能把 `game design` 的需求翻譯成 runtime、tooling、pipeline 與平台整合層的技術細節

換句話說，我想讓面試官看到的是：

> 即使沒有原始碼，我仍然能以工程師的方式閱讀遊戲，並提出帶有具體技術判斷力的系統分析。