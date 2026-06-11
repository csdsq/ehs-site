#!/usr/bin/env python3
"""
EHS信息站 - 链接核验脚本
功能：检查所有法规(regulations)和标准(standards)的外部链接可用性
用法：python3 check_links.py [--type regulations|standards|all] [--timeout 10] [--output report.json]
"""

import urllib.request
import urllib.error
import json
import ssl
import time
import sys
import argparse
from datetime import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

STRAPI = "http://strapi.hser.ren:1337"
TOKEN = "2f3b49e0adab57651579bc408d265c4d417d7826aa393a5d21a0fcced8de390536302b741438a36368e8bee686b9e36ec792da4d6025205367bcfe1a78abf7532937e2cddeb7b3521aff305d120983bded91ee91549905e557fc81f21d437c83806628d59d92c9c7a3b2b75aa1f298f4b0730c480d1e09f543d05bd434dbe2df"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

# HTTP状态码分类
SEVERITY_CRITICAL = [404, 410, 500, 502, 503]  # 链接完全失效
SEVERITY_WARNING = [403, 405, 501]              # 反爬，浏览器可能可访问
SEVERITY_REDIRECT = [301, 302, 307, 308]        # 重定向，需关注


def classify_error(status_code, error_msg=""):
    """分类错误严重程度"""
    if status_code in SEVERITY_CRITICAL:
        return "critical"
    if "ssl_error" in (error_msg or ""):
        return "info"  # SSL问题浏览器通常能访问
    if status_code == 412:
        return "warning"  # 反爬412，浏览器可访问
    if status_code in SEVERITY_REDIRECT:
        return "redirect"  # 重定向，可能浏览器可访问
    if status_code in SEVERITY_WARNING:
        return "warning"
    if status_code == 0:
        return "info"
    return "unknown"


def check_url(url, timeout=10):
    """检查单个URL，返回(status_code, error_msg, is_accessible_by_browser)"""
    if not url:
        return (None, "empty_url", True)
    
    try:
        req = urllib.request.Request(url, headers=HEADERS, method="GET")
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            code = resp.status
            if 200 <= code < 300:
                return (code, None, True)
            elif 300 <= code < 400:
                return (code, f"redirect", True)  # 浏览器会跟随重定向
            else:
                return (code, f"HTTP {code}", False)
    except urllib.error.HTTPError as e:
        # 302自循环（moj.gov.cn）- 浏览器实际可访问
        if e.code == 302:
            return (302, "redirect_loop", True)
        # 412反爬（nhc.gov.cn/chengdu）- 浏览器实际可访问
        if e.code == 412:
            return (412, "anti_crawler_412", True)
        # 403 - 有些需要cookie，浏览器可能可访问
        if e.code == 403:
            return (403, f"forbidden", True)
        # 404 - 确实不存在
        if e.code == 404:
            return (404, "not_found", False)
        return (e.code, f"HTTP {e.code}", e.code < 400)
    except urllib.error.URLError as e:
        reason = str(e.reason)[:100]
        if "SSL" in reason or "BAD_ECPOINT" in reason:
            return (0, f"ssl_error: {reason}", True)  # SSL问题浏览器通常能访问
        if "timed out" in reason.lower():
            return (0, "timeout", False)
        if "Connection refused" in reason:
            return (0, "connection_refused", False)
        return (0, reason, False)
    except Exception as e:
        return (0, str(e)[:100], False)


def fetch_all_records(content_type, page_size=25):
    """从Strapi API分页获取所有记录"""
    all_records = []
    page = 1
    while True:
        url = f"{STRAPI}/api/{content_type}?pagination[page]={page}&pagination[pageSize]={page_size}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
        except Exception as e:
            print(f"  [ERROR] Failed to fetch page {page} of {content_type}: {e}")
            break
        
        records = data.get("data", [])
        all_records.extend(records)
        total_pages = data.get("meta", {}).get("pagination", {}).get("pageCount", 1)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.3)
    
    return all_records


def check_collection(content_type, url_fields, timeout=10):
    """检查某个集合的所有链接"""
    print(f"\n{'='*60}")
    print(f"Checking {content_type}...")
    print(f"{'='*60}")
    
    records = fetch_all_records(content_type)
    print(f"Fetched {len(records)} records")
    
    results = []
    ok_count = 0
    problem_count = 0
    
    for i, rec in enumerate(records):
        title = rec.get("title", "")
        doc_id = rec.get("documentId", "")
        
        for field in url_fields:
            url = rec.get(field, "")
            if not url:
                continue
            
            status_code, error_msg, browser_accessible = check_url(url, timeout)
            severity = "ok" if browser_accessible else classify_error(status_code, error_msg)
            
            result = {
                "collection": content_type,
                "title": title,
                "documentId": doc_id,
                "field": field,
                "url": url,
                "status_code": status_code,
                "error_msg": error_msg,
                "browser_accessible": browser_accessible,
                "severity": severity,
                "checked_at": datetime.now().isoformat(),
            }
            results.append(result)
            
            if browser_accessible:
                ok_count += 1
            else:
                problem_count += 1
                print(f"  [{severity.upper()}] {title}")
                print(f"    {field}: {url}")
                print(f"    Status: {status_code}, Error: {error_msg}")
            
            time.sleep(0.3)
        
        if (i + 1) % 10 == 0:
            print(f"  ... {i+1}/{len(records)} checked")
    
    print(f"\n{content_type}: {ok_count} OK, {problem_count} problems")
    return results


def main():
    parser = argparse.ArgumentParser(description="EHS信息站链接核验工具")
    parser.add_argument("--type", choices=["regulations", "standards", "all"], default="all",
                       help="检查类型：regulations/standards/all")
    parser.add_argument("--timeout", type=int, default=10, help="请求超时时间(秒)")
    parser.add_argument("--output", default=None, help="输出JSON报告文件路径")
    args = parser.parse_args()
    
    print(f"EHS链接核验 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"检查类型: {args.type}")
    
    all_results = []
    
    if args.type in ["regulations", "all"]:
        results = check_collection("regulations", ["downloadUrl", "sourceUrl"], args.timeout)
        all_results.extend(results)
    
    if args.type in ["standards", "all"]:
        results = check_collection("standards", ["downloadUrl", "sourceUrl"], args.timeout)
        all_results.extend(results)
    
    # 汇总统计
    total = len(all_results)
    ok_count = sum(1 for r in all_results if r["browser_accessible"])
    problem_count = total - ok_count
    
    critical = sum(1 for r in all_results if r["severity"] == "critical")
    warning = sum(1 for r in all_results if r["severity"] == "warning")
    info = sum(1 for r in all_results if r["severity"] == "info")
    redirect = sum(1 for r in all_results if r["severity"] == "redirect")
    
    print(f"\n{'='*60}")
    print(f"核验结果汇总")
    print(f"{'='*60}")
    print(f"总链接数: {total}")
    print(f"浏览器可访问: {ok_count}")
    print(f"用户不可访问: {problem_count}")
    print(f"  🔴 严重(404/5xx, 需修复): {critical}")
    print(f"  🟡 警告(403/405/501, 反爬): {warning}")
    print(f"  🔵 提示(SSL/网络): {info}")
    print(f"  ↪️  重定向(302等): {redirect}")
    
    # 按严重程度列出不可访问的链接
    if problem_count > 0:
        print(f"\n--- 需修复链接明细 ---")
        for r in sorted(all_results, key=lambda x: {"critical": 0, "warning": 1, "info": 2, "redirect": 3, "ok": 4}.get(x["severity"], 5)):
            if r["browser_accessible"]:
                continue
            print(f"[{r['severity'].upper()}] {r['title']}")
            print(f"  {r['field']}: {r['url']}")
            print(f"  Status: {r['status_code']}, Error: {r['error_msg']}")
            print(f"  docId: {r['documentId']}")
    
    # 输出JSON报告
    report = {
        "check_time": datetime.now().isoformat(),
        "summary": {
            "total": total,
            "accessible": ok_count,
            "problems": problem_count,
            "critical": critical,
            "warning": warning,
            "info": info,
            "redirect": redirect,
        },
        "results": all_results,
    }
    
    if args.output:
        output_path = args.output
    else:
        output_path = f"/app/data/所有对话/主对话/用户上传/ehs-deploy/ehs-deploy/ehs-site/scripts/link_report_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n报告已保存: {output_path}")
    
    return problem_count


if __name__ == "__main__":
    problem_count = main()
    sys.exit(0 if problem_count == 0 else 1)
