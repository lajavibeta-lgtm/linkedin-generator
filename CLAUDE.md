# LinkedIn Content Generator

Generador de posts y artículos de LinkedIn con IA. Desplegado en Vercel (serverless).

## Stack

- **LLM**: Groq API — modelo `llama-3.3-70b-versatile`
- **Imágenes**: Pollinations.ai (FLUX, fetch server-side para evitar bloqueos)
- **Backend**: Vercel Serverless Function (`api/generate.js`)
- **Frontend**: HTML/JS puro (`frontend/index.html`), sin frameworks
- **Deploy**: Vercel, auto-deploy en cada push a `main`

## Estructura

```
api/generate.js        # Serverless function: SYSTEM_PROMPT + Groq + imagen
frontend/index.html    # UI
vercel.json            # Rutas y config de Vercel
.env.local             # GROQ_API_KEY (desarrollo local)
```

## Dev local

```bash
npm install
# Crear .env.local con GROQ_API_KEY=gsk_...
npm run dev            # http://localhost:3000
```

## Variables de entorno (Vercel)

- `GROQ_API_KEY` — requerida

## Modos de generación

`api/generate.js` acepta `context`: `post` | `articulo` | `hook` | `revisar`

## Obtener API Keys

### Groq API Key
1. Ir a https://console.groq.com/
2. Sign Up con email
3. En el menú, ir a **API Keys** → **Create API Key**
4. Copiar el key (empieza con `gsk_`)

## Notas de arquitectura

- Generación de texto e imagen corren en paralelo (`Promise.all`) para evitar timeout de Vercel (10s)
- La imagen se descarga server-side y se devuelve como base64 para evitar bloqueos CORS/mixed-content
- `parseCoachResponse()` extrae el cuerpo del post y la nota del coach del output del LLM

## Troubleshooting

- **Missing API keys**: verificar `GROQ_API_KEY` en Vercel → Settings → Environment Variables
- **Groq API error**: revisar validez del key y rate limit en consola de Groq
- **Imagen no aparece**: Pollinations puede tener rate limiting; deshabilitar imagen y reintentar

## Monitoreo

Vercel dashboard → Functions → logs en tiempo real para errores de serverless.

---

# linkedin-coach
- **linkedin-coach** (`~/.claude/skills/linkedin-coach/SKILL.md`) - Director de Contenido + Coach + Copywriter experto en LinkedIn. Trigger: `/linkedin-coach`
When the user types `/linkedin-coach`, invoke the Skill tool with `skill: "linkedin-coach"` before doing anything else.
