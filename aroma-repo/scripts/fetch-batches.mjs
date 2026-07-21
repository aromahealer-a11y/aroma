/**
 * Florihana 批次文件清單抓取器
 * ---------------------------------------------------------------
 * 用途：把每個商品在原廠頁面上公開的「批次分析報告 / GC 圖譜 / MSDS / TDS」
 *       檔名抓下來，輸出成 batches.json，供 batch-query-embed.html 做成下拉選單。
 *
 * 執行：node scripts/fetch-batches.mjs
 * 需求：Node 18+（使用內建 fetch，無外部套件）
 *
 * 資料來源與規則（2026-07-21 對線上頁面實測）：
 *   ① 用站內搜尋定位商品頁：/en/search?controller=search&s=<代碼>
 *      搜尋結果每頁都會夾帶固定的推薦商品連結，所以候選頁要再抓下來，
 *      確認內容含 reference=<代碼> 才算命中。
 *   ② 商品頁的附件連結格式：
 *      /module/axproductattachments/export?type=<類型>&file=<檔名>&reference=<代碼>
 *      類型：Analyse（分析報告）／Chromatographies（GC 圖譜）／
 *            Fiche de sécurité（MSDS）／Fiche technique（TDS）
 *   ③ 批次檔名 = 代碼 + DDMMYY + 後綴（例：FLV003190626TR.pdf → 批號 190626TR）
 *
 * 命中的商品頁網址會寫回 batches.json，下次執行直接沿用、省一次搜尋。
 */

const CODES_FILE = new URL('../codes.txt', import.meta.url);
const OUT_FILE   = new URL('../batches.json', import.meta.url);
const ORIGIN     = 'https://www.florihana.com';
const UA         = 'Mozilla/5.0 (compatible; aromahealer-batch-sync/1.0)';
const DELAY_MS   = 700;   // 對原廠站的禮貌間隔
const TIMEOUT_MS = 30000;

const TYPES = {
  analyse: 'Analyse',
  gc:      'Chromatographies',
  msds:    'Fiche de sécurité',
  tds:     'Fiche technique',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  const ctl = setTimeout(() => {}, 0);
  clearTimeout(ctl);
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

/** 從商品頁 HTML 取出所有附件，依類型分組 */
function parseAttachments(html, code) {
  const out = { analyse: [], gc: [], msds: '', tds: '' };
  // href 內的 & 可能是 &amp;，先正規化
  const flat = html.replace(/&amp;/g, '&');
  const re = /axproductattachments\/export\?type=([^&"']+)&file=([^&"']+)/g;
  let m;
  while ((m = re.exec(flat)) !== null) {
    const type = decodeURIComponent(m[1]);
    const file = decodeURIComponent(m[2]);
    if (!file.toUpperCase().startsWith(code)) continue;
    if (type === TYPES.analyse || type === TYPES.gc) {
      const batch = file.slice(code.length).replace(/\.pdf$/i, '');
      if (!batch) continue;                       // 無批號的總表檔，跳過
      const key = type === TYPES.analyse ? 'analyse' : 'gc';
      if (!out[key].includes(batch)) out[key].push(batch);
    } else if (type === TYPES.msds) {
      out.msds = file;
    } else if (type === TYPES.tds) {
      out.tds = file;
    }
  }
  // 批號 DDMMYY + 後綴 → 轉成可排序的 YYMMDD，新的排前面
  const rank = b => {
    const m = /^(\d{2})(\d{2})(\d{2})/.exec(b);
    return m ? `${m[3]}${m[2]}${m[1]}` : '000000';
  };
  out.analyse.sort((a, b) => rank(b).localeCompare(rank(a)));
  out.gc.sort((a, b) => rank(b).localeCompare(rank(a)));
  return out;
}

/** 以站內搜尋定位商品頁；回傳確認過的網址 */
async function findProductUrl(code) {
  const html = await get(`${ORIGIN}/en/search?controller=search&s=${encodeURIComponent(code)}`);
  const links = [...new Set(
    (html.match(/https:\/\/www\.florihana\.com\/en\/[a-z0-9-]+\/[0-9][^"']*\.html/g) || [])
  )];
  for (const url of links) {
    await sleep(DELAY_MS);
    try {
      const page = await get(url);
      if (page.replace(/&amp;/g, '&').includes(`reference=${code}`)) return { url, page };
    } catch (e) {
      console.warn(`  ! 取商品頁失敗 ${url}：${e.message}`);
    }
  }
  return null;
}

async function main() {
  const fs = await import('node:fs/promises');

  const codes = (await fs.readFile(CODES_FILE, 'utf8'))
    .split(/\r?\n/)
    .map(s => s.replace(/#.*$/, '').trim().toUpperCase())
    .filter(Boolean);

  let prev = { products: {} };
  try { prev = JSON.parse(await fs.readFile(OUT_FILE, 'utf8')); } catch {}

  const products = {};
  let ok = 0, failed = 0;

  for (const code of codes) {
    process.stdout.write(`${code} … `);
    try {
      const cachedUrl = prev.products?.[code]?.url;
      let url = cachedUrl, page = null;

      if (url) {
        page = await get(url);
        if (!page.replace(/&amp;/g, '&').includes(`reference=${code}`)) page = null;  // 網址失效
      }
      if (!page) {
        const found = await findProductUrl(code);
        if (!found) throw new Error('搜尋不到對應商品頁');
        url = found.url; page = found.page;
      }

      const att = parseAttachments(page, code);
      products[code] = { url, ...att };
      console.log(`分析報告 ${att.analyse.length} 筆 / GC ${att.gc.length} 筆`);
      ok++;
    } catch (e) {
      console.log(`失敗：${e.message}`);
      if (prev.products?.[code]) products[code] = prev.products[code];   // 保留上次結果
      failed++;
    }
    await sleep(DELAY_MS);
  }

  const json = JSON.stringify({ updated: new Date().toISOString(), products }, null, 1);
  await fs.writeFile(OUT_FILE, json + '\n', 'utf8');
  console.log(`\n完成：成功 ${ok}、失敗 ${failed}，共 ${Object.keys(products).length} 項寫入 batches.json`);
  if (ok === 0) process.exit(1);   // 全數失敗才視為錯誤，避免單一商品下架就中斷排程
}

main().catch(e => { console.error(e); process.exit(1); });
