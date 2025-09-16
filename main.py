# main.py

from fastapi import FastAPI, HTTPException
from tracker import find_new_chapters
from database import setup_db, get_manga_details, add_manga, get_all_manga_details, delete_manga
from pydantic import BaseModel


class MangaItem(BaseModel):
    name: str
    url: str
    selector: str


app = FastAPI()

setup_db()


@app.get("/track-manga/{manga_name}")
async def track_manga(manga_name: str):
    """Endpoint para buscar novos capítulos de um mangá específico por nome."""
    manga_details = get_manga_details(manga_name)

    if not manga_details:
        raise HTTPException(status_code=404, detail="Mangá não encontrado na lista.")

    result = await find_new_chapters(
        manga_name,
        manga_details['url'],
        manga_details['selector'],
        manga_details['last_chapter']
    )

    if result["status"] == "error":
        return {"message": result["message"]}

    if result["chapters"]:
        return {"message": "Novos capítulos encontrados!", "manga": manga_name, "chapters": result["chapters"]}
    else:
        return {"message": "Nenhum novo capítulo encontrado.", "manga": manga_name}


@app.post("/add-manga")
async def add_new_manga(manga: MangaItem):
    """Endpoint para adicionar um novo mangá à lista."""
    added = add_manga(manga.name, manga.url, manga.selector)
    if added:
        return {"message": f"Mangá '{manga.name}' adicionado com sucesso."}
    else:
        raise HTTPException(status_code=400, detail="Mangá já existe.")


@app.get("/track-all-mangas")
async def track_all_mangas():
    """
    ENDPOINT DE TRIGGER MANUAL.
    Dispara a busca por novos links para todos os mangás na lista.
    """
    mangas_to_track = get_all_manga_details()
    if not mangas_to_track:
        return {"message": "Nenhum mangá encontrado para rastrear."}

    results = {}
    for manga in mangas_to_track:
        result = await find_new_chapters(
            manga['name'],
            manga['url'],
            manga['selector'],
            manga['last_chapter']
        )
        results[manga['name']] = result

    return {"message": "Rastreamento de todos os mangás concluído.", "results": results}


@app.get("/manga-list")
async def get_list():
    """Endpoint para listar todos os mangás rastreados."""
    manga_list = get_all_manga_details()
    return {"mangas": manga_list}


@app.delete("/delete-manga/{manga_name}")
async def delete_manga_by_name(manga_name: str):
    """Endpoint para excluir um mangá da lista pelo nome."""
    deleted = delete_manga(manga_name)
    if deleted:
        return {"message": f"Mangá '{manga_name}' excluído com sucesso."}
    else:
        raise HTTPException(status_code=404, detail=f"Mangá '{manga_name}' não encontrado na lista.")
