from flask import Flask, request
import os

app = Flask(__name__)
COOKIE_FILE = "current_cookie.txt"

@app.route('/update-cookie', methods=['POST'])
def update_cookie():
    data = request.get_json()
    cookie = data.get('cookie')
    if cookie:
        with open(COOKIE_FILE, 'w') as f:
            f.write(cookie)
        print(f"✅ Đã cập nhật cookie mới: {cookie[:60]}...")
        return "OK", 200
    return "Bad Request", 400

if __name__ == '__main__':
    # Cho phép nhận request từ bất kỳ nguồn nào (CORS)
    from flask_cors import CORS
    CORS(app)
    app.run(host='127.0.0.1', port=5000)
