import requests, json, os, time
from bs4 import BeautifulSoup

API_PROXY = "https://mangabee.vercel.app/api/supabase"
COOKIE_FILE = "current_cookie.txt"

def load_cookie():
    try:
        with open(COOKIE_FILE, 'r') as f:
            return f.read().strip()
    except:
        return None

def get_comic_detail(source_url, cookie):
    """Lấy cover_url và description từ trang chi tiết truyện"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Cookie': cookie,
        'Referer': 'https://goctruyentranhvui20.com/'
    }
    try:
        resp = requests.get(source_url, headers=headers, timeout=15)
        print(f"    Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"    Response: {resp.text[:200]}")
            return None, None
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Lấy cover từ og:image
        cover = None
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            cover = og_image['content']
        
        # Lấy description
        desc = None
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            desc = og_desc['content']
        else:
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                desc = meta_desc['content']
        
        return cover, desc
    except Exception as e:
        print(f"    Lỗi: {e}")
        return None, None

def get_comics_without_cover():
    """Lấy danh sách truyện chưa có cover_url + source_url"""
    resp = requests.post(API_PROXY, json={
        'table': 'comics',
        'method': 'GET',
        'query': 'select=slug,title,source_url&cover_url=is.null'
    })
    data = resp.json().get('data', [])
    return data

def update_comic(slug, payload):
    """Cập nhật comic qua API proxy"""
    resp = requests.post(API_PROXY, json={
        'table': 'comics',
        'method': 'PATCH',
        'payload': payload,
        'query': f'slug=eq.{slug}',
        'prefer': 'return=minimal'
    })
    return resp.json().get('ok', False)

def main():
    cookie = load_cookie()
    if not cookie:
        print("❌ Chưa có cookie. Mở Kiwi Browser vào trang nguồn trước.")
        return
    
    comics = get_comics_without_cover()
    if not comics:
        print("✅ Tất cả truyện đã có cover_url!")
        return
    
    print(f"📸 Cần cập nhật {len(comics)} truyện...")
    count = 0
    for comic in comics:
        slug = comic['slug']
        source_url = comic.get('source_url')
        if not source_url:
            print(f"  ⚠️ {slug}: Không có source_url, bỏ qua")
            continue
        
        print(f"  🔍 {slug} -> {source_url}")
        cover, desc = get_comic_detail(source_url, cookie)
        
        if not cover and not desc:
            print(f"  ⏭️ Bỏ qua (không lấy được dữ liệu)")
            continue
        
        payload = {}
        if cover:
            payload['cover_url'] = cover
        if desc:
            payload['description'] = desc
        
        if update_comic(slug, payload):
            print(f"  ✅ Đã cập nhật")
            count += 1
        else:
            print(f"  ⚠️ Lỗi cập nhật")
        
        time.sleep(1)
    
    print(f"🎉 Hoàn tất! Đã cập nhật {count}/{len(comics)} truyện.")

if __name__ == '__main__':
    main()
