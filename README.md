# 🚀 LinkedIn Content Generator

> Generador inteligente de posts y artículos de LinkedIn con IA.
> Crea contenido profesional, humano y auténtico con un clic usando Groq & Hugging Face.

![Status](https://img.shields.io/badge/status-active-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Vercel](https://img.shields.io/badge/deployed-vercel-black)
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

⚡ **Serverless & Escalable**
- Desplegado en Vercel
- Sin servidor que mantener
- Deploy automático en cada push

💻 **Frontend Moderno**
- Interfaz responsiva y limpia
- Cero dependencias frontend
- Rápida y fluida

## 🆓 Costo Total

| Servicio | Costo | Notas |
|----------|-------|-------|
| Groq API | **GRATIS** | Sin tarjeta de crédito |
| Hugging Face | **GRATIS** | Con rate limiting generoso |
| Vercel | **GRATIS** | Hasta 100 invocaciones/mes |
| **TOTAL** | **$0** | ✅ 100% Gratis |

---

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Groq (gratis)
- Token de Hugging Face (gratis)
- Vercel CLI (opcional para dev local)

## 🚀 Deployment en Vercel

### 1️⃣ Fork o clonar el repo

```bash
git clone https://github.com/tu-usuario/linkedin-generator.git
cd linkedin-generator
```

### 2️⃣ Conectar a Vercel

```bash
npm install -g vercel
vercel
```

### 3️⃣ Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings → Environment Variables y añade:

```
GROQ_API_KEY=gsk_Tu_Key_Aqui
HF_TOKEN=hf_Tu_Token_Aqui
```

### 4️⃣ Deploy automático

```bash
git push origin main
```

¡Listo! Vercel deployará automáticamente en cada push.

---

## 🔑 Obtener API Keys (GRATIS)

### 🔑 Groq API Key

1. Ve a https://console.groq.com/
2. Haz clic en "Sign In" → "Sign Up"
3. Completa registro con tu email
4. En el menú izquierdo, ve a **"API Keys"**
5. Haz clic en **"Create API Key"**
6. Copia el key (comienza con `gsk_`)

**⏱️ Tiempo: 2 minutos**

### 🎨 Hugging Face Token

1. Ve a https://huggingface.co/
2. Crea tu cuenta si no tienes
3. Ve a https://huggingface.co/settings/tokens
4. Haz clic en **"New token"**
5. Nombre: `linkedin-generator`
6. Tipo: **"Read"**
7. Copia el token (comienza con `hf_`)

**⏱️ Tiempo: 2 minutos**

---

## 💻 Desarrollo Local

### Setup

```bash
# Instalar dependencias
npm install

# Variables de entorno (.env.local)
echo "GROQ_API_KEY=gsk_..." > .env.local
echo "HF_TOKEN=hf_..." >> .env.local

# Ejecutar en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Estructura del Proyecto

```
linkedin-generator/
├── api/
│   └── generate.js          # Serverless function (Groq + Hugging Face)
├── frontend/
│   └── index.html           # Interfaz web
├── vercel.json              # Configuración de Vercel
├── package.json             # Dependencias
├── .env.local               # Variables de entorno (desarrollo)
└── .gitignore
```

---

## 💡 Cómo Usar

### Generar un Post

1. Abre la aplicación
2. Ingresa un tema (ej: "Marketing Digital")
3. Selecciona **"Post"** como tipo de contenido
4. Marca "Generar imagen" si deseas
5. Haz clic en **"✨ Generar Contenido"**
6. Espera 10-30 segundos
7. Copia el contenido

### Generar un Artículo

1. Ingresa el tema
2. Selecciona **"Artículo"** como tipo
3. Marca "Generar imagen"
4. Haz clic en generar
5. Espera 30-60 segundos (es más largo)
6. Copia o comparte

---

## 🔧 Configuración Avanzada

### Personalizar prompts

Edita `api/generate.js` línea 42 para cambiar el prompt de generación:

```javascript
content: `Genera un ${isArticle ? 'artículo' : 'post'} sobre: ${topic}`
```

### Cambiar modelos

- **Groq**: Otros modelos disponibles: `llama-2-70b-chat`, `llama-2-7b-chat`
- **Hugging Face**: Otros modelos: `stabilityai/stable-diffusion-2`

---

## 📊 Monitoreo

En Vercel dashboard puedes ver:
- Invocaciones por día
- Tiempo de respuesta
- Errores en logs
- Tráfico

---

## 🐛 Troubleshooting

### Error: "Missing API keys"
- Verifica que GROQ_API_KEY y HF_TOKEN estén configurados en Vercel

### Error: "Groq API error"
- Comprueba que tu API key de Groq sea válida
- Verifica tu límite de rate en Groq console

### Error: "Image generation failed"
- Hugging Face tiene límites de rate. Espera unos minutos e intenta de nuevo
- O marca "Generar imagen" como desmarcado

---

## 📜 Licencia

MIT - Siéntete libre de usar, modificar y distribuir este proyecto

## 🙏 Créditos

- **Groq API** - Inferencia rápida de IA
- **Hugging Face** - Modelos de generación de imágenes
- **Vercel** - Hosting serverless
