import requests, json, time
from bs4 import BeautifulSoup

SUPABASE_URL = "https://izunfajqdlfcgifjzflh.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dW5mYWpxZGxmY2dpZmp6ZmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDIzNjksImV4cCI6MjA2MTcxODM2OX0.Gl9sV2HKlgl_7Hyv3GSmVqUa7G2sTTFPEosXQxne8aE"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://goctruyentranhvui20.com/',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

BASE_URL = "https://goctruyentranhvui20.com"

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
        print("⚠️ Chưa có cookie!")

    print("📥 Đang lấy danh sách truyện từ:", BASE_URL)
    session = requests.Session()
    resp = session.get(BASE_URL, headers=HEADERS, timeout=15)
    print("Status:", resp.status_code)
    # In 500 ký tự đầu để debug
    print("Nội dung đầu:", resp.text[:500])
    
    soup = BeautifulSoup(resp.text, 'html.parser')

    comics_list = None

    # Cách 1: JSON-LD
    for tag in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(tag.string)
            if isinstance(data, dict) and data.get('@type') == 'ItemList':
                comics_list = data.get('itemListElement', [])
                break
        except:
            continue

    # Cách 2: Tìm link /truyen/
    if not comics_list:
        print("⚠️ Không thấy JSON-LD, thử cách khác...")
        comics_list = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if '/truyen/' in href:
                full_url = href if href.startswith('http') else BASE_URL + href
                if full_url not in [c.get('url') for c in comics_list]:
                    comics_list.append({'url': full_url})

    if not comics_list:
        print("❌ Không thể lấy danh sách truyện!")
        return

    count = 0
    for item in comics_list:
        url = item.get('url')
        if not url: continue

        slug = url.rstrip('/').split('/')[-1].split('?')[0]

        check_url = f"{SUPABASE_URL}/rest/v1/comics?slug=eq.{slug}&select=id"
        check_resp = session.get(check_url, headers=HEADERS)
        if check_resp.json():
            continue

        try:
            detail_resp = session.get(url, headers=HEADERS, timeout=15)
            detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')
        except:
            continue

        title = slug.replace('-', ' ').title()
        if detail_soup.title and detail_soup.title.string:
            title = detail_soup.title.string.split(' - ')[0].strip()

        cover_url = None
        for meta in detail_soup.find_all('meta'):
            if meta.get('property') in ['og:image', 'twitter:image']:
                cover_url = meta.get('content', '')
                break

        print(f"  📖 {title}")

        session.post(
            f"{SUPABASE_URL}/rest/v1/comics",
            headers=HEADERS,
            json={'slug': slug, 'title': title, 'cover_url': cover_url, 'description': '', 'source_url': url}
        )
        count += 1
        time.sleep(1)

    print(f"✅ Đã thêm {count} truyện mới!")

if __name__ == '__main__':
    sync_data()
