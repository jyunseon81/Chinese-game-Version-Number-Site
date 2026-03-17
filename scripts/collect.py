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
                base = base_url.rsplit("/", 1)[0]
                return base + "/" + href
    for a in links:
        href = a.get("href", "")
        if re.search(r'/202\d{3}/', href) and ".html" in href:
            if href.startswith("http"):
                return href
            elif href.startswith("/"):
                return "https://www.nppa.gov.cn" + href
            else:
                base = base_url.rsplit("/", 1)[0]
                return base + "/" + href
    return None

def get_headers(table):
    """테이블 헤더 추출"""
    headers = []
    header_row = table.find("tr")
    if header_row:
        for th in header_row.find_all(["th", "td"]):
            headers.append(th.get_text(strip=True))
    return headers

def parse_table(html, license_type):
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if not tables:
        return []
    table = max(tables, key=lambda t: len(t.find_all("tr")))
    
    # 헤더 확인
    headers = get_headers(table)
    print(f"  테이블 헤더: {headers}")
    
    rows = []
    for tr in table.find_all("tr")[1:]:
        tds = tr.find_all("td")
        if len(tds) < 3:
            continue
        cols = [td.get_text(strip=True) for td in tds]
        
        # 헤더 기반으로 컬럼 매핑
        # 내자: 序号, 游戏名称, 申请单位(신청사), 审批编号(판호번호), 出版单位 등
        # 외자: 序号, 游戏名称, 境外公司(해외회사), 国内申请单位, 审批编号 등
        if license_type == "外资" and len(cols) >= 5:
            rows.append({
                "seq":              cols[0],
                "game_name":        cols[1],
                "foreign_company":  cols[2],  # 해외 원작사
                "cn_company":       cols[3],  # 중국 퍼블리셔
                "license_number":   cols[4],  # 판호번호
                "platform":         cols[5] if len(cols) > 5 else "",
                "type":             license_type,
            })
        else:
            rows.append({
                "seq":            cols[0],
                "game_name":      cols[1],
                "company":        cols[2],
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
            save_json(data, ym, license_type)
        except Exception as e:
            print(f"  오류: {e}")
    update_index()
    print("\n=== 완료 ===")

if __name__ == "__main__":
    run()
