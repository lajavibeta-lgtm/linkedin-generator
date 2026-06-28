from groq import Groq
from pathlib import Path
import json


class GroqGenerator:
    """Generador de contenido usando Groq API (modelo Mixtral 8x7B Instruct)."""

    def __init__(self, api_key: str):
        """
        Inicializa el generador con la clave de API de Groq.

        Args:
            api_key: Clave de API de Groq (obtenerla de https://console.groq.com)
        """
        self.client = Groq(api_key=api_key)
        self.model = "mixtral-8x7b-32768"
        self.max_tokens = 1500

    def generate_post(self, topic: str, context: str = "") -> str:
        """
        Genera un post de LinkedIn sobre un tema específico.

        Args:
            topic: Tema o idea principal para el post
            context: Contexto adicional o instrucciones específicas

        Returns:
            Post de LinkedIn generado
        """
        prompt = f"""Crea un post de LinkedIn profesional y atractivo sobre el siguiente tema:

Tema: {topic}
{f'Contexto adicional: {context}' if context else ''}

Requisitos:
- Debe ser inspirador y relevante para profesionales
- Máximo 2-3 párrafos
- Incluye un CTA (llamada a la acción) al final
- Tono conversacional pero profesional"""

        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content

    def generate_article(self, title: str, keywords: list = None, length: str = "medium") -> str:
        """
        Genera un artículo completo sobre un tema.

        Args:
            title: Título del artículo
            keywords: Lista de palabras clave a incluir
            length: Longitud deseada ('short', 'medium', 'long')

        Returns:
            Artículo generado
        """
        keywords_str = ""
        if keywords:
            keywords_str = f"Palabras clave a incluir: {', '.join(keywords)}\n"

        length_guidance = {
            "short": "aproximadamente 300-400 palabras",
            "medium": "aproximadamente 600-800 palabras",
            "long": "aproximadamente 1200-1500 palabras"
        }

        prompt = f"""Escribe un artículo profesional con el siguiente título:

Título: {title}
{keywords_str}
Extensión: {length_guidance.get(length, length_guidance['medium'])}

Estructura sugerida:
1. Introducción atractiva
2. Desarrollo con puntos clave
3. Conclusión con reflexión

Asegúrate de que sea informativo, bien estructurado y fácil de leer."""

        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content

    def generate_from_notes(self, notes_path: str) -> str:
        """
        Genera contenido a partir de notas de Obsidian.

        Args:
            notes_path: Ruta al archivo de notas

        Returns:
            Contenido generado basado en las notas
        """
        notes_file = Path(notes_path)

        if not notes_file.exists():
            raise FileNotFoundError(f"Archivo de notas no encontrado: {notes_path}")

        with open(notes_file, 'r', encoding='utf-8') as f:
            notes_content = f.read()

        prompt = f"""Basándote en las siguientes notas, genera un post de LinkedIn coherente y profesional:

Notas:
{notes_content}

Crea un post que:
- Sintetice las ideas principales
- Sea atractivo para profesionales
- Tenga un CTA al final
- Incluya hashtags relevantes"""

        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content

    def batch_generate(self, topics: list) -> list:
        """
        Genera posts para múltiples temas.

        Args:
            topics: Lista de temas

        Returns:
            Lista de posts generados
        """
        results = []
        for topic in topics:
            post = self.generate_post(topic)
            results.append({
                "topic": topic,
                "post": post
            })
        return results

    def save_to_file(self, content: str, filename: str, directory: str = "generated_posts"):
        """
        Guarda el contenido generado en un archivo.

        Args:
            content: Contenido a guardar
            filename: Nombre del archivo
            directory: Directorio donde guardar (default: generated_posts)
        """
        output_dir = Path(directory)
        output_dir.mkdir(exist_ok=True)

        file_path = output_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(file_path)
