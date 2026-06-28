# 🚀 LinkedIn Content Generator

> Generador inteligente de posts y artículos de LinkedIn alimentado por tu Obsidian Vault.
> Crea contenido personalizado, humano y auténtico con un clic.

![Status](https://img.shields.io/badge/status-active-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Cost](https://img.shields.io/badge/cost-FREE-brightgreen)

## ⚡ Características

✨ **Generación de Contenido**
- Posts de LinkedIn cortos y enganchantes
- Artículos largos (2000+ palabras)
- Lenguaje conversacional y personal
- Sin jerga corporativa cliché

🖼️ **Generación de Imágenes**
- Imágenes automáticas para cada post
- Modelo FLUX.1 de Hugging Face
- Optimizadas para LinkedIn

🧠 **Inteligencia Contextual**
- Lee automáticamente tu Obsidian Vault
- Usa tus notas como contexto
- Genera contenido coherente con tu voz

💾 **Gestión Automática**
- Guarda borradores en tu Vault
- Historial de generaciones
- Copia al portapapeles con un clic

📱 **Interfaz Web Moderna**
- Diseño responsivo y limpio
- Cero dependencias frontend
- Rápida y fluida

## 🆓 Costo Total

| Servicio | Costo | Notas |
|----------|-------|-------|
| Groq API | **GRATIS** | Sin tarjeta de crédito |
| Hugging Face | **GRATIS** | Con rate limiting generoso |
| Obsidian | Depende | Si no lo tienes, es gratis versión básica |
| **TOTAL** | **$0** | ✅ 100% Gratis |

---

## 📋 Requisitos Previos

- Python 3.8 o superior
- Obsidian instalado con un Vault creado
- Conexión a internet
- ~500MB de espacio en disco

## 🚀 Setup en 5 Minutos

### 1️⃣ Clonar o descargar el proyecto

```bash
cd linkedin-generator
```

### 2️⃣ Crear ambiente virtual (recomendado)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4️⃣ Obtener API Keys (GRATIS)

#### 🔑 Groq API Key

1. Ve a https://console.groq.com/
2. Haz clic en "Sign In" → "Sign Up"
3. Completa registro con tu email
4. En el menú izquierdo, ve a **"API Keys"**
5. Haz clic en **"Create API Key"**
6. Copia el key (comienza con `gsk_`)

**⏱️ Tiempo: 2 minutos**

#### 🎨 Hugging Face Token

1. Ve a https://huggingface.co/
2. Crea tu cuenta si no tienes
3. Ve a https://huggingface.co/settings/tokens
4. Haz clic en **"New token"**
5. Nombre: `linkedin-generator`
6. Tipo: **"Read"**
7. Copia el token (comienza con `hf_`)

**⏱️ Tiempo: 2 minutos**

### 5️⃣ Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Abre `.env` y rellena con tus valores:

```env
GROQ_API_KEY=gsk_Tu_Key_Aqui
HF_TOKEN=hf_Tu_Token_Aqui
OBSIDIAN_VAULT_PATH=/ruta/a/tu/Obsidian/Vault
PORT=8000
```
**Ejemplos de rutas:**
Mac: /Users/javiera.betancourt/Library/CloudStorage/OneDrive-insidemedia.net/Documents/Obsidian/linkedin-generator

### 6️⃣ Ejecutar el servidor

```bash
python backend/main.py
```

Deberías ver:http://0.0.0.0:8000/

### 7️⃣ Abrir en navegador

## 💡 Cómo Usar

¡Listo! 🎉

---

### Generar un Post

1. En la interfaz, ingresa un tema (ej: "Marketing Digital")
2. Selecciona **"Post"** como tipo de contenido
3. Marca "Generar imagen" si deseas
4. Haz clic en **"✨ Generar Contenido"**
5. Espera 10-30 segundos
6. Copia el contenido o guarda en Obsidian

### Generar un Artículo

1. Ingresa el tema
2. Selecciona **"Artículo"** como tipo
3. Marca "Generar imagen"
4. Haz clic en generar
5. Espera 30-60 segundos (es más largo)
6. Copia o guarda

### Guardar en Obsidian

Tus generaciones se guardan automáticamente en la carpeta: