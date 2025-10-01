# database.py - VERSÃO COMPLETA E CORRIGIDA PARA POSTGRESQL

import os
import json
import psycopg2
import psycopg2.extras

# Pega a DATABASE_URL do ambiente, com um valor padrão para facilitar testes locais
DATABASE_URL = os.getenv("DATABASE_URL", "dbname=manga_tracker user=postgres password=postgres host=localhost port=5432")

def connect_db():
    """Estabelece a conexão com o banco de dados."""
    return psycopg2.connect(DATABASE_URL)

def execute_query(query, params=None, fetch=None):
    """
    Função auxiliar para executar queries de forma segura, gerenciando a conexão.
    'fetch' pode ser 'one', 'all', ou None.
    """
    conn = connect_db()
    try:
        # Usar um 'with' block garante que o cursor seja fechado
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            
            # Se a query for de leitura (SELECT), busca os resultados
            if fetch == "one":
                result = cursor.fetchone()
                return result
            elif fetch == "all":
                result = cursor.fetchall()
                return result
            
            # Se for uma query de escrita (INSERT, UPDATE, DELETE), faz o commit
            conn.commit()
    finally:
        # Garante que a conexão seja sempre fechada
        conn.close()

def setup_db():
    """Cria todas as tabelas no banco de dados se elas não existirem."""
    conn = connect_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sites (
                    id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, base_url TEXT NOT NULL UNIQUE,
                    latest_updates_url TEXT, manga_card_selector TEXT, title_selector TEXT,
                    chapter_selector TEXT, navigation_mode TEXT DEFAULT 'pagination', load_more_button_text TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mangas (
                    id SERIAL PRIMARY KEY, primary_name TEXT NOT NULL UNIQUE
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS manga_aliases (
                    id SERIAL PRIMARY KEY, manga_id INTEGER NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
                    alias_name TEXT NOT NULL, UNIQUE(alias_name, manga_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS manga_sources (
                    id SERIAL PRIMARY KEY, manga_id INTEGER NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
                    site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE, url_on_site TEXT,
                    last_chapter_scraped TEXT DEFAULT '0', newly_found_chapters TEXT DEFAULT '[]',
                    status TEXT DEFAULT 'pending', UNIQUE(manga_id, site_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS site_last_seen (
                    site_id INTEGER PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
                    manga_name TEXT, chapter_number TEXT
                )
            """)
            conn.commit()
    finally:
        conn.close()

def get_site_id_by_url(base_url: str):
    result = execute_query("SELECT id FROM sites WHERE base_url = %s", (base_url,), fetch="one")
    return result['id'] if result else None

def get_sites_details():
    return execute_query("SELECT * FROM sites", fetch="all")

def add_site(site_details: dict):
    try:
        query = """
            INSERT INTO sites (name, base_url, latest_updates_url, manga_card_selector, title_selector, chapter_selector, navigation_mode, load_more_button_text)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (base_url) DO NOTHING
        """
        params = (
            site_details.get('name'), site_details.get('base_url'), site_details.get('latest_updates_url'),
            site_details.get('manga_card_selector'), site_details.get('title_selector'), site_details.get('chapter_selector'),
            site_details.get('navigation_mode', 'pagination'), site_details.get('load_more_button_text')
        )
        execute_query(query, params)
        return True
    except psycopg2.Error:
        return False

def add_manga(manga_name: str, aliases: list = None):
    try:
        execute_query("INSERT INTO mangas (primary_name) VALUES (%s) ON CONFLICT (primary_name) DO NOTHING", (manga_name,))
        
        manga_row = execute_query("SELECT id FROM mangas WHERE primary_name = %s", (manga_name,), fetch="one")
        if not manga_row: return False
        
        manga_id = manga_row['id']
        if aliases:
            for alias in aliases:
                execute_query("INSERT INTO manga_aliases (manga_id, alias_name) VALUES (%s, %s) ON CONFLICT (alias_name, manga_id) DO NOTHING", (manga_id, alias))
        return True
    except psycopg2.Error:
        return False

def get_manga_id_by_alias(alias_name: str):
    result = execute_query("SELECT manga_id FROM manga_aliases WHERE alias_name = %s", (alias_name,), fetch="one")
    return result['manga_id'] if result else None

def get_manga_by_name_and_site_id(manga_name: str, site_id: int):
    manga_id = get_manga_id_by_alias(manga_name)
    if not manga_id:
        result = execute_query("SELECT id FROM mangas WHERE primary_name = %s", (manga_name,), fetch="one")
        if result:
            manga_id = result['id']
        else:
            return None
    
    source = execute_query("SELECT * FROM manga_sources WHERE manga_id = %s AND site_id = %s", (manga_id, site_id), fetch="one")
    return source

def update_source_status(source_id: int, url_on_site: str, last_chapter: float, newly_found: list):
    query = "UPDATE manga_sources SET url_on_site = %s, last_chapter_scraped = %s, newly_found_chapters = %s, status = 'active' WHERE id = %s"
    execute_query(query, (url_on_site, str(last_chapter), json.dumps(newly_found), source_id))

def get_latest_chapter_for_manga(manga_id: int):
    result = execute_query("SELECT MAX(last_chapter_scraped) as max_chapter FROM manga_sources WHERE manga_id = %s", (manga_id,), fetch="one")
    return result['max_chapter'] or '0'

def get_manga_details_for_list():
    query = """
        SELECT m.id AS manga_id, m.primary_name AS manga_name, s.name AS site_name, ms.url_on_site, 
               ms.last_chapter_scraped, ms.newly_found_chapters, ms.status
        FROM manga_sources ms
        INNER JOIN mangas m ON ms.manga_id = m.id
        INNER JOIN sites s ON ms.site_id = s.id
    """
    return execute_query(query, fetch="all")

def get_all_mangas_with_details():
    query = """
        SELECT m.id AS manga_id, m.primary_name AS manga_name, s.name AS site_name,
               ms.url_on_site, ms.last_chapter_scraped, ms.newly_found_chapters, ms.status
        FROM mangas m
        LEFT JOIN manga_sources ms ON m.id = ms.manga_id
        LEFT JOIN sites s ON ms.site_id = s.id
    """
    return execute_query(query, fetch="all")

def delete_manga(manga_id: int):
    # A cláusula ON DELETE CASCADE nas chaves estrangeiras cuidará da exclusão em cascata
    execute_query("DELETE FROM mangas WHERE id = %s", (manga_id,))
    return True

def find_manga_in_db(manga_name: str):
    manga_id = get_manga_id_by_alias(manga_name)
    if manga_id:
        return manga_id
    
    result = execute_query("SELECT id FROM mangas WHERE primary_name = %s", (manga_name,), fetch="one")
    return result['id'] if result else None

def create_manga_source_if_not_exists(manga_id: int, site_id: int, url: str, first_chapter: float):
    query = """
        INSERT INTO manga_sources (manga_id, site_id, url_on_site, last_chapter_scraped, newly_found_chapters, status)
        VALUES (%s, %s, %s, %s, %s, 'active')
        ON CONFLICT (manga_id, site_id) DO NOTHING
    """
    params = (manga_id, site_id, url, str(first_chapter), json.dumps([str(first_chapter)]))
    execute_query(query, params)

def delete_site(site_id: int):
    execute_query("DELETE FROM sites WHERE id = %s", (site_id,))

def get_site_last_seen(site_id: int):
    return execute_query("SELECT manga_name, chapter_number FROM site_last_seen WHERE site_id = %s", (site_id,), fetch="one")

def set_site_last_seen(site_id: int, manga_name: str, chapter_number: float):
    query = """
        INSERT INTO site_last_seen (site_id, manga_name, chapter_number)
        VALUES (%s, %s, %s)
        ON CONFLICT(site_id) DO UPDATE SET manga_name = EXCLUDED.manga_name, chapter_number = EXCLUDED.chapter_number
    """
    execute_query(query, (site_id, manga_name, str(chapter_number)))

def get_sites_with_last_seen():
    query = """
        SELECT s.id AS site_id, s.name AS site_name, s.load_more_button_text AS load_more_text,
               s.base_url, sls.manga_name AS last_seen_manga, sls.chapter_number AS last_seen_chapter
        FROM sites s
        LEFT JOIN site_last_seen sls ON s.id = sls.site_id
    """
    return execute_query(query, fetch="all")