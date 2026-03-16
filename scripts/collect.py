import httpx
from bs4 import BeautifulSoup
import json, os
from datetime import datetime
from major_companies import is_major_company

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
INDEX_URLS = {
    "内资": "https://www.nppa.gov.cn/bsfw/jggs/yxspjg/index.html",
    "外资": "https://www.nppa.gov.cn/bsfw/jggs/wzyxspjg/index.html",
}

def fetch(url):
    r = httpx.get(url, headers=HEADERS, timeout=30, follow_redirects=True)
    r.raise_for_status()
    return r.text

def get_latest_url(html):
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.select("a[href]"):
        href = a["href"]
        if ".html" in href and ("yxsp" in href or "jggs" in href):
            if href.startswith("http"):
                return href
            if href.startswith("/"):
                return "https://www.nppa.gov.cn" + href
    return None

def parse_table(html, license_type):
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    rows = []
    for tr in table.find_all("tr")[1:]:
        tds = tr.find_all("td")
        if len(tds) < 4:
            continue
        cols = [td.get_text(strip=True) for td in tds]
        rows.append({
            "seq":            cols[0] if len(cols) > 0 else "",
            "game_name":      cols[1] if len(cols) > 1 else "",
            "company":        cols[2] if len(cols) > 2 else "",
            "license_number": cols[3] if len(cols) > 3 else "",
            "platform":       cols[4] if len(cols) > 4 else "",
            "type":           license_type,
        })
    return rows

def save_json(data, year_month, license_type):
    os.makedirs("data", exist_ok=True)
    path = f"data/{year_month}-{license_type}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  저장 완료: {path} ({len(data)}건)")

def update_index():
    files = sorted([f for f in os.listdir("data")
                    if f.endswith(".json") and f != "index.json"], reverse=True)
    entries = []
    for f in files:
        parts = f.replace(".json","").split("-")
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
            notice_url = get_latest_url(html)
            if not notice_url:
                print("  공시 링크 없음")
                continue
            print(f"  공시 URL: {notice_url}")
            data = parse_table(fetch(notice_url), license_type)
            print(f"  전체 {len(data)}건 파싱")
            if license_type == "内资":
                data = [d for d in data if is_major_company(d["company"])]
                print(f"  주요 게임사 필터 후 {len(data)}건")
            save_json(data, ym, license_type)
        except Exception as e:
            print(f"  오류: {e}")
    update_index()

if __name__ == "__main__":
    run()