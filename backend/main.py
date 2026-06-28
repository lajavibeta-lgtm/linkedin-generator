"""
Servidor FastAPI principal para LinkedIn Generator.
Coordina la generación de posts usando Groq, lectura de Obsidian y generación de imágenes.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from pathlib import Path

from groq import Groq
from claude_generator import GroqGenerator
from obsidian_reader import ObsidianVaultReader
from image_gen import ImageGenerator

# Obtener ruta del proyecto (padre de backend)
PROJECT_ROOT = Path(__file__).parent.parent
os.chdir(PROJECT_ROOT)

# Cargar variables de entorno desde .env
load_dotenv()

# Validar que existan las variables de entorno requeridas
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")
OBSIDIAN_VAULT_PATH = os.getenv("OBSIDIAN_VAULT_PATH")
PORT = int(os.getenv("PORT", 8000))

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY no está configurada en .env")
if not HF_TOKEN:
    raise ValueError("❌ HF_TOKEN no está configurada en .env")
if not OBSIDIAN_VAULT_PATH:
    raise ValueError("❌ OBSIDIAN_VAULT_PATH no está configurada en .env")

# Inicializar FastAPI
app = FastAPI(
    title="LinkedIn Generator API",
    description="API para generar posts de LinkedIn usando Groq y Hugging Face",
    version="1.0.0"
)

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar generadores
groq_generator = GroqGenerator(GROQ_API_KEY)
obsidian_reader = ObsidianVaultReader(OBSIDIAN_VAULT_PATH)
image_generator = ImageGenerator(HF_TOKEN)


# ============================================================================
# MODELOS DE SOLICITUD Y RESPUESTA
# ============================================================================

class PostRequest(BaseModel):
    """Solicitud para generar un post de LinkedIn."""
    topic: str
    context: str = ""
    include_image: bool = False


class ArticleRequest(BaseModel):
    """Solicitud para generar un artículo."""
    title: str
    keywords: list = []
    length: str = "medium"
    include_image: bool = False


class NotesRequest(BaseModel):
    """Solicitud para generar contenido desde notas."""
    note_title: str
    include_image: bool = False


class BatchRequest(BaseModel):
    """Solicitud para generar múltiples posts."""
    topics: list
    include_images: bool = False


class PostResponse(BaseModel):
    """Respuesta con post generado."""
    content: str
    image_url: str = None
    file_path: str = None


# ============================================================================
# RUTAS - POSTS
# ============================================================================

@app.post("/api/generate", response_model=PostResponse)
async def generate_unified(request: PostRequest):
    """
    Genera contenido de LinkedIn (post o artículo) basado en el topic y context.
    Endpoint unificado que determina automáticamente si es post o artículo.

    Args:
        request: PostRequest con topic, context opcional e include_image

    Returns:
        PostResponse con el contenido generado
    """
    try:
        # Generar contenido con Groq
        post_content = groq_generator.generate_post(request.topic, request.context)

        # Generar imagen si se solicita
        image_url = None
        if request.include_image:
            image_url = image_generator.generate_image(request.topic)

        # Guardar post
        filename = f"post_{Path(request.topic).stem}.md"
        file_path = groq_generator.save_to_file(post_content, filename)

        return PostResponse(
            content=post_content,
            image_url=image_url,
            file_path=file_path
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar contenido: {str(e)}")


@app.post("/api/generate-post", response_model=PostResponse)
async def generate_post(request: PostRequest):
    """
    Genera un post de LinkedIn sobre un tema específico.

    Args:
        request: PostRequest con topic y context opcional

    Returns:
        PostResponse con el contenido generado
    """
    try:
        # Generar contenido con Groq
        post_content = groq_generator.generate_post(request.topic, request.context)

        # Generar imagen si se solicita
        image_url = None
        if request.include_image:
            image_url = image_generator.generate_image(request.topic)

        # Guardar post
        filename = f"post_{Path(request.topic).stem}.md"
        file_path = groq_generator.save_to_file(post_content, filename)

        return PostResponse(
            content=post_content,
            image_url=image_url,
            file_path=file_path
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar post: {str(e)}")


@app.post("/api/generate-article", response_model=PostResponse)
async def generate_article(request: ArticleRequest):
    """
    Genera un artículo completo.

    Args:
        request: ArticleRequest con title, keywords y length

    Returns:
        PostResponse con el artículo generado
    """
    try:
        article_content = groq_generator.generate_article(
            request.title,
            request.keywords,
            request.length
        )

        image_url = None
        if request.include_image:
            image_url = image_generator.generate_image(request.title)

        filename = f"article_{Path(request.title).stem}.md"
        file_path = groq_generator.save_to_file(article_content, filename)

        return PostResponse(
            content=article_content,
            image_url=image_url,
            file_path=file_path
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar artículo: {str(e)}")


# ============================================================================
# RUTAS - OBSIDIAN
# ============================================================================

@app.post("/api/generate-from-notes", response_model=PostResponse)
async def generate_from_notes(request: NotesRequest):
    """
    Genera un post a partir de notas de Obsidian.

    Args:
        request: NotesRequest con note_title

    Returns:
        PostResponse con el contenido generado
    """
    try:
        note_content = obsidian_reader.read_note(request.note_title)

        post_content = groq_generator.generate_post(
            topic=request.note_title,
            context=note_content
        )

        image_url = None
        if request.include_image:
            image_url = image_generator.generate_image(request.note_title)

        # Guardar post generado de vuelta en Obsidian
        post_data = {
            "title": f"{request.note_title} - Post",
            "content": post_content,
            "image_url": image_url,
            "source_note": request.note_title
        }
        obsidian_reader.save_generated_post(post_data)

        filename = f"post_from_{Path(request.note_title).stem}.md"
        file_path = groq_generator.save_to_file(post_content, filename)

        return PostResponse(
            content=post_content,
            image_url=image_url,
            file_path=file_path
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar desde notas: {str(e)}")


@app.get("/api/list-notes")
async def list_notes():
    """
    Lista todas las notas disponibles en la bóveda de Obsidian.

    Returns:
        Lista de notas disponibles
    """
    try:
        notes = obsidian_reader.list_notes()
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar notas: {str(e)}")


# ============================================================================
# RUTAS - BATCH
# ============================================================================

@app.post("/api/batch-generate")
async def batch_generate(request: BatchRequest):
    """
    Genera posts para múltiples temas en lote.

    Args:
        request: BatchRequest con lista de topics

    Returns:
        Lista de posts generados
    """
    try:
        results = groq_generator.batch_generate(request.topics)

        if request.include_images:
            for result in results:
                result["image_url"] = image_generator.generate_image(result["topic"])

        return {"results": results, "total": len(results)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en generación en lote: {str(e)}")


# ============================================================================
# RUTAS - SALUD
# ============================================================================

@app.get("/health")
async def health_check():
    """Verifica que el servidor esté funcionando."""
    return {
        "status": "ok",
        "groq_api_configured": bool(GROQ_API_KEY),
        "hf_token_configured": bool(HF_TOKEN),
        "obsidian_vault_configured": bool(OBSIDIAN_VAULT_PATH)
    }


@app.get("/")
async def serve_root():
    """Ruta raíz: servir index.html"""
    return FileResponse(PROJECT_ROOT / "frontend" / "index.html")


# ============================================================================
# ARCHIVOS ESTÁTICOS
# ============================================================================

app.mount("/static", StaticFiles(directory=str(PROJECT_ROOT / "frontend")), name="static")


# ============================================================================
# EJECUCIÓN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Iniciando servidor en http://localhost:{PORT}")
    print(f"📚 Documentación disponible en http://localhost:{PORT}/docs")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
