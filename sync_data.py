import requests
import json
import time
from bs4 import BeautifulSoup

# ============================================================
# THAY ĐỔI 2 DÒNG DƯỚI ĐÂY BẰNG THÔNG TIN SUPABASE CỦA BẠN
# ============================================================
SUPABASE_URL = "https://nepsanlvxkbsagnjrwxo.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_H7l5pUK8kqpDcBnrQ_ZtEg_Ep-152z-"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

BASE_URL = "https://goctruyentranhvui23.com"

def load_cookie():
    try:
        with open("current_cookie.txt", "r") as f:
            return f.read().strip()
    except:
        return None

def sync_data():
    cookie = load_cookie()
    if cookie:
        HEADERS['Cookie'] = cookie
        print("🍪 Đã nạp cookie mới nhất")
    else:
        print("⚠️ Chưa có cookie, hãy mở web bằng Kiwi Browser trước!")

    print("📥 Đang lấy danh sách truyện mới...")
    resp = requests.get(BASE_URL, headers=HEADERS)
    soup = BeautifulSoup(resp.text, 'html.parser')

    script_tag = soup.find('script', type='application/ld+json')
    if not script_tag:
        print("❌ Không tìm thấy JSON-LD")
        return

    data = json.loads(script_tag.string)
    if data.get('@type') != 'ItemList':
        print("❌ JSON-LD không phải ItemList")
        return

    count = 0
    for item in data['itemListElement']:
        url = item.get('url')
        if not url:
            continue

        slug = url.rstrip('/').split('/')[-1]

        # Kiểm tra truyện đã tồn tại chưa
        check_url = f"{SUPABASE_URL}/rest/v1/comics?slug=eq.{slug}&select=id"
        check_resp = requests.get(check_url, headers=HEADERS)
        if check_resp.json():
            continue  # đã có, bỏ qua

        # Lấy chi tiết truyện
        detail_resp = requests.get(url, headers=HEADERS)
        detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

        title = slug.replace('-', ' ').title()
        if detail_soup.title and detail_soup.title.string:
            title = detail_soup.title.string.split(' - ')[0].strip()

        cover_url = None
        meta_img = detail_soup.find('meta', property='og:image')
        if meta_img and meta_img.get('content'):
            cover_url = meta_img['content']
            if cover_url.startswith('/'):
                cover_url = BASE_URL + cover_url

        print(f"  📖 {title}")

        # Thêm vào Supabase
        insert_url = f"{SUPABASE_URL}/rest/v1/comics"
        comic_data = {
            'slug': slug,
            'title': title,
            'cover_url': cover_url,
            'description': f'Truyện {title}',
            'source_url': url
        }
        requests.post(insert_url, headers=HEADERS, json=comic_data)
        count += 1
        time.sleep(1)  # tránh bị chặn

    print(f"✅ Đã thêm {count} truyện mới!")

if __name__ == '__main__':
    sync_data()
