# database.py

import sqlite3

DATABASE_FILE = "manga_links.db"


def connect_db():
    conn = sqlite3.connect(DATABASE_FILE)
    return conn


def setup_db():
    """Cria a tabela se ela não existir."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS manga_list (
            name TEXT PRIMARY KEY NOT NULL,
            url TEXT NOT NULL,
            selector TEXT NOT NULL,
            last_chapter REAL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


def get_manga_details(manga_name):
    """Busca a URL, seletor e último capítulo para um mangá específico."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT url, selector, last_chapter FROM manga_list WHERE name = ?", (manga_name,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return {"url": result[0], "selector": result[1], "last_chapter": result[2]}
    return None


def update_last_chapter(name: str, new_chapter: float):
    """Atualiza o último capítulo rastreado de um mangá."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE manga_list SET last_chapter = ? WHERE name = ?", (new_chapter, name))
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
    cursor.execute("SELECT name, url, selector, last_chapter FROM manga_list")
    all_details = [
        {"name": row[0], "url": row[1], "selector": row[2], "last_chapter": row[3]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return all_details


def delete_manga(name: str):
    """Exclui um mangá do banco de dados pelo nome."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM manga_list WHERE name = ?", (name,))
    conn.commit()
    rows_deleted = cursor.rowcount
    conn.close()
    return rows_deleted > 0