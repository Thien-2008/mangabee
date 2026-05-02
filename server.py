from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, json, os

app = Flask(__name__)
CORS(app)

BASE_DIR = "/data/data/com.termux/files/home/mangabee"
COOKIE_FILE = os.path.join(BASE_DIR, "current_cookie.txt")
API_PROXY = "https://mangabee.vercel.app/api/supabase"

# State trong memory để theo dõi tiến trình
state = {
    'completed': set(),
    'total': 0
}

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
    """Nhận dữ liệu từ Script B và upsert lên Supabase"""
    data = request.get_json()
    slug = data.get('slug')
    cover_url = data.get('cover_url')
    description = data.get('description')
    
    if not slug:
        return jsonify({'error': 'Missing slug'}), 400
    
    payload = {}
    if cover_url:
        payload['cover_url'] = cover_url
    if description:
        payload['description'] = description
    
    if not payload:
        return jsonify({'ok': False, 'reason': 'No data'}), 200
    
    try:
        resp = requests.post(API_PROXY, json={
            'table': 'comics',
            'method': 'PATCH',
            'payload': payload,
            'query': f'slug=eq.{slug}',
            'prefer': 'return=minimal'
        }, timeout=15)
        
        ok = resp.json().get('ok', False)
        if ok:
            state['completed'].add(slug)
            print(f"✅ {slug} (đã xong: {len(state['completed'])})")
        else:
            print(f"⚠️ {slug}: {resp.text[:100]}")
        
        return jsonify({'ok': ok, 'slug': slug})
    except Exception as e:
        print(f"❌ {slug}: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/progress', methods=['GET'])
def progress():
    """Trả về tiến trình hiện tại"""
    return jsonify({
        'completed': len(state['completed']),
        'total': state['total'],
        'slugs': list(state['completed'])
    })

@app.route('/reset-progress', methods=['POST'])
def reset_progress():
    """Reset tiến trình (khi bắt đầu trang mới)"""
    state['completed'] = set()
    state['total'] = request.json.get('total', 0)
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
