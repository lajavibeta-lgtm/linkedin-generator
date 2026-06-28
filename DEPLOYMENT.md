# 📦 Guía de Deployment a Vercel

Este proyecto está completamente configurado para deployar automáticamente en Vercel.

## Prerequisitos

- Cuenta en GitHub
- Cuenta en Vercel (gratis)
- Groq API Key (gratis)
- Hugging Face Token (gratis)

## ✅ Paso 1: Configuración en GitHub

```bash
# El repo ya está conectado a GitHub
git status
git add .
git commit -m "feat: Prepare for Vercel deployment with env vars"
git push origin main
```

## ✅ Paso 2: Conectar a Vercel

### Opción A: Desde Vercel Dashboard (Recomendado)

1. Ve a https://vercel.com
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Node.js
5. Haz clic en "Deploy"

### Opción B: Desde CLI

```bash
npm install -g vercel
vercel
# Sigue las instrucciones interactivas
```

## ✅ Paso 3: Configurar Variables de Entorno

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

Añade:
- `GROQ_API_KEY`: Tu API key de Groq (comienza con `gsk_`)
- `HF_TOKEN`: Tu token de Hugging Face (comienza con `hf_`)

```
GROQ_API_KEY = gsk_xxxxxx
HF_TOKEN = hf_xxxxx
```

## ✅ Paso 4: Deploy Automático

¡Ya está! Cada vez que hagas:

```bash
git push origin main
```

Vercel deployará automáticamente.

### Monitorear deployments

Ve a: https://vercel.com/your-account/deployments

---

## 🔍 Verificar que funciona

1. Abre la URL de tu deployment en Vercel
2. Rellena el formulario
3. Genera un post de prueba
4. Si funciona ✅, ¡listo!

## 📊 Monitoreo

En Vercel Dashboard puedes ver:
- Logs de cada invocación
- Errores
- Duración de ejecución
- Tráfico

## 🐛 Troubleshooting

### El proyecto no se despliega
- Verifica que los archivos estén pusheados a GitHub
- Revisa los logs en Vercel Dashboard

### Error "Missing API keys"
- Verifica que GROQ_API_KEY y HF_TOKEN estén en Environment Variables
- Reinicia el deployment

### Error en generación de contenido
- Verifica los logs en Vercel Dashboard
- Comprueba que las API keys sean válidas
- Revisa los límites de rate en Groq y Hugging Face

---

## 💻 Desarrollo Local

```bash
# Instalar Vercel CLI
npm install -g vercel

# Variables de entorno
echo "GROQ_API_KEY=gsk_..." > .env.local
echo "HF_TOKEN=hf_..." >> .env.local

# Ejecutar
vercel dev

# Abre http://localhost:3000
```

---

## 🚀 Próximos Pasos

1. ✅ Variables de entorno en Vercel
2. ✅ Deploy automático configurado
3. 🔲 Personalizar prompts en `api/generate.js` (opcional)
4. 🔲 Agregar tu propio branding (opcional)
5. 🔲 Configurar dominio personalizado (opcional)

¡Felicidades! Tu aplicación está lista en producción. 🎉
