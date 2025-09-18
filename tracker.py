# tracker.py
import cloudscraper
import re
import asyncio
from bs4 import BeautifulSoup
from database import (
    get_sites_details,
    get_manga_by_name_and_site_id,
    update_source_status,
    find_manga_in_db, create_manga_source_if_not_exists,
)


async def scrape_site_updates():
    sites_to_scrape = get_sites_details()
    if not sites_to_scrape:
        print("Nenhum site encontrado para rastrear.")
        return

    for site in sites_to_scrape:
        print(f"Iniciando rastreamento para o site: {site['name']}...")
        site_updates_url = f"{site['base_url']}{site['latest_updates_url']}"
        page_limit = 5
        current_page = 1

        while current_page <= page_limit:
            try:
                page_url = f"{site_updates_url}/{current_page}"

                scraper = cloudscraper.create_scraper()
                response = scraper.get(page_url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")

                manga_cards = soup.select(site["manga_card_selector"])
                if not manga_cards:
                    print(f"Não foram encontrados cards de mangá na página {current_page}. Parando...")
                    break

                for card in manga_cards:
                    title_element = card.select_one(site["title_selector"])
                    chapter_element = card.select_one(site["chapter_selector"])
                    url_element = card.select_one("a")

                    if not title_element or not chapter_element or not url_element:
                        continue

                    manga_name_scraped = title_element.get_text(strip=True)
                    chapter_text = chapter_element.get_text(strip=True)
                    chapter_match = re.search(r"(\d+\.?\d*)", chapter_text)

                    if not chapter_match:
                        continue

                    try:
                        scraped_chapter_number = float(chapter_match.group(1))
                    except (ValueError, IndexError):
                        continue

                    # tenta achar o mangá no banco (nome ou alias)
                    manga_id = find_manga_in_db(manga_name_scraped)
                    if not manga_id:
                        continue  # mangá não cadastrado, ignora

                    full_url = f"{site['base_url']}{url_element['href']}"
                    source_in_db = get_manga_by_name_and_site_id(manga_name_scraped, site["id"])

                    if not source_in_db:
                        # ainda não tem vínculo, cria
                        create_manga_source_if_not_exists(manga_id, site["id"], full_url, scraped_chapter_number)
                        print(f"Mangá '{manga_name_scraped}' encontrado pela primeira vez no site {site['name']}!")

                    else:
                        # já existe, atualiza se tiver capítulo novo
                        if scraped_chapter_number > source_in_db["last_chapter_scraped"]:
                            last_saved = source_in_db["last_chapter_scraped"]
                            scraped = scraped_chapter_number

                            # gera apenas os capítulos inteiros entre o próximo inteiro após last_saved e o inteiro do scraped
                            start = int(last_saved) + 1
                            end = int(scraped) + 1  # +1 para incluir o último capítulo inteiro
                            newly_found = [str(ch) for ch in range(start, end)]

                            update_source_status(
                                source_in_db["id"],
                                full_url,
                                scraped_chapter_number,
                                newly_found,
                            )

                            print(f"Novos capítulos encontrados para {manga_name_scraped}: {newly_found}")

                print(f"Página {current_page} rastreada com sucesso.")
                current_page += 1
                await asyncio.sleep(2)

            except Exception as exc:
                print(f"Erro ao raspar a página {current_page} do site {site['name']}: {exc}")
                break

        print(f"Rastreamento para o site {site['name']} concluído.")
