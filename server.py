from flask import Flask, request, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)

# 确保数据目录存在
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# 留言数据文件路径
MESSAGES_FILE = os.path.join(DATA_DIR, 'messages.json')

def load_messages():
    if os.path.exists(MESSAGES_FILE):
        with open(MESSAGES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_message(message):
    messages = load_messages()
    messages.append(message)
    with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

@app.route('/api/messages', methods=['POST'])
def submit_message():
    try:
        data = request.get_json()
        name = data.get('name')
        message = data.get('message')
        
        if not name or not message:
            return jsonify({'error': '姓名和留言内容不能为空'}), 400
            
        new_message = {
            'name': name,
            'message': message,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        save_message(new_message)
        return jsonify({'success': True, 'message': '留言提交成功！'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)