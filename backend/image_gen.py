"""
Generador de imágenes usando modelos de Hugging Face.
Utiliza FLUX.1 y otras APIs disponibles en Hugging Face.
"""

import requests
from pathlib import Path
from datetime import datetime
import io
from typing import Optional


class ImageGenerator:
    """
    Generador de imágenes usando Hugging Face Inference API.
    Soporta modelos como FLUX.1-dev y FLUX.1-schnell.
    """

    def __init__(self, hf_token: str):
        """
        Inicializa el generador de imágenes.

        Args:
            hf_token: Token de autenticación de Hugging Face (comienza con "hf_")
        """
        self.hf_token = hf_token
        self.api_url = "https://api-inference.huggingface.co"
        self.headers = {"Authorization": f"Bearer {hf_token}"}

        # Modelos disponibles
        self.models = {
            "flux-dev": "black-forest-labs/FLUX.1-dev",
            "flux-schnell": "black-forest-labs/FLUX.1-schnell",
            "flux-pro": "black-forest-labs/FLUX.1-pro",  # Requiere acceso especial
            "stable-diffusion-3": "stabilityai/stable-diffusion-3-medium",
        }

        self.default_model = "flux-schnell"  # Más rápido que dev
        self.output_dir = Path("generated_images")
        self.output_dir.mkdir(exist_ok=True)

    def generate_image(self, prompt: str, model: str = None, negative_prompt: str = "") -> Optional[str]:
        """
        Genera una imagen a partir de un prompt.

        Args:
            prompt: Descripción de la imagen a generar
            model: Modelo a usar (default: flux-schnell)
            negative_prompt: Elementos a evitar en la imagen

        Returns:
            URL o ruta local de la imagen generada, o None si falla
        """
        if model is None:
            model = self.default_model

        if model not in self.models:
            raise ValueError(f"Modelo no soportado: {model}. Disponibles: {list(self.models.keys())}")

        model_id = self.models[model]

        # Preparar prompt mejorado para mejor calidad
        enhanced_prompt = self._enhance_prompt(prompt)

        try:
            image_data = self._query_hf_api(
                model_id,
                enhanced_prompt,
                negative_prompt
            )

            if image_data:
                return self._save_image(image_data, prompt)

            return None

        except Exception as e:
            print(f"❌ Error generando imagen: {str(e)}")
            return None

    def generate_image_for_post(self, post_content: str, style: str = "professional") -> Optional[str]:
        """
        Genera una imagen contextualizada para un post de LinkedIn.

        Args:
            post_content: Contenido del post
            style: Estilo de imagen ('professional', 'creative', 'infographic')

        Returns:
            Ruta de la imagen generada o None si falla
        """
        # Extraer keyword principal del contenido
        words = post_content.split()[:50]  # Primeras 50 palabras
        main_topic = " ".join(words).split("\n")[0][:100]

        # Crear prompt según el estilo
        style_prompts = {
            "professional": "Professional business illustration, corporate, modern design, clean aesthetic",
            "creative": "Creative modern art, vibrant colors, artistic design, unique illustration",
            "infographic": "Infographic style, data visualization, charts, modern graphics"
        }

        style_prompt = style_prompts.get(style, style_prompts["professional"])
        prompt = f"{main_topic}, {style_prompt}, high quality, 4K"

        return self.generate_image(prompt, model="flux-schnell")

    def batch_generate_images(self, prompts: list, model: str = None) -> list:
        """
        Genera múltiples imágenes en lote.

        Args:
            prompts: Lista de prompts
            model: Modelo a usar

        Returns:
            Lista de rutas de imágenes generadas
        """
        results = []
        for prompt in prompts:
            image_path = self.generate_image(prompt, model)
            results.append({
                "prompt": prompt,
                "image_path": image_path,
                "success": image_path is not None
            })
        return results

    def _query_hf_api(self, model_id: str, prompt: str, negative_prompt: str = "") -> Optional[bytes]:
        """
        Realiza la llamada a la API de Hugging Face.

        Args:
            model_id: ID del modelo en Hugging Face
            prompt: Prompt para generar la imagen
            negative_prompt: Elementos a evitar

        Returns:
            Bytes de la imagen o None si falla
        """
        url = f"{self.api_url}/models/{model_id}"

        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "height": 768,
                "width": 1024,
                "num_inference_steps": 30,
                "guidance_scale": 7.5
            }
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                return response.content

            # Manejo de errores específicos
            if response.status_code == 503:
                print("⏳ El modelo está cargando, intenta de nuevo en unos segundos...")
            elif response.status_code == 401:
                print("❌ Token de Hugging Face inválido o expirado")
            else:
                print(f"❌ Error de API: {response.status_code} - {response.text}")

            return None

        except requests.Timeout:
            print("⏱️  La solicitud tardó demasiado. Intenta con un modelo más rápido.")
            return None
        except Exception as e:
            print(f"❌ Error en la solicitud: {str(e)}")
            return None

    def _enhance_prompt(self, prompt: str) -> str:
        """
        Mejora el prompt para obtener resultados de mejor calidad.

        Args:
            prompt: Prompt original

        Returns:
            Prompt mejorado con indicaciones de calidad
        """
        quality_indicators = ", professional, high quality, 4K, detailed, polished, modern aesthetic"

        if len(prompt) < 50:
            return prompt + quality_indicators

        return prompt + quality_indicators

    def _save_image(self, image_data: bytes, prompt: str) -> str:
        """
        Guarda la imagen generada localmente.

        Args:
            image_data: Datos binarios de la imagen
            prompt: Prompt usado para generar la imagen

        Returns:
            Ruta del archivo guardado
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        sanitized_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c in " -_")
        filename = f"image_{sanitized_prompt}_{timestamp}.png"

        file_path = self.output_dir / filename

        with open(file_path, 'wb') as f:
            f.write(image_data)

        print(f"✅ Imagen guardada: {file_path}")
        return str(file_path)

    def list_available_models(self) -> dict:
        """
        Lista los modelos disponibles.

        Returns:
            Diccionario con modelos y sus IDs
        """
        return self.models

    def set_default_model(self, model: str):
        """
        Establece el modelo por defecto.

        Args:
            model: Nombre del modelo

        Raises:
            ValueError: Si el modelo no existe
        """
        if model not in self.models:
            raise ValueError(f"Modelo no disponible: {model}")

        self.default_model = model
        print(f"✅ Modelo por defecto establecido: {model}")

    def test_connection(self) -> bool:
        """
        Prueba la conexión con la API de Hugging Face.

        Returns:
            True si la conexión es exitosa, False en caso contrario
        """
        try:
            # Probar con un modelo rápido
            model_id = self.models["flux-schnell"]
            url = f"{self.api_url}/models/{model_id}"

            response = requests.head(url, headers=self.headers, timeout=10)

            if response.status_code in [200, 404]:  # 404 es OK, significa que el modelo existe
                print("✅ Conexión con Hugging Face API exitosa")
                return True
            else:
                print(f"❌ Error de conexión: {response.status_code}")
                return False

        except Exception as e:
            print(f"❌ Error probando conexión: {str(e)}")
            return False
