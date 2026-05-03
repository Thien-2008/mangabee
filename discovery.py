import requests, re, time, random, json, os
from datetime import datetime

SUPABASE_URL = "https://nepsanlvxkbsagnjrwxo.supabase.co"
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SOURCE = "https://goctruyentranhvui23.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 14; SM-A165F) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
}

def load_cookie():
    try:
        with open("current_cookie.txt", "r") as f:
            return f.read().strip()
    except:
        return ""

def fetch(url):
    cookie = load_cookie()
    local_headers = HEADERS.copy()
    if cookie:
        local_headers["Cookie"] = cookie
    local_headers["Referer"] = SOURCE + "/"
    try:
        r = requests.get(url, headers=local_headers, timeout=15)
        if r.status_code == 403:
            print("403 - Cookie may be expired")
            return None
        return r.text if r.ok else None
    except Exception as e:
        print(f"Fetch error: {e}")
        return None

def supabase_post(table, data, conflict=None):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if conflict:
        url += f"?on_conflict={conflict}"
        headers["Prefer"] = "resolution=merge-duplicates"
    resp = requests.post(url, headers=headers, json=data, timeout=15)
    return resp.ok

def supabase_get(path):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    resp = requests.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, timeout=15)
    return resp.json() if resp.ok else []

def parse_slugs(html):
    slugs = []
    seen = set()
    for m in re.finditer(r'/truyen/([a-z0-9][a-z0-9\-]{3,})"', html):
        slug = m.group(1)
        if slug not in seen and 'chuong' not in slug:
            seen.add(slug)
            slugs.append(slug)
    return slugs

def parse_chapters(html, slug):
    chapters = []
    seen = set()
    pattern = rf'/truyen/{re.escape(slug)}/chuong-([\d.]+)'
    for m in re.finditer(pattern, html):
        num = float(m.group(1))
        if num not in seen:
            seen.add(num)
            chapters.append({
                "chapter_number": num,
                "chapter_url": f"{SOURCE}/truyen/{slug}/chuong-{m.group(1)}"
            })
    return sorted(chapters, key=lambda x: x["chapter_number"])

def enrich_comic(slug, html):
    title = re.search(r'<title>([^<]*)</title>', html)
    title = title.group(1).split('-')[0].strip() if title else slug
    og_image = re.search(r'property="og:image" content="([^"]+)"', html)
    cover = og_image.group(1) if og_image else None
    og_desc = re.search(r'property="og:description" content="([^"]+)"', html)
    desc = og_desc.group(1) if og_desc else None

    supabase_post("comics", [{
        "slug": slug, "title": title, "cover_url": cover,
        "description": desc, "source_url": f"{SOURCE}/truyen/{slug}"
    }], conflict="slug")

    chapters = parse_chapters(html, slug)
    if chapters:
        records = []
        for ch in chapters:
            records.append({
                "comic_slug": slug,
                "chapter_number": ch["chapter_number"],
                "chapter_url": ch["chapter_url"],
                "status": "pending",
                "fetched": False,
                "images": []
            })
        supabase_post("chapters", records, conflict="comic_slug,chapter_number")
    return chapters

def discover():
    print(f"[Discovery] {datetime.now()}")
    html = fetch(f"{SOURCE}/danh-sach?sort=updated&p=1")
    if not html:
        return
    slugs = parse_slugs(html)
    existing_slugs = {r['slug'] for r in supabase_get("comics?select=slug&limit=5000")}
    new_slugs = [s for s in slugs if s not in existing_slugs]

    for slug in new_slugs:
        print(f"  New comic: {slug}")
        detail = fetch(f"{SOURCE}/truyen/{slug}")
        if detail:
            enrich_comic(slug, detail)
            time.sleep(random.uniform(1, 3))

    for slug in slugs[:10]:
        if slug not in existing_slugs:
            continue
        detail = fetch(f"{SOURCE}/truyen/{slug}")
        if not detail:
            continue
        all_chaps = parse_chapters(detail, slug)
        have_nums = {float(r['chapter_number']) for r in supabase_get(f"chapters?comic_slug=eq.{slug}&select=chapter_number")}
        new_chaps = [c for c in all_chaps if c["chapter_number"] not in have_nums]
        if new_chaps:
            print(f"  {slug}: +{len(new_chaps)} new chapters")
            records = [{
                "comic_slug": slug,
                "chapter_number": c["chapter_number"],
                "chapter_url": c["chapter_url"],
                "status": "pending",
                "fetched": False,
                "images": []
            } for c in new_chaps]
            supabase_post("chapters", records, conflict="comic_slug,chapter_number")
        time.sleep(random.uniform(0.5, 1.5))

if __name__ == "__main__":
    while True:
        discover()
        time.sleep(600 + random.randint(0, 120))
