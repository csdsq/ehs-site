/**
 * Fix Strapi regulation data for specific problematic pages.
 * Run: node scripts/fix-strapi-data.js
 * Strapi public API allows unauthenticated PUT requests for this content type.
 */
const BASE = 'http://8.149.139.66:1337/api';

async function getReg(slug) {
  const res = await fetch(BASE + '/regulations?filters[slug][$eq]=' + encodeURIComponent(slug) + '&pagination[pageSize]=1');
  const json = await res.json();
  return json.data?.[0];
}

async function updateReg(documentId, data) {
  const res = await fetch(BASE + '/regulations/' + documentId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (res.ok) {
    console.log(`  ✅ Updated`, Object.keys(data).join(', '));
  } else {
    const err = await res.text();
    console.log(`  ❌ Failed: ${err.substring(0, 200)}`);
  }
}

/**
 * Convert plain text regulation content to formatted HTML.
 * Handles chapter headings (第一章...) and article headings (第一条...).
 */
function textToHtml(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const parts = [];
  for (const line of lines) {
    // Match chapter headings like "第一章 总则" or "第一章 总 则"
    if (/^第[一二三四五六七八九十百]+章[\s\u3000]/.test(line)) {
      parts.push(`<h3>${line}</h3>`);
    } 
    // Match article headings like "第一条 ..."
    else if (/^第[一二三四五六七八九十百]+条[\s\u3000]/.test(line)) {
      // Find the article number and rest
      const match = line.match(/^(第[一二三四五六七八九十百]+条)([\s\u3000]*)(.*)/);
      if (match) {
        parts.push(`<p><strong>${match[1]}</strong> ${match[3]}</p>`);
      } else {
        parts.push(`<p>${line}</p>`);
      }
    } 
    else {
      parts.push(`<p>${line}</p>`);
    }
  }
  return parts.join('\n');
}

async function main() {
  // === 1. Fix reg-cd5e6cbf0d11-20 ===
  console.log('\n=== Fixing reg-cd5e6cbf0d11-20 ===');
  const item1 = await getReg('reg-cd5e6cbf0d11-20');
  if (item1) {
    // 1a. source already fixed (应急管理部) - verify
    console.log(`  Current source: ${item1.source}`);
    if (item1.source !== '应急管理部') {
      await updateReg(item1.documentId, { source: '应急管理部' });
    } else {
      console.log('  ✅ source already correct');
    }
    
    // 1b. Add standardNo
    if (!item1.standardNo) {
      await updateReg(item1.documentId, { standardNo: '应急管理部令第20号' });
    } else {
      console.log(`  ✅ standardNo already set: ${item1.standardNo}`);
    }
    
    // 1c. Convert content to HTML
    if (item1.content && !item1.content.trim().startsWith('<')) {
      const html = textToHtml(item1.content);
      await updateReg(item1.documentId, { content: html });
    } else {
      console.log('  Content already has HTML or is empty');
    }
  } else {
    console.log('  ❌ Not found');
  }

  // === 2. Fix 202650 ===
  console.log('\n=== Fixing 202650 ===');
  const item3 = await getReg('202650');
  if (item3) {
    // 2a. Shorten title
    const desiredTitle = '陕西省安全生产责任保险事故预防服务费投入和使用办法';
    if (item3.title !== desiredTitle) {
      await updateReg(item3.documentId, { title: desiredTitle });
    } else {
      console.log('  ✅ title already correct');
    }
    
    // 2b. Add downloadUrl (Strapi field name is downloadUrl, not sourceUrl)
    const downloadUrl = 'https://yjt.shaanxi.gov.cn/gk/zwxxgk/gfxwj/202606/t20260604_3644556.html';
    if (!item3.downloadUrl) {
      await updateReg(item3.documentId, { downloadUrl });
    } else {
      console.log('  ✅ downloadUrl already set');
    }
  } else {
    console.log('  ❌ Not found');
  }

  // === 3. Check item-8906da18 ===
  console.log('\n=== Checking item-8906da18 ===');
  const item4 = await getReg('item-8906da18');
  if (item4) {
    console.log(`  title: ${item4.title}`);
    console.log(`  content: ${(item4.content || '').substring(0, 80)}`);
    console.log(`  sourceUrl: ${item4.sourceUrl}`);
    console.log(`  downloadUrl: ${item4.downloadUrl}`);
    console.log(`  publishDate: ${item4.publishDate}`);
    console.log(`  effectiveDate: ${item4.effectiveDate}`);
    console.log(`  standardNo: ${item4.standardNo}`);
    // This entry has almost no data - cannot fully fix without knowing the actual content and source
  }

  // === 4. Create a fix-regulations-data skill ===
  console.log('\n=== Done ===');
}

main().catch(e => console.error(e));
