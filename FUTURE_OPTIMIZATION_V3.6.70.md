# 阿凱老師教育工具集 · 未來優化路線圖 v3.6.70+

> **產出日期**：2026-05-29 16:00
> **當前版本**：v3.6.70（**P0+P1 大滿貫：beacon 擴散 4 工具 + 健檢雙保險 + 排行榜 UI 三件套 + cockpit 27 stage 細粒度**）
> **撰寫脈絡**：v3.6.69 修完雙寫漂移地基後，v3.6.70 把 FUTURE_V3.6.69 列的 P0+P1 全部 8 個 task 一個 session 內到位。本文件接續規劃 v3.6.71+ 還能怎麼推進
> **與前一份的關係**：v3.6.69 處理「資料正確性 + 流量歸因基礎」、v3.6.70 完成「擴散 + 監控 + UI 升級」；v3.6.71+ 進入「**資料 → 教學洞察**」階段 — 開始從累積的真實流量資料萃取教學行為訊號

---

## 🎯 戰略地圖更新

```
v3.6.60        v3.6.63        v3.6.68        v3.6.69        v3.6.70        v3.6.71+
GEO/SEO        podcast→video   演講提問 Ops    排行榜真實化    P0+P1 大滿貫    資料 → 教學洞察
護城河          pipeline       admin + UX     雙寫 doc       beacon×4 工具   stageBreakdown
                                              5 層防線        健檢雙保險       後台視覺化
                                              + 2,437 救回    cockpit×27      學習路徑 sankey
                                                              stage 細粒度    co-occurrence
                                                              7 層防線         熱度等級時間軸
                                                                              老師決策儀表板
                                                                                ↓
                                                                              「教學流量平台」
                                                                              + 跨工具 / 跨單元
                                                                              洞察生成
```

---

## 🚀 P0 立即可做（這週 / 1-3 個 session 完成）

### P0-1 · PhotoPoet 收尾：beacon master → main

**為什麼**：v3.6.70 為 #3 早安長輩圖加的 beacon commit `73bd98c` 卡在 master，default branch 是 main 沒收到。**這個工具只要還沒 merge 到 main，beacon 都不會生效**，目前 toolUsageStats/14 仍只記從 Akai 站點的點擊。

**做法**（任選）：
- **方案 A**（推薦）：開 PR cherry-pick `73bd98c` 單一 commit 到 main
  ```bash
  # 在乾淨環境（先 stash 或在 worktree）
  git -C /h/PhotoPoet stash push --include-untracked --message "wip"
  git -C /h/PhotoPoet fetch origin
  git -C /h/PhotoPoet checkout -b claude/beacon-toolid-14 origin/main
  git -C /h/PhotoPoet cherry-pick 73bd98c
  git -C /h/PhotoPoet push origin claude/beacon-toolid-14
  gh pr create -R cagoooo/PhotoPoet --base main --head claude/beacon-toolid-14 \
    --title "🎯 加 Akai 排行榜流量歸因 beacon (toolId=14)" \
    --body "cherry-pick from master (73bd98c)，只含 beacon snippet，不拖 master 其他 95 commits"
  ```
- **方案 B**：下次從 Firebase Studio 推 PhotoPoet 改動時自然會帶上（master 內已有 beacon）
- **方案 C**：手動 GitHub UI cherry-pick

**估時**：5 min（方案 A）

**收益**：#3 早安長輩圖也能反映真實流量。

---

### P0-2 · stageBreakdown 後台視覺化（在 ToolFlowAnalysisPanel 加 stage 切片）

**為什麼**：v3.6.70 已把 cockpit 27 stage 細粒度資料寫進 `toolUsageStats/81.stageBreakdown` + `toolClickEvents.stageId`，但**目前後台沒 UI 看**。學生用完 cockpit 一週後，stageBreakdown 會累積一堆 `{ microbit-makecode: 47, canva-ai: 23, ar-vr-wearables: 5, ... }`，但需要 UI 把它呈現出來才有用。

**做法**：
擴充 `client/src/components/admin/ToolFlowAnalysisPanel.tsx`：
- 選 #81 駕駛艙時，多出一個「📊 Stage 熱度排名」區塊
- 從 toolUsageStats/81.stageBreakdown 拉 map → 排序 → 顯示 horizontal bar chart
- 點某 stage 可下鑽看該 stage 的 toolClickEvents（referrer / hour / device 切片）

簡易 mockup：
```
📊 #81 駕駛艙 · 27 Stage 熱度
  microbit-makecode  ████████████████ 47
  canva-ai           ███████████ 23
  scratch-game       ██████ 18
  digital-safety     ████ 12
  ar-vr-wearables    █ 5
  ...
```

**估時**：1.5 hr（含 recharts 整合）

**收益**：阿凱老師能看出「我做的 27 個教學單元，哪些真正被學生用」— 直接指引未來教學重點優化。

---

### P0-3 · HealthCheckPanel 加歷史趨勢（記住每次健檢結果）

**為什麼**：目前 HealthCheckPanel 是「即時健檢」，按一次看一次。但**只在按下才知道**，且沒有歷史可比對。如果加自動排程 + 歷史趨勢，能看到「過去 30 天有沒有 schema 異常爆發」這類訊號。

**做法**：
- 加 `healthCheckRuns` Firestore collection，每次健檢結果寫進去（含 summary）
- HealthCheckPanel 加「過去 30 天健康度」mini line chart
- 加 Cloud Functions 排程 `runHealthCheckDaily`（每天凌晨 2:00 Asia/Taipei 自動跑）
- 排程結果有 error 就連帶觸發 LINE 告警（複用 monitorToolStatsSchema 的 pushFlexToAdmin）

**估時**：1.5 hr

**收益**：從「需要主動按按鈕看健康」進化為「健康度自動每日紀錄 + 異常自動告警」。

---

## 🎨 P1 中期排程（這 1-2 週 / 3-7 個 session）

### P1-1 · beacon 擴散 top 6-10（補完 top 10 真實流量歸因）

**為什麼**：v3.6.70 補了 top 5（其中 #3 在 master 待 merge）。#6-#10 仍只計 Akai 站內點擊。

**目前排行榜 top 6-10**（從 dry-run 資料估算合併後）：
- #6 tool_3 (88 clicks 合併後) — 看 tools.json id=3 是什麼工具
- #7 tool_9 (85) — id=9
- #8 tool_53 (83) — id=53
- #9 tool_2 (56) — id=2
- #10 tool_88 (44) — id=88

**做法**：跟 v3.6.70 P0-1 同套流程
- 用 `scripts/inject-cockpit-stage-beacons.mjs` 的 snippet template 思維寫一個通用 `scripts/inject-beacon-snippet.mjs` 接受 `<repo-path> <toolId>` 參數
- 或對每個 repo 手動 patch

**估時**：30-60 min（看 repo 數量與結構複雜度）

**收益**：top 10 都能真實反映任何入口流量。

---

### P1-2 · 「跨工具學習路徑」分析（Sankey 圖）

**為什麼**：累積夠多 `toolClickEvents` 後（含 sessionId、timestamp、stageId），可以分析「同一個學生同一個 session 從工具 A 流到工具 B 的次數」。這比單一工具熱度更有教學意義。

**做法**：
- 寫新 callable `analyzeUserPathways({ fromDate, toDate, minSessionEvents: 2 })`
  - 從 toolClickEvents 按 sessionId 分組
  - 同 session 內按時間排序，取連續工具 pair → 累計 co-occurrence matrix
- 寫 dashboard tab `<UserPathwaysPanel>` 用 recharts 或 d3-sankey 呈現
- 找出「最常一起被使用的工具組合」（推薦給其他老師）

**估時**：1 週

**收益**：阿凱老師能說「我的學生用過 #81 駕駛艙的人，70% 會接著用 #11 剛好學」這類事實。

---

### P1-3 · 「曇花一現工具」anti-pattern detect

**為什麼**：累積真實流量後，找出「被點 1-2 次後永遠沒人回來用」的工具。這些是「**值得重新設計或下架**」的訊號。

**做法**：
- 寫 callable `findBouncedTools()`
  - 從 toolClickEvents 找「session 內 dwell < 10 秒」（需要新加 dwell 追蹤，beacon 端 unload 時送）
  - 或從 toolUsageStats 找「totalClicks < 5 且 lastClickedAt > 14 天前」
- dashboard 顯示「⚠️ 值得重新設計的 5 個工具」清單
- 內含「重新設計 / 下架 / 合併入其他工具」三個選項（純標記用）

**估時**：3-5 天（含 dwell tracking 設計）

**收益**：產品決策從「我覺得這個沒人用」進化為「**資料告訴我這個沒人用**」。

---

### P1-4 · cockpit stage 之間的「下一個學什麼」推薦

**為什麼**：v3.6.70 已能看「micro:bit 被點 47 次」。下一層問題是「**剛上完 micro:bit 的學生，應該推薦繼續學什麼**」。

**做法**：
- 從 `stageBreakdown` + `sessionId` 串聯算 stage co-occurrence matrix
- 在 cockpit 各 stage 完成頁面顯示「👉 下一個推薦學：XX stage」
- 推薦邏輯：同 sessionId 內，從本 stage 流向其他 stage 最多次的 top 3

**估時**：3 天

**收益**：cockpit 變「自適應教學動線」— 學生自然走向跟其他學生類似的學習路徑。

---

### P1-5 · 「老師決策儀表板」整合頁

**為什麼**：v3.6.70 後 admin 後台已有多個分散 panel（流量分析 / Schema 健檢 / 快照管理 / 許願池管理）。加一個「老師決策」首頁整合最關鍵的決策訊號。

**做法**：
新 route `/admin/teacher-cockpit`（admin only），呈現：
- 📊 本週活躍 top 10（含 +/- 變化）
- 🔥 暴衝工具（過去 7 天 delta > 7 天前 7 天 delta × 2）
- 📉 衰退工具（過去 7 天 delta < 7 天前 7 天 delta × 0.5）
- 🌟 新興 stage（cockpit 內哪個 stage 突然熱）
- 🛡️ 系統健康（從 healthCheckRuns 拉最新一筆）
- 🚨 待處理告警（從 alertSilence 看過去 24h LINE 推過哪些）

**估時**：1 週

**收益**：阿凱老師每週 10 分鐘看一頁就能掌握「教學工具生態系」全貌。

---

## 🌐 P2 中長期願景（這個月 / 1-3 個月）

### P2-1 · BigQuery export + Looker Studio 長期趨勢

**為什麼**：Firestore 適合 realtime，但跑「過去 6 個月 #81 是否真的每個月成長」這種 query 慢且貴。BigQuery 適合長期分析、Looker Studio 適合視覺化。

**做法**：
- Firebase Console 啟用「Stream Firestore to BigQuery」extension（toolUsageStats / toolClickEvents 兩 collection）
- 寫定期 SQL view：每月熱門、每月成長率、stickiness (DAU/MAU)、cohort retention
- Looker Studio dashboard 連線（免費）

**估時**：半天

**收益**：歷史趨勢可視化、AIFED 演講有真實數據圖表、長期趨勢決策證據鏈。

---

### P2-2 · cohort 追蹤系統（`?from=class-6-5` URL 參數）

**為什麼**：目前 beacon 都匿名 sessionId。某些情境老師想知道「6 年 5 班學生用了幾次」「這場研習的 30 位老師有多少打開」。

**做法**：
- 標準化 URL 參數：`?from=class-6-5` / `?from=2026-aifed-talk`
- beacon 把 `from` 一併送
- Firestore toolClickEvents 新增 `cohort` 欄位
- 後台 dashboard 可依 cohort 切片
- 提供「產 QR / 短連結」工具，老師上課發給班級 / 研習用，cohort 自動帶入

**估時**：1 天

**收益**：研習效果評估、班級教學記錄、家長日報量化分享。

---

### P2-3 · 跨工具學習成就系統升級

**為什麼**：已有 achievements collection 但目前用得初級。v3.6.69+ 後 totalClicks 可信，可設計更豐富成就：

- 🏆「資訊科技課全勤」：cockpit + class + jhs-curriculum 都用過
- 🌟「PIRLS 探險家」：PIRLS Pro 累積 20+ 工具次
- 🔥「教學熱度王」：單週點某工具 > 50 次（給活躍老師）
- 🎨「跨領域大師」：7 大類別各用過至少一個工具
- 🧭「cockpit 領航員」：完成 cockpit 27 stage 中的 10+ stage
- 🎓「畢業生」：cockpit 全 27 stage 都用過

**做法**：
- 在 useAchievements.ts 加跨工具邏輯
- 用 toolClickEvents.sessionId 累計
- 排行榜旁加「我的成就牆」入口
- 達成成就推 LINE 通知（複用 pushFlexToAdmin）

**估時**：1 週

**收益**：學生/老師回訪動機增加，從「用一次就走」變「想集滿成就」。

---

### P2-4 · cockpit 內部互動事件雙向同步

**為什麼**：cockpit 內每個 stage 有 NotebookLM 簡報 + YouTube 嵌入 + Canvas 互動評量。**內容互動**比「載入次數」更有意義。

**做法**：
- 在 cockpit 引入 lightweight beacon library（自寫 30 行 ES module）
- 暴露 `window.akaiTrack(event, data)` 給各 stage 用
- 各 stage 在「完成評量」「看完影片」「進到下一關」時呼叫 `akaiTrack`
- 後端 `beaconToolClick` 升級為 `beaconEvent`，分流到 `toolEvents/${kind}` collection

**估時**：3-5 天

**收益**：知道「micro:bit 駕駛艙的學生有 80% 完成評量、Canva 駕駛艙只有 30%」這類教學品質訊號。

---

### P2-5 · 公開「教學熱度卡片」分享頁

**為什麼**：阿凱老師可以把「我的教學工具集本週熱度」做成 OG image 卡片分享到 LINE/FB，吸引其他老師關注。

**做法**：
- 新 route `/share/weekly-heat`（公開可讀）
- 從 toolUsageStats top 5 + dailyClicks 過去 7 天加總生成 1200x630 卡片
- 走 `og-social-preview-zh` skill 確保中文不變方框
- 卡片含 CTA「來看完整工具集」連回 cagoooo.github.io/Akai
- 每週日凌晨 cron 自動 regenerate

**估時**：1-2 天

**收益**：教學作品有了主動傳播管道，不再被動等人發現。

---

## 🛠️ 技術債清單（順手就改）

- [ ] `useToolClickStats` `loadFromCache` 用的 `localToolsRankings` localStorage key 跟 `useToolTracking` 內某段重複定義，可以抽 const 共用
- [ ] `migrateToolStatsMerge` callable function 用一次就不再需要，可考慮一個月後 deprecate（保留 code 但移除 export，文檔記錄歷史）
- [ ] Firestore Rules 的 toolUsageStats `^[1-9][0-9]{0,2}$` 上限是 999，但 incrementToolClick / beaconToolClick 內是 1-200。語意應對齊（兩處都改成 200 或都改成 999）
- [ ] cockpit beacon 的 sessionId 命名 `cockpit-${ts}-${random}` 跟 Akai 站的 `getOrCreateSessionId()` 命名不一致，可考慮統一前綴讓後台分析更直覺
- [ ] PROGRESS.md 已 3000+ 行，可考慮把 v3.6.0-v3.6.50 archive 到 PROGRESS-archive.md
- [ ] CHANGELOG.md 停在 v3.6.59 沒在 commit 流程內，可考慮取消（依賴 git log + PROGRESS.md 即可）
- [ ] `monitorToolStatsSchema` 的 `alertSilence` collection 永遠累積，可加 TTL（30 天自動清）
- [ ] `scripts/inject-cockpit-stage-beacons.mjs` 的 snippet 跟其他 repo 的 beacon snippet 邏輯一致，可抽 `scripts/lib/beacon-snippet.mjs` shared template

---

## 🎯 推薦執行順序（接 v3.6.70 收尾後）

如果按「每個 session 1 件」推進：

| Session | 動作 | 估時 | ROI |
|---|---|---|---|
| 1 | **P0-1 PhotoPoet beacon merge to main**（5 min）| 5 min | ⭐⭐⭐⭐⭐ 收尾 v3.6.70 唯一 loose end |
| 2 | **P0-2 stageBreakdown 後台視覺化**（讓 v3.6.70 的 stage 資料看得到）| 1.5 hr | ⭐⭐⭐⭐⭐ v3.6.70 投入未開封 |
| 3 | P0-3 HealthCheckPanel 加歷史趨勢 + 每日自動跑 | 1.5 hr | ⭐⭐⭐⭐ |
| 4 | P1-1 beacon 擴散 #6-#10 | 1 hr | ⭐⭐⭐⭐ |
| 5 | P1-5 老師決策儀表板整合頁 | 1 week | ⭐⭐⭐⭐⭐ 把所有 v3.6.69+ 投資整合 |
| 6 | P1-3 曇花一現 anti-pattern detect | 3-5 days | ⭐⭐⭐ |
| 7 | P1-2 跨工具學習路徑 Sankey | 1 week | ⭐⭐⭐ |
| 8 | P1-4 cockpit stage 之間「下一個學什麼」 | 3 days | ⭐⭐⭐ |
| 9+ | P2 系列依興趣選 | — | — |

**最強推薦**：Session 1 + Session 2 連著做 — 把 v3.6.70 收尾乾淨 + 讓 stageBreakdown 視覺化可用。**這兩個合起來 < 2 hr，立刻把 v3.6.70 的投資完全 unlock**。

---

## 🧭 設計原則沿用

接續累積的設計原則：

- **cork + 便利貼 + 拍立得視覺語彙**（[[feedback_ui_design_language.md]]）
- **影片必加 BGM**（[[feedback_video_bgm_pipeline.md]]）
- **新內容必補主頁入口**（[[feedback_new_content_homepage_entry.md]]）
- **新增工具走全 pipeline**（[[akai-new-tool-full-pipeline]]）
- **寫入路徑變更務必同步更新讀取路徑**（v3.6.69 真實事故結論）
- **🆕 任何寫入 schema 漂移即時告警**（v3.6.70 加 monitorToolStatsSchema + 24h dedup）
- **🆕 跨 repo 改動先檢查 default branch 跟 working branch 是否一致**（PhotoPoet 踩雷：master ≠ main 分歧 95 commit）
