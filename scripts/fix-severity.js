/**
 * Fix accident severity classification in Strapi.
 * 
 * 生产安全事故等级分类标准:
 *   特别重大事故 (major):  ≥30人死亡, 或≥100人重伤
 *   重大事故 (larger):     10-29人死亡, 或50-99人重伤
 *   较大事故 (general):     3-9人死亡, 或10-49人重伤
 *   一般事故 (minor):       1-2人死亡, 或1-9人重伤
 *   无人员死亡:             无 (unknown/empty)
 * 
 * 当前显示映射: major→特大, larger→重大, general→较大, minor→一般
 * 
 * 问题: 很多标题含"重大"的事故被标成了 major(特大)，需要修正。
 */
const BASE = 'http://8.149.139.66:1337/api';

async function fetchAll() {
  const allData = [];
  let page = 1, pageCount = 1;
  while (page <= pageCount) {
    const res = await fetch(BASE + '/accidents?pagination[pageSize]=100&pagination[page]=' + page +
      '&fields[0]=title&fields[1]=slug&fields[2]=severity&fields[3]=casualties');
    const json = await res.json();
    if (Array.isArray(json.data)) allData.push(...json.data);
    if (json.meta?.pagination) pageCount = json.meta.pagination.pageCount;
    page++;
  }
  return allData;
}

/** 从伤亡描述中提取死亡人数 */
function parseDeaths(casualties) {
  if (!casualties || casualties === '-' || casualties.includes('待') || casualties.includes('未知')) return null;
  const m = casualties.match(/(\d+)人死亡/);
  return m ? parseInt(m[1], 10) : null;
}

/** 根据标题和伤亡数据确定正确的 severity 分类 */
function determineCorrectSeverity(item) {
  const title = (item.title || '').trim();
  const casualties = (item.casualties || '').trim();
  const current = item.severity;

  // 1. 标题含"特别重大" → 肯定是 major(特大)
  if (/特别重大/.test(title) || (/特大/.test(title) && !title.includes('特大暴雨'))) {
    return current === 'major' ? null : 'major';
  }

  // 2. 标题不含"特别重大"但含"重大"且当前为 major → 降级为 larger
  //    "重大"在标题中：如 "XX重大XX事故调查报告"
  if (/(重大|特大)/.test(title)) {
    // 标题含"特大"（非特别）且当前不是 major → 升 major
    if (/特大/.test(title) && current !== 'major') return 'major';
    // 标题含"重大"且当前是 major → 降 larger
    if (/重大/.test(title) && current === 'major') return 'larger';
  }

  // 3. 基于伤亡数据精确判断
  const deaths = parseDeaths(casualties);
  if (deaths !== null) {
    let expected;
    if (deaths >= 30) expected = 'major';
    else if (deaths >= 10) expected = 'larger';
    else if (deaths >= 3) expected = 'general';
    else expected = 'minor';
    if (expected !== current) return expected;
  }

  return null; // 无需修改
}

async function main() {
  const items = await fetchAll();
  console.log(`Total accidents: ${items.length}\n`);

  let fixed = 0, skipped = 0;
  const changes = [];

  for (const item of items) {
    const target = determineCorrectSeverity(item);
    if (target) {
      changes.push({ slug: item.slug, from: item.severity, to: target, title: (item.title || '').substring(0, 50), casualties: item.casualties || '-' });
    } else {
      skipped++;
    }
  }

  // 先打印预览，不改动
  console.log('=== 需要修改的条目预览 ===');
  for (const c of changes) {
    console.log(`  ${c.slug}`);
    console.log(`    当前: ${c.from} → 目标: ${c.to}`);
    console.log(`    标题: ${c.title}`);
    console.log(`    伤亡: ${c.casualties}`);
  }
  console.log(`\n总计需要修改: ${changes.length} 条, 无需修改: ${skipped} 条\n`);

  // 执行修改
  if (changes.length > 0) {
    console.log('=== 开始执行修改 ===');
    let ok = 0, fail = 0;
    for (const c of changes) {
      // 先找到 documentId
      const res = await fetch(BASE + '/accidents?filters[slug][$eq]=' + encodeURIComponent(c.slug) + '&pagination[pageSize]=1');
      const json = await res.json();
      const item = json.data?.[0];
      if (!item) { console.log(`  ❌ ${c.slug}: not found`); fail++; continue; }

      const updateRes = await fetch(BASE + '/accidents/' + item.documentId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { severity: c.to } }),
      });
      if (updateRes.ok) {
        console.log(`  ✅ ${c.slug}: ${c.from} → ${c.to}`);
        ok++;
      } else {
        const err = await updateRes.text();
        console.log(`  ❌ ${c.slug}: ${err.substring(0, 100)}`);
        fail++;
      }
    }
    console.log(`\n修改完成: 成功 ${ok}, 失败 ${fail}`);
  }

  // 验证最终分布
  const updated = await fetchAll();
  const counts = {};
  for (const it of updated) {
    counts[it.severity] = (counts[it.severity] || 0) + 1;
  }
  console.log('\n最终 severity 分布:', counts);
}

main().catch(e => console.error('FATAL:', e));
