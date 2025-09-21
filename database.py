# database.py

import sqlite3
import json

DATABASE_FILE = "manga_tracker.db"

def connect_db():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def setup_db():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            base_url TEXT NOT NULL UNIQUE,
            latest_updates_url TEXT,
            manga_card_selector TEXT,
            title_selector TEXT,
            chapter_selector TEXT,
            navigation_mode TEXT DEFAULT 'pagination', -- 'pagination' ou 'load_more'
            load_more_button_text TEXT DEFAULT NULL,
            UNIQUE(base_url)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mangas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            primary_name TEXT NOT NULL UNIQUE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS manga_aliases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manga_id INTEGER NOT NULL,
            alias_name TEXT NOT NULL,
            FOREIGN KEY(manga_id) REFERENCES mangas(id),
            UNIQUE(alias_name, manga_id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS manga_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manga_id INTEGER NOT NULL,
            site_id INTEGER NOT NULL,
            url_on_site TEXT,
            last_chapter_scraped TEXT DEFAULT '0',
            newly_found_chapters TEXT DEFAULT '[]',
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(manga_id) REFERENCES mangas(id),
            FOREIGN KEY(site_id) REFERENCES sites(id),
            UNIQUE(manga_id, site_id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS site_last_seen (
            site_id INTEGER PRIMARY KEY,
            manga_name TEXT,
            chapter_number TEXT,
            FOREIGN KEY(site_id) REFERENCES sites(id)
        )
    """)
    conn.commit()
    conn.close()

def get_site_id_by_url(base_url: str):
    """Retorna o ID de um site com base em sua URL."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM sites WHERE base_url = ?", (base_url,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

def get_sites_details():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sites")
    sites = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sites

def add_site(site_details: dict):
    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO sites (
                name, base_url, latest_updates_url, manga_card_selector, title_selector, chapter_selector, navigation_mode, load_more_button_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            site_details['name'],
            site_details['base_url'],
            site_details['latest_updates_url'],
            site_details['manga_card_selector'],
            site_details['title_selector'],
            site_details['chapter_selector'],
            site_details.get('navigation_mode', 'pagination'),
            site_details.get('load_more_button_text')
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def add_manga(manga_name: str, aliases: list = None):
    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO mangas (primary_name) VALUES (?)", (manga_name,))
        conn.commit()
        cursor.execute("SELECT id FROM mangas WHERE primary_name = ?", (manga_name,))
        manga_id = cursor.fetchone()[0]
        if aliases:
            for alias in aliases:
                cursor.execute("INSERT OR IGNORE INTO manga_aliases (manga_id, alias_name) VALUES (?, ?)", (manga_id, alias))
            conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_manga_id_by_alias(alias_name: str):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT manga_id FROM manga_aliases WHERE alias_name = ?", (alias_name,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

def get_manga_by_name_and_site_id(manga_name: str, site_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    manga_id = get_manga_id_by_alias(manga_name)
    if not manga_id:
        cursor.execute("SELECT id FROM mangas WHERE primary_name = ?", (manga_name,))
        result = cursor.fetchone()
        if result:
            manga_id = result[0]
        else:
            return None
    cursor.execute("SELECT * FROM manga_sources WHERE manga_id = ? AND site_id = ?", (manga_id, site_id))
    result = cursor.fetchone()
    conn.close()
    if result:
        return dict(result)
    return None

def update_source_status(source_id: int, url_on_site: str, last_chapter: float, newly_found: list):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE manga_sources SET url_on_site = ?, last_chapter_scraped = ?, newly_found_chapters = ?, status = 'active' WHERE id = ?",
                   (url_on_site, last_chapter, json.dumps(newly_found), source_id))
    conn.commit()
    conn.close()

def get_latest_chapter_for_manga(manga_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(last_chapter_scraped) FROM manga_sources WHERE manga_id = ?", (manga_id,))
    latest_chapter = cursor.fetchone()[0]
    conn.close()
    return latest_chapter or 0

def get_manga_details_for_list():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.id AS manga_id, m.primary_name AS manga_name, s.name AS site_name, ms.url_on_site, ms.last_chapter_scraped, ms.newly_found_chapters, ms.status
        FROM manga_sources ms
        INNER JOIN mangas m ON ms.manga_id = m.id
        INNER JOIN sites s ON ms.site_id = s.id
    """)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas


def get_all_mangas_with_details():
    """Retorna todos os mangás e seus detalhes de fonte, se existirem, usando LEFT JOIN."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.id AS manga_id, m.primary_name AS manga_name, s.name AS site_name,
               ms.url_on_site, ms.last_chapter_scraped, ms.newly_found_chapters, ms.status
        FROM mangas m
        LEFT JOIN manga_sources ms ON m.id = ms.manga_id
        LEFT JOIN sites s ON ms.site_id = s.id
    """)
    mangas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mangas


def delete_manga(manga_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM mangas WHERE id = ?", (manga_id,))
    cursor.execute("DELETE FROM manga_aliases WHERE manga_id = ?", (manga_id,))
    cursor.execute("DELETE FROM manga_sources WHERE manga_id = ?", (manga_id,))
    conn.commit()
    rows_deleted = cursor.rowcount
    conn.close()
    return rows_deleted > 0

def find_manga_in_db(manga_name: str):
    """Tenta localizar um mangá pelo alias ou pelo nome primário."""
    manga_id = get_manga_id_by_alias(manga_name)
    if manga_id:
        return manga_id

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM mangas WHERE primary_name = ?", (manga_name,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None


def create_manga_source_if_not_exists(manga_id: int, site_id: int, url: str, first_chapter: float):
    """Cria um vínculo entre mangá e site, caso ainda não exista."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR IGNORE INTO manga_sources
        (manga_id, site_id, url_on_site, last_chapter_scraped, newly_found_chapters, status)
        VALUES (?, ?, ?, ?, ?, 'active')
        """,
        (manga_id, site_id, url, first_chapter, json.dumps([str(first_chapter)])),
    )
    conn.commit()
    conn.close()


def delete_site(site_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sites WHERE id = ?", (site_id,))
    conn.commit()
    conn.close()


def get_site_last_seen(site_id: int):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT manga_name, chapter_number FROM site_last_seen WHERE site_id = ?", (site_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"manga": row["manga_name"], "chapter": row["chapter_number"]}
    return None

def set_site_last_seen(site_id: int, manga_name: str, chapter_number: float):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO site_last_seen (site_id, manga_name, chapter_number)
        VALUES (?, ?, ?)
        ON CONFLICT(site_id) DO UPDATE SET manga_name=excluded.manga_name, chapter_number=excluded.chapter_number
    """, (site_id, manga_name, chapter_number))
    conn.commit()
    conn.close()


def get_sites_with_last_seen():
    """Retorna todos os sites com seus últimos dados de rastreamento."""
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            s.id AS site_id,
            s.name AS site_name,
            s.base_url,
            sls.manga_name AS last_seen_manga,
            sls.chapter_number AS last_seen_chapter
        FROM
            sites s
        LEFT JOIN
            site_last_seen sls ON s.id = sls.site_id
    """)
    sites_with_last_seen = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sites_with_last_seen