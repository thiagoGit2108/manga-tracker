# database.py

import sqlite3

DATABASE_FILE = "manga_links.db"


def connect_db():
    conn = sqlite3.connect(DATABASE_FILE)
    return conn


def setup_db():
    """Cria as tabelas se elas não existirem."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS manga_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            selector TEXT NOT NULL,
            last_chapter REAL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


def get_manga_details(manga_id: int):
    """Busca a URL, seletor e último capítulo para um mangá específico, usando o ID."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name, url, selector, last_chapter FROM manga_list WHERE id = ?", (manga_id,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return {"name": result[0], "url": result[1], "selector": result[2], "last_chapter": result[3]}
    return None


def update_last_chapter(manga_id: int, new_chapter: float):
    """Atualiza o último capítulo rastreado de um mangá, usando o ID."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE manga_list SET last_chapter = ? WHERE id = ?", (new_chapter, manga_id))
    conn.commit()
    conn.close()


def add_manga(name: str, url: str, selector: str):
    """Adiciona um novo mangá e suas configurações à lista."""
    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO manga_list (name, url, selector) VALUES (?, ?, ?)", (name, url, selector))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def get_all_manga_details():
    """Busca os detalhes de todos os mangás no banco de dados."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, url, selector, last_chapter FROM manga_list")
    all_details = [
        {"id": row[0], "name": row[1], "url": row[2], "selector": row[3], "last_chapter": row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return all_details


def delete_manga(manga_id: int):
    """Exclui um mangá do banco de dados pelo ID."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM manga_list WHERE id = ?", (manga_id,))
    conn.commit()
    rows_deleted = cursor.rowcount
    conn.close()
    return rows_deleted > 0