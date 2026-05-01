import requests, json, os, time

API_PROXY = "https://mangabee.vercel.app/api/supabase"
QUEUE_FILE = "comics_queue.json"

def push_to_supabase():
    if not os.path.exists(QUEUE_FILE):
        print("❌ Chưa có dữ liệu. Vào trang chủ bằng Kiwi Browser trước.")
        return
    
    with open(QUEUE_FILE, 'r') as f:
        comics = json.load(f)
    
    print(f"📤 Đang đẩy {len(comics)} truyện lên Supabase qua proxy (UPSERT)...")
    count = 0
    for comic in comics:
        url = comic['url']
        slug = url.rstrip('/').split('/')[-1]
        
        payload = {
            'slug': slug,
            'title': comic.get('title', slug.replace('-', ' ').title()),
            'source_url': url,
            'description': comic.get('description', '')
        }
        
        # Dùng UPSERT: nếu slug đã tồn tại thì cập nhật, chưa có thì thêm mới
        resp = requests.post(API_PROXY, json={
            'table': 'comics',
            'method': 'POST',
            'payload': payload,
            'query': 'on_conflict=slug',
            'prefer': 'resolution=merge-duplicates,return=representation'
        })
        
        try:
            resp_data = resp.json()
        except:
            resp_data = {}
        
        if resp_data.get('ok'):
            print(f"  ✅ {slug}")
            count += 1
        else:
            err = resp_data.get('error', resp_data.get('data', resp.text[:80]))
            print(f"  ⚠️ {slug}: {err}")
        
        time.sleep(0.3)
    
    # Chỉ xóa file queue nếu tất cả đều thành công hoặc đã xử lý xong
    if os.path.exists(QUEUE_FILE):
        os.remove(QUEUE_FILE)
    print(f"🎉 Hoàn tất! Đã xử lý {count} truyện mới/cập nhật.")

if __name__ == '__main__':
    push_to_supabase()
