import sqlite3
import datetime

DB_PATH = "igris_memory.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            timestamp TEXT,
            content TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_memory(user_id: str, content: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    cursor.execute('INSERT INTO memory (user_id, timestamp, content) VALUES (?, ?, ?)', (user_id, now, content))
    conn.commit()
    conn.close()

def get_memories(user_id: str, limit: int = 5) -> str:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM memory WHERE user_id = ? ORDER BY id DESC LIMIT ?', (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return ""
    
    memories = [row[0] for row in rows]
    memories.reverse()
    return "\n".join(memories)

# Initialize DB on load
init_db()
