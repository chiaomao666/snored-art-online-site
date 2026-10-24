# Snored Art Online 攻略資料庫

任務素材掉落率、魔王掉落、裝備圖鑑、獨特技能、樓層情報與攻速 500 試算。

網站網址：https://chiaomao666.github.io/snored-art-online-site/

純靜態網站，無登入、無帳號資料存取、無後端。使用相對路徑，由 GitHub Actions 驗證並發布到 GitHub Pages。

## 收錄內容

- 配裝模擬器：八部位配裝、逐件強化分配、能力總覽、獨特技能常駐設定與分享連結。

- 五種武器的 30 招攻擊與 15 招增益技能：角色等級、前置技能 Lv3、Lv1～Lv10 倍率／冷卻／目標與附加效果，並比較增益熟練前後差異。

- 22 件獨特類任務道具：19 件收集掉落物與 3 件劇情／狀態道具。
- 40 層魔王、121 件第 1～40 層頭目裝備；41～75 層另外保留舊檔定義備註。
- 466 件裝備，含 188 把武器與 50 面盾牌，保留全部基礎能力。
- 五種獨特技能的舊版性能、修行步驟與等級條件。
- 196 個一般區域、40 個秘境、40 個頭目房：583 種怪物的單隻基礎經驗與摳、各區同屏上限和每批數量；秘境另列怪物性能與素材／通用物品掉落設定。
- 無暫時增益／自身全開的攻速敏捷門檻；可輸入強化後武器攻速。

## 本機預覽

在 repository 根目錄啟動任意靜態伺服器，例如：

```sh
python -m http.server 8080
```

開啟 `http://localhost:8080/`。此網站不需安裝前端套件。

## 修改資料

主要整理資料放在 `guide-data.json`。修改後執行：

```sh
node build-data.cjs
node validate.cjs
```

`data.js` 是給瀏覽器直接載入的同一份資料。請一併提交 JSON 與更新後的 data.js。原始遊戲下載檔不放入本 repository。

## 資料依據與限制

資料快照：2026-10-24。裝備、任務收集設定、地圖與攻速以提供的 `main-CqsPH2Ju.js` 和 `main-Bril-Iat.js` 為依據；任務中文名稱和獨特技能性能參考 `guide-DkE4QRtb.js` 以及前次經驗算的整理。兩份 main 檔使用先前完成語法修復的副本，未覆寫原始檔。

任務素材百分比是 collect 目標的 chance 設定，並非稀有怪的生成率；前端未提供完整伺服器掉落與分配實作，不能據此保證提前囤貨、離線調整或多人分配規則。三件劇情／狀態道具不填怪物掉落率。期望擊倒數與機率試算假設各次獨立、成功取得一件，不代表保底。

魔王專屬池的 8% 是整個池的觸發率；單件的抽選機率未提供，沒有直接寫成 8% 或 8% ÷ 3。

獨特技能的舊版固定門檻、被動與招式數值僅作版本參考。Cqs 版將 UNIQUE_KILLS、DUAL_SPEED 等參數移到伺服器，不能把本地預設 0 當成正式數值。攻速工具可手動調整二刀流被動。敏捷公式、400ms 間隔下限與取整方式在兩份 main 檔相同。

## GitHub Pages

在 repository 的 Settings → Pages，將 Source 設為 **GitHub Actions**。`.github/workflows/deploy.yml` 會在 main 分支更新時自動檢查 JavaScript、重建瀏覽器資料、執行資料驗證，然後把通過檢查的 `_site/` 發布到 GitHub Pages。也可在 Actions → Validate and deploy guide → Run workflow 手動重新發布。Pull request 只檢查，不部署。



網站檔案統一放在根目錄，便於直接從 GitHub 的 Upload files 更新；不需安裝套件或額外建置。
