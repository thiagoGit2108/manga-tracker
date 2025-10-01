import asyncio
import sys
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_sites_with_last_seen, setup_db, get_manga_details_for_list, delete_manga, add_site, add_manga, get_site_id_by_url, delete_site, get_all_mangas_with_details
from tracker import scrape_site_updates

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


class SiteItem(BaseModel):
    name: str
    base_url: str
    latest_updates_url: str
    manga_card_selector: str
    title_selector: str
    chapter_selector: str
    navigation_mode: str = "pagination"  # 'pagination' ou 'load_more'
    load_more_button_text: str = None


class MangaItem(BaseModel):
    manga_name: str
    aliases: list = []


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_db()


@app.post("/add-site")
async def add_new_site(site: SiteItem):
    site_details = site.dict()
    added = add_site(site_details)
    if added:
        return {"message": f"Site '{site.name}' adicionado com sucesso."}
    else:
        raise HTTPException(status_code=400, detail="Site já existe.")


@app.post("/add-manga")
async def add_new_manga(manga: MangaItem):
    added = add_manga(manga.manga_name, manga.aliases)
    if added:
        return {"message": f"Mangá '{manga.manga_name}' adicionado com sucesso. Ele será rastreado assim que aparecer em algum site."}
    else:
        raise HTTPException(status_code=400, detail="Mangá já existe.")


@app.get("/track-updates")
async def track_updates():
    await scrape_site_updates()
    return {"message": "Rastreamento de atualizações concluído."}


@app.get("/manga-list")
async def get_list():
    manga_list = get_manga_details_for_list()
    return {"mangas": manga_list}


@app.get("/all-mangas")
async def get_all_mangas():
    manga_list = get_all_mangas_with_details()
    return {"mangas": manga_list}


@app.delete("/delete-manga/{manga_id}")
async def delete_manga_by_id(manga_id: int):
    deleted = delete_manga(manga_id)
    if deleted:
        return {"message": f"Mangá com ID '{manga_id}' excluído com sucesso."}
    else:
        raise HTTPException(status_code=404, detail=f"Mangá com ID '{manga_id}' não encontrado.")


@app.delete("/remove-site/{site_id}")
def remove_site(site_id: int):
    try:
        delete_site(site_id)
        return {"message": f"Site {site_id} deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/sites-with-last-seen")
def get_sites_and_last_seen():
    try:
        sites_data = get_sites_with_last_seen()
        return {"sites": sites_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)