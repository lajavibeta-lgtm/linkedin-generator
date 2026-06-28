"""
Lector y escritor de notas en bóveda de Obsidian.
Permite leer notas existentes y guardar posts generados.
"""

from pathlib import Path
from datetime import datetime
import json
from typing import List, Dict


class ObsidianVaultReader:
    """
    Interfaz para leer y escribir notas en una bóveda de Obsidian.

    Soporta:
    - Lectura de archivos .md
    - Búsqueda de notas
    - Guardado de posts generados con metadatos
    """

    def __init__(self, vault_path: str):
        """
        Inicializa el lector de Obsidian.

        Args:
            vault_path: Ruta absoluta a la bóveda de Obsidian

        Raises:
            FileNotFoundError: Si la bóveda no existe
        """
        self.vault_path = Path(vault_path)

        if not self.vault_path.exists():
            raise FileNotFoundError(f"La bóveda de Obsidian no existe: {vault_path}")

        if not self.vault_path.is_dir():
            raise NotADirectoryError(f"La ruta debe ser un directorio: {vault_path}")

        # Directorio para guardar posts generados
        self.generated_dir = self.vault_path / "Generated"
        self.generated_dir.mkdir(exist_ok=True)

    def list_notes(self, folder: str = "") -> List[str]:
        """
        Lista todas las notas .md disponibles en la bóveda.

        Args:
            folder: Carpeta específica dentro de la bóveda (opcional)

        Returns:
            Lista de nombres de notas (sin extensión .md)
        """
        if folder:
            search_path = self.vault_path / folder
        else:
            search_path = self.vault_path

        notes = []
        for md_file in search_path.rglob("*.md"):
            # Ignorar archivos en .obsidian y carpetas de sistema
            if ".obsidian" not in md_file.parts:
                relative_path = md_file.relative_to(self.vault_path)
                note_name = str(relative_path.with_suffix(""))
                notes.append(note_name)

        return sorted(notes)

    def read_note(self, note_title: str) -> str:
        """
        Lee el contenido de una nota de la bóveda.

        Args:
            note_title: Nombre de la nota (sin .md)

        Returns:
            Contenido de la nota

        Raises:
            FileNotFoundError: Si la nota no existe
        """
        note_path = self.vault_path / f"{note_title}.md"

        if not note_path.exists():
            raise FileNotFoundError(f"Nota no encontrada: {note_title}")

        with open(note_path, 'r', encoding='utf-8') as f:
            return f.read()

    def save_generated_post(self, post_data: Dict) -> str:
        """
        Guarda un post generado en la carpeta "Generated" de la bóveda.

        Estructura del archivo:
        ---
        title: Título del post
        date: YYYY-MM-DD HH:MM:SS
        source_note: Nota de origen
        image_url: URL de la imagen (si aplica)
        ---

        Contenido del post...

        Args:
            post_data: Diccionario con:
                - title: Título del post
                - content: Contenido generado
                - source_note: Nota de donde se generó (opcional)
                - image_url: URL de imagen generada (opcional)

        Returns:
            Ruta del archivo guardado
        """
        # Generar nombre de archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        sanitized_title = "".join(c for c in post_data.get("title", "post") if c.isalnum() or c in " -_")
        filename = f"{sanitized_title}_{timestamp}.md"

        file_path = self.generated_dir / filename

        # Preparar frontmatter (metadatos YAML)
        frontmatter = f"""---
title: {post_data.get('title', 'Generated Post')}
date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
source_note: {post_data.get('source_note', 'Unknown')}"""

        if post_data.get('image_url'):
            frontmatter += f"\nimage_url: {post_data['image_url']}"

        frontmatter += "\n---\n\n"

        # Guardar archivo
        content = frontmatter + post_data.get('content', '')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(file_path)

    def search_notes(self, query: str) -> List[str]:
        """
        Busca notas que contengan un texto específico.

        Args:
            query: Texto a buscar

        Returns:
            Lista de notas que coinciden
        """
        matching_notes = []

        for note_path in self.vault_path.rglob("*.md"):
            if ".obsidian" in note_path.parts:
                continue

            try:
                with open(note_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if query.lower() in content.lower():
                        relative_path = note_path.relative_to(self.vault_path)
                        matching_notes.append(str(relative_path.with_suffix("")))
            except Exception:
                continue

        return sorted(matching_notes)

    def get_note_metadata(self, note_title: str) -> Dict:
        """
        Extrae metadatos YAML de una nota.

        Args:
            note_title: Nombre de la nota

        Returns:
            Diccionario con metadatos o None si no existen
        """
        try:
            content = self.read_note(note_title)

            if not content.startswith("---"):
                return {}

            # Buscar el segundo ---
            lines = content.split("\n")
            end_line = None
            for i in range(1, len(lines)):
                if lines[i].strip() == "---":
                    end_line = i
                    break

            if end_line is None:
                return {}

            # Parsear YAML simple
            metadata = {}
            for line in lines[1:end_line]:
                if ":" in line:
                    key, value = line.split(":", 1)
                    metadata[key.strip()] = value.strip()

            return metadata

        except Exception:
            return {}

    def get_vault_stats(self) -> Dict:
        """
        Obtiene estadísticas de la bóveda.

        Returns:
            Diccionario con estadísticas
        """
        all_notes = self.list_notes()
        generated_notes = list(self.generated_dir.glob("*.md"))

        return {
            "total_notes": len(all_notes),
            "generated_posts": len(generated_notes),
            "vault_path": str(self.vault_path),
            "generated_path": str(self.generated_dir)
        }
