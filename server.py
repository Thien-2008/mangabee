from flask import Flask, request
from flask_cors import CORS
import os, json, time

app = Flask(__name__)
CORS(app)

BASE_DIR = "/data/data/com.termux/files/home/mangabee"
COOKIE_FILE = os.path.join(BASE_DIR, "current_cookie.txt")
QUEUE_FILE = os.path.join(BASE_DIR, "comics_queue.json")

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

@app.route('/sync-comics', methods=['POST'])
def sync_comics():
    """Nhận danh sách truyện từ trình duyệt và lưu vào file"""
    comics = request.get_json()
    if not comics:
        return "No data", 400
    
    # Đọc dữ liệu cũ nếu có
    existing = []
    if os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE, 'r') as f:
            try:
                existing = json.load(f)
            except:
                existing = []
    
    # Gộp và lưu
    existing.extend(comics)
    with open(QUEUE_FILE, 'w') as f:
        json.dump(existing, f, ensure_ascii=False)
    
    print(f"📥 Đã nhận {len(comics)} truyện, tổng: {len(existing)}")
    return f"Queued {len(comics)}", 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
