# Deployment a Vercel - LinkedIn Generator

## Estructura Compatible ✅

Tu proyecto ahora está optimizado para funcionar en Vercel con funciones serverless Node.js:

```
linkedin-generator/
├── api/
│   └── generate.js          ← Handler principal para /api/generate
├── frontend/
│   └── index.html           ← Frontend estático
├── package.json             ← Dependencias Node.js
├── vercel.json              ← Configuración de Vercel
├── .env                     ← Variables de entorno (NO commitear)
└── backend/                 ← (Opcional: código Python local)
```

## Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Asegúrate de que el proyecto esté en un repositorio Git
git init

# Commitear los cambios
git add .
git commit -m "Preparar para Vercel: agregar api/generate.js y configuración"
```

### 2. Conectar con Vercel

**Opción A: CLI de Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

**Opción B: GitHub**
1. Push a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio GitHub
4. Vercel detectará automáticamente la configuración

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel (o durante `vercel` CLI):

1. Ve a **Settings → Environment Variables**
2. Agrega estas variables:
   - `GROQ_API_KEY` → Tu clave de Groq (desde .env)
   - `HF_TOKEN` → Tu token de Hugging Face (desde .env)

**⚠️ IMPORTANTE:** No copies/pegues valores sensibles en el repositorio. Vercel gestiona estas variables de forma segura.

### 4. Deploy

```bash
# Si usas CLI
vercel --prod

# Si usas GitHub, Vercel despliega automáticamente en push a main
```

## Cómo Funciona

### API Handler (`api/generate.js`)
- Recibe POST requests en `/api/generate`
- Valida parámetros: `topic`, `context`, `include_image`
- Llama a Groq API para generar contenido
- (Opcional) Llama a Hugging Face para generar imágenes
- Retorna JSON con `content`, `image_url`, `type`

### Frontend (`frontend/index.html`)
- Archivo estático servido desde `/`
- Usa `window.location.origin` para determinar la URL de la API
- En local: apunta a `http://localhost:3000`
- En Vercel: apunta a `https://tu-dominio.vercel.app`

### Reescrituras (vercel.json)
```json
{
  "public": "frontend",
  "rewrites": [
    { "source": "/", "destination": "/frontend/index.html" },
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```
Esto asegura que:
- `/` sirve `frontend/index.html`
- `/api/*` va a los handlers en `api/`

## Testing Local

### Antes de desplegar, verifica que funcione localmente:

```bash
# Instalar dependencias (aunque api/generate.js no tiene dependencias externas)
npm install

# Usar Vercel CLI para simular el ambiente
npm install -g vercel
vercel dev
```

Luego abre `http://localhost:3000` y prueba:
1. Ingresa un tema (ej: "Marketing digital")
2. Selecciona tipo (Post o Artículo)
3. Marca "Generar imagen" (opcional)
4. Haz clic en "✨ Generar Contenido"

## Solucionar Problemas

### Error: "Missing API keys"
- Verifica que `GROQ_API_KEY` y `HF_TOKEN` estén configuradas en Vercel
- Usa `vercel env` para ver variables configuradas

### Error: "Method not allowed"
- El endpoint solo acepta POST
- Verifica que el frontend envíe POST (no GET)

### Imagen no se genera
- Es normal si el modelo de Hugging Face está lento
- El error se captura y el API retorna solo el contenido (sin imagen)

### Frontend muestra error de conexión
- Verifica que `window.location.origin` esté correcto
- Abre DevTools → Network → ve qué URL se está llamando

## Diferencias vs Versión Python

| Aspecto | Python (FastAPI) | Vercel (Node.js) |
|---------|------------------|-----------------|
| Servidor | FastAPI + Uvicorn | Node.js serverless |
| Lectura Obsidian | ✅ Soportada | ❌ No disponible en Vercel |
| Endpoints batch | ✅ /api/batch-generate | ❌ No incluido |
| Guardado de archivos | ✅ generated_posts/ | ❌ No disponible (serverless) |

### Funcionalidades Removidas en Vercel
- Lectura de Obsidian (requiere acceso al filesystem local)
- Guardado de posts generados (serverless no tiene filesystem persistente)
- Generación batch

Puedes mantener el código Python para desarrollo local, pero Vercel solo usa `api/generate.js`.

## URLs Importantes

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Tu app en Vercel:** `https://linkedin-generator-[username].vercel.app`
- **Docs de Vercel serverless:** https://vercel.com/docs/functions/serverless-functions

## Proximas Mejoras

1. **Agregar base de datos** para guardar posts generados (Prisma + PostgreSQL)
2. **Autenticación** para asegurar el endpoint (NextAuth, JWT)
3. **Caching** de respuestas con Redis para optimizar costos
4. **Webhooks** para integración con otras herramientas

---

¿Preguntas? Revisa la documentación de Vercel: https://vercel.com/docs
