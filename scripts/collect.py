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
    for a in links:
        href = a.get("href", "")
        if re.search(r't\d{13}\.html', href) or re.search(r't\d{4}\d+_\d+\.html', href):
            if href.startswith("http"):
                return href
            elif href.startswith("/"):
                return "https://www.nppa.gov.cn" + href
            else:
                return base_url.rsplit("/", 1)[0] + "/" + href
    for a in links:
        href = a.get("href", "")
        if re.search(r'/202\d{3}/', href) and ".html" in href:
            if href.startswith("http"):
                return href
            elif href.startswith("/"):
                return "https://www.nppa.gov.cn" + href
            else:
                return base_url.rsplit("/", 1)[0] + "/" + href
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

def filter_by_latest_month(data, year_month):
    """이번 달 데이터가 있으면 이번 달만, 없으면 데이터 내 가장 최근 월만 반환"""
    year, month = year_month.split("-")
    target = f"{year}年{month}月"

    # 이번 달 데이터 확인
    this_month = [d for d in data if target in d.get("approved_date", "")]
    if this_month:
        print(f"  날짜 필터 ({target}): {len(this_month)}건")
        return this_month

    # 이번 달 없으면 데이터 내 가장 최근 월 추출
    # approved_date 형식: 2026年02月26日
    dates = [d.get("approved_date", "") for d in data if d.get("approved_date")]
    if not dates:
        return data

    # 연월만 추출해서 가장 최근 월 찾기
    year_months = set()
    for d in dates:
        m = re.match(r'(\d{4}年\d{2}月)', d)
        if m:
            year_months.add(m.group(1))

    if not year_months:
        return data

    latest = sorted(year_months)[-1]
    filtered = [d for d in data if latest in d.get("approved_date", "")]
    print(f"  {target} 미발표 → 최근 공시({latest}) {len(filtered)}건 저장")
    return filtered

def save_json(data, year_month, license_type):
    os.makedirs("data", exist_ok=True)
    path = f"data/{year_month}-{license_type}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  저장 완료: {path} ({len(data)}건)")

def update_index():
    os.makedirs("data", exist_ok=True)
    files = sorted([f for f in os.listdir("data")
                    if f.endswith(".json") and f != "index.json"], reverse=True)
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
    ym = datetime.now().strftime("%Y-%m")
    print(f"\n=== {ym} 판호 수집 시작 ===\n")
    for license_type, url in INDEX_URLS.items():
        print(f"[{license_type}] 접근 중...")
        try:
            html = fetch(url)
            notice_url = get_latest_url(html, url)
            if not notice_url:
                print("  공시 링크 없음")
                data = parse_table(html, license_type)
            else:
                print(f"  공시 URL: {notice_url}")
                data = parse_table(fetch(notice_url), license_type)
            print(f"  전체 {len(data)}건 파싱")

            if license_type == "外资":
                data = filter_by_latest_month(data, ym)

            save_json(data, ym, license_type)
        except Exception as e:
            print(f"  오류: {e}")
    update_index()
    print("\n=== 완료 ===")

if __name__ == "__main__":
    run()
