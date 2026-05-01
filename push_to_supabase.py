import requests, json, os, time

API_PROXY = "https://mangabee.vercel.app/api/supabase"
QUEUE_FILE = "comics_queue.json"

def push_to_supabase():
    if not os.path.exists(QUEUE_FILE):
        print("❌ Chưa có dữ liệu. Vào trang chủ bằng Kiwi Browser trước.")
        return
    
    with open(QUEUE_FILE, 'r') as f:
        comics = json.load(f)
    
    print(f"📤 Đang đẩy {len(comics)} truyện lên Supabase qua proxy...")
    count = 0
    for comic in comics:
        url = comic['url']
        slug = url.rstrip('/').split('/')[-1]
        
        # Kiểm tra tồn tại
        check = requests.post(API_PROXY, json={
            'table': 'comics',
            'method': 'GET',
            'query': f'slug=eq.{slug}&select=id'
        })
        if check.json().get('data'):
            continue
        
        # Thêm mới
        payload = {
            'slug': slug,
            'title': comic.get('title', slug.replace('-', ' ').title()),
            'cover_url': comic.get('cover_url', ''),
            'description': comic.get('description', ''),
            'source_url': url
        }
        resp = requests.post(API_PROXY, json={
            'table': 'comics',
            'method': 'POST',
            'payload': payload
        })
        if resp.json().get('ok'):
            print(f"  ✅ {slug}")
            count += 1
        else:
            print(f"  ⚠️ Lỗi: {slug}")
        
        time.sleep(0.3)
    
    os.remove(QUEUE_FILE)
    print(f"🎉 Hoàn tất! Đã thêm {count} truyện mới.")

if __name__ == '__main__':
    push_to_supabase()
