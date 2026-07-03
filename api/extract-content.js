/**
 * 内容提取模块 - 从来源链接抓取并提取正文
 */
export async function fetchAndExtract(sourceUrl, type) {
  if (!sourceUrl || !sourceUrl.startsWith('http')) {
    return { success: false, error: '无效的来源链接' };
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HSERBot/1.0; +https://hser.ren)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();
    const finalUrl = response.url || sourceUrl;

    if (!html || html.length < 200) {
      return { success: false, error: '页面内容过短，可能无法正常抓取' };
    }

    // --- 提取标题 ---
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      title = cleanHtml(titleMatch[1]).trim().slice(0, 200);
    }
    // 尝试 meta og:title
    if (!title || title.length < 4) {
      const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
      if (ogMatch) title = ogMatch[1].trim().slice(0, 200);
    }

    // --- 提取正文 ---
    let content = '';

    // 优先 <article> 标签
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = extractReadableContent(articleMatch[1]);
    }

    // 尝试 <div class="article"> <div id="content"> <div class="maintext"> 等
    if (!content || content.length < 100) {
      const contentSelectors = [
        'class="article"', "class='article'",
        'class="content"', "class='content'",
        'id="content"', "id='content'",
        'class="maintext"', "class='maintext'",
        'class="main-text"', "class='main-text'",
        'class="detail"', "class='detail'",
        'id="detail"', "id='detail'",
        'class="text"', "class='text'",
        'class="body"', "class='body'",
        'class="news-content"', "class='news-content'",
        'class="news_text"', "class='news_text'",
        'class="wz-content"', "class='wz-content'",
      ];
      for (const sel of contentSelectors) {
        const re = new RegExp(`<div[^>]*${escapeRegex(sel)}[^>]*>([\\s\\S]*?)<\\/div>`, 'i');
        const m = html.match(re);
        if (m) {
          const extracted = extractReadableContent(m[1]);
          if (extracted.length > content.length) {
            content = extracted;
          }
        }
      }
    }

    // 最后 fallback：取 <body> 中的文本
    if (!content || content.length < 100) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = extractReadableContent(bodyMatch[1]);
      }
    }

    // --- 提取发布日期 ---
    let publishDate = '';
    const datePatterns = [
      /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/,
      /(\d{4})[-/年](\d{1,2})[-/月]/,
    ];
    // 先尝试 meta 标签
    const metaDateMatch = html.match(/<meta[^>]+(?:name|property)=["'](?:article:published_time|date|pubdate)["'][^>]+content=["']([^"']+)["']/i);
    if (metaDateMatch) {
      publishDate = metaDateMatch[1].slice(0, 10);
    }
    if (!publishDate) {
      for (const pat of datePatterns) {
        const m = html.match(pat);
        if (m) {
          const y = m[1], mo = m[2].padStart(2, '0'), d = (m[3] || '01').padStart(2, '0');
          const year = parseInt(y);
          if (year >= 2000 && year <= 2030) {
            publishDate = `${y}-${mo}-${d}`;
            break;
          }
        }
      }
    }

    // --- 提取发布机构/来源 ---
    let source = '';
    const sourcePatterns = [
      /来源[：:]\s*([^<\n]{2,30})/,
      /发文机关[：:]\s*([^<\n]{2,30})/,
      /发布单位[：:]\s*([^<\n]{2,30})/,
      /发文机构[：:]\s*([^<\n]{2,30})/,
    ];
    for (const pat of sourcePatterns) {
      const m = html.match(pat);
      if (m) {
        source = m[1].trim();
        break;
      }
    }

    // --- 评估质量 ---
    const hasTitle = title && title.length >= 4;
    const hasContent = content && content.length >= 100;

    if (!hasTitle && !hasContent) {
      return { success: false, error: '无法提取标题和正文内容' };
    }

    return {
      success: true,
      title: title || '',
      content: wrapContent(content || '（自动抓取内容为空）', finalUrl),
      publishDate: publishDate || '',
      source: source || new URL(finalUrl).hostname,
      sourceUrl: finalUrl,
    };
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { success: false, error: '抓取超时（15秒）' };
    }
    return { success: false, error: `抓取出错：${err.message}` };
  }
}

/**
 * 从 HTML 片段中提取可读文本（去标签、去脚本、去样式）
 */
function extractReadableContent(html) {
  // 删除 script 和 style
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // 替换换行标签为换行符
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '\n');
  text = text.replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote)>/gi, '\n');
  // 去 HTML 标签
  text = text.replace(/<[^>]+>/g, '');
  // 去多余空白
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function cleanHtml(text) {
  return text.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wrapContent(text, sourceUrl) {
  const date = new Date().toISOString().slice(0, 10);
  return `（本内容由 hser.ren 自动抓取自 ${sourceUrl}，抓取时间：${date}）\n\n---\n\n${text}`;
}

/**
 * 生成唯一 slug
 */
export function generateSlug(title, type) {
  const ts = Date.now().toString(36).slice(-6);
  const sanitized = title
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 50);
  return `sub-${type}-${sanitized || 'post'}-${ts}`;
}
