import sqlite3
import datetime
import json
import os
import google.generativeai as genai
import numpy as np
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

DB_PATH = "igris_memory.db"

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_embedding(text: str) -> list[float]:
    if not api_key:
        return [0.0] * 768
    
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"[Memory] Embedding error: {e}")
        return [0.0] * 768

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memory_v2 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            timestamp TEXT,
            content TEXT,
            vector TEXT
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM memory_v2')
    if cursor.fetchone()[0] == 0:
        try:
            cursor.execute('SELECT user_id, timestamp, content FROM memory')
            old_rows = cursor.fetchall()
            for row in old_rows:
                vec = get_embedding(row[2])
                cursor.execute(
                    'INSERT INTO memory_v2 (user_id, timestamp, content, vector) VALUES (?, ?, ?, ?)',
                    (row[0], row[1], row[2], json.dumps(vec))
                )
            print(f"[Memory] Migrated {len(old_rows)} memories to v2.")
        except sqlite3.OperationalError:
            pass
            
    conn.commit()
    conn.close()

def save_memory(user_id: str, content: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    
    vector = get_embedding(content)
    
    cursor.execute(
        'INSERT INTO memory_v2 (user_id, timestamp, content, vector) VALUES (?, ?, ?, ?)', 
        (user_id, now, content, json.dumps(vector))
    )
    conn.commit()
    conn.close()

def get_memories(user_id: str, limit: int = 5) -> str:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM memory_v2 WHERE user_id = ? ORDER BY id DESC LIMIT ?', (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return ""
    
    memories = [row[0] for row in rows]
    memories.reverse()
    return "\n".join(memories)

def search_similar_memories(user_id: str, query: str, limit: int = 3) -> str:
    """Search memory using cosine similarity on embeddings."""
    query_vec = np.array(get_embedding(query))
    if not np.any(query_vec):
        return get_memories(user_id, limit)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT content, vector FROM memory_v2 WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return "No memories found."
        
    results = []
    for row in rows:
        content = row[0]
        try:
            vec = np.array(json.loads(row[1]))
            # Cosine similarity
            norm_q = np.linalg.norm(query_vec)
            norm_v = np.linalg.norm(vec)
            if norm_q == 0 or norm_v == 0:
                continue
            similarity = np.dot(query_vec, vec) / (norm_q * norm_v)
            results.append((similarity, content))
        except:
            continue
            
    results.sort(key=lambda x: x[0], reverse=True)
    top_contents = [res[1] for res in results[:limit]]
    
    if not top_contents:
        return "No memories found."
        
    return "\n".join(top_contents)

init_db()
