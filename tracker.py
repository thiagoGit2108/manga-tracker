# tracker.py

import cloudscraper
import re
from bs4 import BeautifulSoup
from database import update_last_chapter


async def find_new_chapters(manga_name: str, url: str, selector: str, last_chapter: float):
    """
    Busca o capítulo mais recente em uma URL usando cloudscraper para contornar proteções.
    """
    try:
        # Usa o cloudscraper para fazer a requisição de forma segura
        scraper = cloudscraper.create_scraper(
            browser={
                "browser": "chrome",
                "platform": "windows",
                "mobile": False
            }
        )

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/118.0.5993.118 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
        response = scraper.get(url, headers=headers, allow_redirects=True)
        response.raise_for_status()
    except Exception as exc:
        print(f"Ocorreu um erro ao buscar {url!r}: {exc}")
        return {"status": "error", "message": f"Não foi possível acessar a URL: {url}. O site pode estar offline."}

    soup = BeautifulSoup(response.text, 'html.parser')

    # Encontra todos os elementos que correspondem ao seletor.
    chapter_elements = soup.select(selector)

    # Regex para extrair números (inteiros ou decimais).
    chapter_regex = re.compile(r'(\d+\.?\d*)')

    newly_found_chapters = []

    for element in chapter_elements:
        match = chapter_regex.search(element.text)
        if match:
            try:
                # Tenta converter o número para float.
                chapter_number = float(match.group(1))
                if chapter_number > last_chapter:
                    newly_found_chapters.append(chapter_number)
            except (ValueError, IndexError):
                # Ignora se não conseguir extrair o número.
                continue

    # Se novos capítulos foram encontrados, ordena e atualiza o banco de dados.
    if newly_found_chapters:
        new_last_chapter = max(newly_found_chapters)
        update_last_chapter(manga_name, new_last_chapter)
        return {"status": "success", "chapters": newly_found_chapters}

    return {"status": "success", "chapters": []}