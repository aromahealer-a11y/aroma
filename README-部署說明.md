# 批次文件自動同步 — 部署說明

目標：商品頁上的「分析報告」不再需要客人手動輸入批號，改為**下拉選單直接點選**，
清單由 GitHub Action 每天自動從 Florihana 原廠頁面抓取，**不需人工維護**。

---

## 一、要放進 GitHub repo 的檔案

repo：`aromahealer-a11y/aroma`（就是目前 widget 所在的那個）

```
batch-query-embed.html          ← 覆蓋現有檔案（新增下拉選單與 only=analysis）
codes.txt                       ← 新增：要同步的商品代碼清單
scripts/fetch-batches.mjs       ← 新增：抓取程式
.github/workflows/update-batches.yml  ← 新增：每日排程
batches.json                    ← 不用建，第一次執行會自動產生
```

commit 之後到 repo 的 **Actions** 分頁，點「更新批次文件清單」→ **Run workflow** 手動跑第一次，
約一分鐘後 `batches.json` 就會出現。

若 Action 因權限失敗，到 repo **Settings → Actions → General → Workflow permissions**，
選「Read and write permissions」後再跑一次。

---

## 二、商品頁怎麼接

Analysis 卡片的連結改成內嵌 iframe（WACA 實測可通過）：

```html
<iframe src="https://aromahealer-a11y.github.io/aroma/batch-query-embed.html?code=FLV003&only=analysis"
        width="100%" height="300" style="border:0;display:block;width:100%"
        title="批次分析報告查詢" loading="lazy"></iframe>
```

- `only=analysis`：只顯示分析報告那張卡（因為商品頁已自行列出 MSDS／TDS 直連）
- 想三份文件都由 widget 提供，就把 `&only=analysis` 拿掉、高度改 `420`

---

## 三、日常操作

| 情境 | 要做什麼 |
|---|---|
| 原廠出了新批次 | **不用做任何事**，隔天自動更新 |
| 上架新商品 | 在 `codes.txt` 加一行代碼；想立刻生效就手動 Run workflow |
| 某商品抓不到 | 該商品自動退回「手動輸入批號」，不影響其他商品 |
| 原廠改網址 | 程式會重新搜尋定位，仍失敗才保留上次結果並在 log 標示 |

---

## 四、運作原理

1. `codes.txt` 逐一取代碼 → 用原廠站內搜尋 `?s=代碼` 找到商品頁
   （搜尋結果含固定推薦連結，所以會再抓頁面確認含 `reference=代碼` 才算命中）
2. 解析頁面上的附件連結 `axproductattachments/export?type=…&file=…`
   - `Analyse` → 分析報告批次（蒸餾液／植物油／浸泡油）
   - `Chromatographies` → GC 圖譜批次（精油）
   - `Fiche de sécurité` / `Fiche technique` → MSDS／TDS 檔名
3. 批號取 `檔名去掉代碼與 .pdf` 的部分（例：`FLV003190626TR.pdf` → `190626TR`），
   依 DDMMYY 轉成日期排序，新的在前
4. 命中的商品頁網址寫回 `batches.json`，下次執行直接沿用、省一次搜尋

**已實測資料**（2026-07-21，FLV003）：分析報告 43 個批次，最新 `190626TR`（2026-06-19）；
MSDS `FLV003.pdf`、TDS `FLV003FT.pdf` 皆為標準檔名，HTTP 200。

---

## 五、尚未驗證的部分

本機沒有 Node 環境，`fetch-batches.mjs` **未在本機實跑過**，但其中的搜尋、頁面比對、
附件解析規則都已用 curl 對線上頁面逐條驗證。第一次 Run workflow 時請看一下 Actions log：

- 正常會逐行印出 `FLV003 … 分析報告 43 筆 / GC 0 筆`
- 若某商品印出「失敗：搜尋不到對應商品頁」，把該代碼的原廠頁面網址給我，我補上直接指定的機制
