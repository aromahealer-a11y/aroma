<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>批次成分查詢 (GC/MS)</title>
<style>
  *{box-sizing:border-box;}
  html,body{margin:0;background:transparent;}
  body{ color:#1c2530; font-family:-apple-system,'PingFang TC','Noto Sans TC','Helvetica Neue',Helvetica,Arial,sans-serif; line-height:1.6; padding:6px; -webkit-font-smoothing:antialiased; }
  /* 固定窄欄、置中：電腦與手機結構相同，iframe 高度才一致 */
  .wrap{ max-width:560px; margin:0 auto; }
  .card{ background:#fff; border:1px solid #dde3ea; border-radius:12px; box-shadow:0 6px 18px rgba(28,37,48,.05); padding:24px 22px; }

  .lead{ font-size:17px; font-weight:600; color:#1c2530; letter-spacing:.05em; margin:0 0 6px; }
  .sub{ font-size:13px; color:#8a8f98; letter-spacing:.02em; margin:0 0 18px; }

  .row{ display:flex; gap:8px; flex-wrap:nowrap; margin-bottom:18px; }
  .row input{ flex:1 1 auto; min-width:0; padding:11px; border:1px solid #c9d2dd; border-radius:7px; font-family:ui-monospace,Menlo,Consolas,monospace; font-size:14px; text-transform:uppercase; letter-spacing:.06em; }
  .row input:focus{ outline:none; border-color:#2f4a6b; }
  .row button{ flex:0 0 auto; background:#2f4a6b; color:#fff; border:none; border-radius:7px; padding:0 20px; font-size:14px; font-weight:600; letter-spacing:.04em; cursor:pointer; }
  .row button:hover{ filter:brightness(1.08); }

  /* 文件卡：永遠單欄橫列，電腦手機一致 */
  .docs{ display:flex; flex-direction:column; gap:10px; }
  .doc{ display:block; text-decoration:none; color:inherit; background:#f6f8fa; border:1px solid #dde3ea; border-radius:10px; padding:15px 16px; transition:border-color .15s, transform .15s; }
  .doc:hover{ border-color:#2f4a6b; transform:translateY(-1px); }
  .doc .cat{ display:block; font-size:10.5px; color:#8a8f98; letter-spacing:.16em; text-transform:uppercase; margin-bottom:4px; }
  .doc .ttl{ display:block; font-size:15px; font-weight:600; color:#1c2530; letter-spacing:.03em; margin-bottom:3px; }
  .doc .desc{ display:block; font-size:12.5px; color:#8a8f98; line-height:1.65; margin-bottom:11px; }
  .doc .go{ display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#2f4a6b; }
  .doc .go svg{ width:14px; height:14px; }
  .doc.off{ opacity:.5; pointer-events:none; }

  @media(max-width:520px){
    body{ padding:0; }
    .wrap{ max-width:100%; }
    .card{ padding:18px 14px; border-radius:10px; }
    .row button{ padding:0 16px; }
    .doc{ padding:14px 13px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <p class="lead">每一瓶皆對應一組化學指紋。</p>
    <p class="sub">批次代碼,是調閱對應文件的識別碼。</p>

    <div class="row">
      <input id="b" type="text" placeholder="輸入產品批號">
      <button id="go">查詢</button>
    </div>

    <div class="docs">
      <a class="doc" id="lGc" target="_blank" rel="noopener">
        <span class="cat">GC/MS 氣相分析</span>
        <span class="ttl">化學指紋圖譜</span>
        <span class="desc">呈現主要成分比例與化學特徵。</span>
        <span class="go">GC/MS 檢測圖譜
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l6 6"/><path d="M11 6v5H6"/></svg>
        </span>
      </a>
      <a class="doc" id="lMs" target="_blank" rel="noopener">
        <span class="cat">Safety Standards</span>
        <span class="ttl">MSDS 安全資料</span>
        <span class="desc">提供儲存與使用安全資訊。</span>
        <span class="go">MSDS 安全資料
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l6 6"/><path d="M11 6v5H6"/></svg>
        </span>
      </a>
      <a class="doc" id="lTd" target="_blank" rel="noopener">
        <span class="cat">Technical Data</span>
        <span class="ttl">TDS 技術規格</span>
        <span class="desc">包含 INCI、物性與 reference。</span>
        <span class="go">TDS 技術規格
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l6 6"/><path d="M11 6v5H6"/></svg>
        </span>
      </a>
    </div>
  </div>
</div>

<script>
  /* ===== 公版設定點：換產品只改這裡 ===== */
  const CODE = "FLEX006";   // 原廠商品代碼
  const BASE = "https://www.florihana.com/en/module/axproductattachments/export";
  // 標準規則：MSDS = {代號}.pdf、TDS = {代號}FT.pdf。
  // 若該商品檔名是例外（像這支咖啡），就填實際檔名覆蓋；留空字串 "" 則自動套標準規則。
  const MSDS_FILE = "FLEX006 CAFE TORIFIE BIO FDS 2026.pdf";  // 例外；留 "" 則用 FLEX006.pdf
  const TDS_FILE  = "FLEX006 CAFE TORIFIE BIO FT 2026.pdf";   // 例外；留 "" 則用 FLEX006FT.pdf
  /* ===================================== */

  const $ = id => document.getElementById(id);
  function urls(batch){
    const c = encodeURIComponent(CODE);
    return {
      gc: `${BASE}?type=Chromatographies&file=${encodeURIComponent(CODE+batch+'.pdf')}&reference=${c}`,
      ms: `${BASE}?type=${encodeURIComponent('Fiche de sécurité')}&file=${encodeURIComponent(MSDS_FILE || CODE+'.pdf')}&reference=${c}`,
      td: `${BASE}?type=${encodeURIComponent('Fiche technique')}&file=${encodeURIComponent(TDS_FILE || CODE+'FT.pdf')}&reference=${c}`
    };
  }
  function analyze(){
    const batch = $('b').value.trim().toUpperCase();
    $('b').value = batch;
    const u = urls(batch);
    // MSDS / TDS 只認商品代碼，永遠是原廠當前版，隨時可點
    $('lMs').href = u.ms;
    $('lTd').href = u.td;
    // GC/MS 依批號組檔名；沒有批號就停用該卡片
    if(batch){
      $('lGc').href = u.gc;
      $('lGc').classList.remove('off');
    } else {
      $('lGc').removeAttribute('href');
      $('lGc').classList.add('off');
    }
  }
  $('go').onclick = analyze;
  $('b').addEventListener('keydown', e=>{ if(e.key==='Enter') analyze(); });
  analyze(); // 載入：批號留空 → GC/MS 待輸入，MSDS/TDS 直接可用

  // ===== 回報實際高度給外層頁面，讓 iframe 高度自動貼合（手機/電腦一致）=====
  function postHeight(){
    const h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    parent.postMessage({ ahBatchHeight: h }, '*');
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  // 內容因互動而改變時也重新回報
  if (window.ResizeObserver) new ResizeObserver(postHeight).observe(document.body);
</script>
</body>
</html>
