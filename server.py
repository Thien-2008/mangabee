from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, json, os

app = Flask(__name__)
CORS(app)

BASE_DIR = "/data/data/com.termux/files/home/mangabee"
COOKIE_FILE = os.path.join(BASE_DIR, "current_cookie.txt")
API_PROXY = "https://mangabee.vercel.app/api/supabase"

@app.route('/update-cookie', methods=['POST'])
def update_cookie():
    data = request.get_json()
    cookie = data.get('cookie')
    if cookie:
        with open(COOKIE_FILE, 'w') as f:
            f.write(cookie)
        print("🍪 Cookie mới")
        return "OK", 200
    return "Bad Request", 400

@app.route('/enrich-comic', methods=['POST'])
def enrich_comic():
    data = request.get_json()
    print(f"\n[Flask] Nhận enrich:")
    print(f"  slug: {data.get('slug')}")
    print(f"  title: {data.get('title')}")
    print(f"  cover_url: {data.get('cover_url', '')[:60]}...")
    print(f"  description: {data.get('description', '')[:80]}...")
    
    slug = data.get('slug')
    title = data.get('title')
    cover_url = data.get('cover_url')
    description = data.get('description')
    
    if not slug:
        return jsonify({'error': 'Missing slug'}), 400
    
    payload = {}
    if title:
        payload['title'] = title
    if cover_url:
        payload['cover_url'] = cover_url
    if description:
        payload['description'] = description
    
    if not payload:
        print("⚠️ Payload trống, không có gì để update")
        return jsonify({'ok': False, 'reason': 'No data'}), 200
    
    print(f"📤 Payload gửi đi: {payload}")
    
    try:
        resp = requests.post(API_PROXY, json={
            'table': 'comics',
            'method': 'PATCH',
            'payload': payload,
            'query': f'slug=eq.{slug}',
            'prefer': 'return=minimal'
        }, timeout=15)
        print(f"  Supabase response: {resp.status_code} {resp.text[:100]}")
        return jsonify({'ok': resp.ok, 'status': resp.status_code})
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
