import httpx
from bs4 import BeautifulSoup
import json, os, re
from datetime import datetime

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

INDEX_URLS = {
    "内资": "https://www.nppa.gov.cn/bsfw/jggs/yxspjg/gcwlyxspxx/index.html",
    "外资": "https://www.nppa.gov.cn/bsfw/jggs/yxspjg/jkwlyxspxx/index.html",
}

def fetch(url):
    r = httpx.get(url, headers=HEADERS, timeout=30, follow_redirects=True)
    r.raise_for_status()
    return r.text

def get_latest_url(html, base_url):
    soup = BeautifulSoup(html, "html.parser")
    links = soup.select("a[href]")

    print(f"  전체 링크 목록:")
    for a in links:
        href = a.get("href", "")
        text = a.get_text(strip=True)
        if href and href != "#" and "../../../../" not in href:
            print(f"    {href} | {text[:20]}")

    candidates = []
    for a in links:
        href = a.get("href", "")
        if re.search(r't\d{13}\.html', href) or re.search(r't\d{4}\d+_\d+\.html', href):
            if href.startswith("http"):
                candidates.append(href)
            elif href.startswith("/"):
                candidates.append("https://www.nppa.gov.cn" + href)
            else:
                candidates.append(base_url.rsplit("/", 1)[0] + "/" + href)

    if not candidates:
        for a in links:
            href = a.get("href", "")
            if re.search(r'/202\d{3}/', href) and ".html" in href:
                if href.startswith("http"):
                    candidates.append(href)
                elif href.startswith("/"):
                    candidates.append("https://www.nppa.gov.cn" + href)
                else:
                    candidates.append(base_url.rsplit("/", 1)[0] + "/" + href)

    if not candidates:
        return None

    candidates.sort()
    print(f"  후보 URL들: {candidates}")
    return candidates[-1]

def extract_month_from_url(url):
    m = re.search(r'/(\d{4})(\d{2})/', url)
    if m:
        return f"{m.group(1)}-{m.group(2)}"
    return None

def parse_table(html, license_type):
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if not tables:
        return []
    table = max(tables, key=lambda t: len(t.find_all("tr")))
    headers = []
    header_row = table.find("tr")
    if header_row:
        headers = [th.get_text(strip=True) for th in header_row.find_all(["th", "td"])]
    print(f"  테이블 헤더: {headers}")
    rows = []
    for tr in table.find_all("tr")[1:]:
        tds = tr.find_all("td")
        if len(tds) < 3:
            continue
        cols = [td.get_text(strip=True) for td in tds]
        rows.append({
            "seq":            cols[0] if len(cols) > 0 else "",
            "game_name":      cols[1] if len(cols) > 1 else "",
            "operator":       cols[2] if len(cols) > 2 else "",
            "publisher":      cols[3] if len(cols) > 3 else "",
            "license_number": cols[4] if len(cols) > 4 else "",
            "isbn":           cols[5] if len(cols) > 5 else "",
            "approved_date":  cols[6] if len(cols) > 6 else "",
            "type":           license_type,
        })
    return rows

def filter_by_latest_month(data):
    """데이터 내 가장 최신 월 데이터만 반환"""
    year_months = set()
    for d in data:
        m = re.match(r'(\d{4})年(\d{2})月', d.get("approved_date", ""))
        if m:
            year_months.add(f"{m.group(1)}-{m.group(2)}")
    if not year_months:
        return data, None
    latest = sorted(year_months)[-1]
    y, mo = latest.split("-")
    filtered = [d for d in data if f"{y}年{mo}月" in d.get("approved_date", "")]
    print(f"  최신 월 필터 ({latest}): {len(data)}건 → {len(filtered)}건")
    return filtered, latest

def save_json(data, year_month, license_type):
    os.makedirs("data", exist_ok=True)
    path = f"data/{year_month}-{license_type}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  저장 완료: {path} ({len(data)}건)")

def update_index():
    os.makedirs("data", exist_ok=True)
    files = sorted([
        f for f in os.listdir("data")
        if f.endswith(".json")
        and f != "index.json"
        and not f.startswith("report-")
    ], reverse=True)
    entries = []
    for f in files:
        parts = f.replace(".json", "").split("-")
        if len(parts) >= 3:
            entries.append({
                "file": f,
                "year_month": f"{parts[0]}-{parts[1]}",
                "type": parts[2],
            })
    with open("data/index.json", "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print("  index.json 업데이트 완료")

def run():
    current_ym = datetime.now().strftime("%Y-%m")
    print(f"\n=== {current_ym} 판호 수집 시작 ===\n")

    for license_type, url in INDEX_URLS.items():
        print(f"[{license_type}] 접근 중...")
        try:
            html = fetch(url)
            notice_url = get_latest_url(html, url)
            if not notice_url:
                print("  공시 링크 없음")
                continue

            print(f"  공시 URL: {notice_url}")
            url_ym = extract_month_from_url(notice_url)
            print(f"  공시 월: {url_ym}")

            data = parse_table(fetch(notice_url), license_type)
            print(f"  전체 {len(data)}건 파싱")

            if license_type == "外资":
                # 최신 월 데이터만 필터링
                data, latest_ym = filter_by_latest_month(data)
                save_json(data, latest_ym or url_ym or current_ym, license_type)
            else:
                save_json(data, url_ym or current_ym, license_type)

        except Exception as e:
            print(f"  오류: {e}")

    update_index()
    print("\n=== 완료 ===")

if __name__ == "__main__":
    run()