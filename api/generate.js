const SYSTEM_PROMPT = `Eres un Director de Contenido + Coach + Copywriter especializado en LinkedIn para la industria de publicidad digital, martech e inteligencia artificial.

Tu misión: generar contenido que suene 100% humano, auténtico y estratégico — nunca como IA corporativa.

## Temáticas válidas
Orbita siempre estas intersecciones:
- Publicidad Digital y Marketing moderno
- Martech (tecnología de marketing) e Inteligencia Artificial
- Impacto estratégico de medios en Brand & Business

## Reglas de estilo

✅ Hacer:
- Lenguaje cercano pero profesional
- Frases cortas e impactantes
- Espacios en blanco generosos (máx. 2–3 líneas por párrafo)
- Storytelling conectado a insights reales de la industria
- Hooks que generen curiosidad o tensión en la primera línea
- CTAs que inviten a debatir, no a hacer clic en un link

❌ Evitar:
- Frases de apertura genéricas: "En el dinámico mundo de...", "En el vertiginoso panorama..."
- Palabras infladas: "Crucial", "Revolucionario", "Sin precedentes", "Disruptivo", "Game-changer"
- Listas de bullet points sin narrativa
- Tono corporativo o de comunicado de prensa
- Emojis como decoración vacía. Úsalos estratégicamente: 3–5 por post, como separadores de sección o énfasis visual (✅ para listas de acción, 🔑 para insight clave, ❌ para contrastes). Nunca en la primera línea.

## Formato de entrega OBLIGATORIO

Responde SIEMPRE con este formato exacto:

---
📌 POST DE LINKEDIN
---

[Texto del post listo para copiar y pegar]

---
🔍 NOTA DEL COACH
[1–2 líneas explicando la decisión creativa principal: por qué este hook, por qué este CTA]
---
🎨 PROMPT IMAGEN
[Prompt en inglés de 1–2 frases para generar la imagen del post en un generador IA. Descripción visual concreta: escena, iluminación, paleta de colores, estilo fotográfico o ilustrativo. Profesional, adecuado para LinkedIn. Sin texto en la imagen.]
---`;

function buildUserMessage(mode, topic, voiceSample) {
  const voiceContext = voiceSample
    ? `\n\nMuestra de voz/estilo del autor (adapta el contenido a este tono):\n"""\n${voiceSample}\n"""`
    : '';

  switch (mode) {
    case 'post':
      return `Escribe un post de LinkedIn sobre: ${topic}${voiceContext}`;

    case 'articulo':
      return `Escribe un artículo largo de LinkedIn sobre: ${topic}${voiceContext}\n\nIncluye la estructura de secciones propuesta antes del artículo completo.`;

    case 'hook':
      return `Genera 3 opciones de hook de LinkedIn para el tema: ${topic}${voiceContext}\n\nCada hook: máximo 2 líneas, crear curiosidad o tensión, NO empezar con clichés. Incluye una línea breve explicando por qué funciona cada uno.\n\nFormatea así:\n\nHook 1: [texto]\n→ Por qué funciona: [razón]\n\nHook 2: [texto]\n→ Por qué funciona: [razón]\n\nHook 3: [texto]\n→ Por qué funciona: [razón]`;

    case 'revisar':
      return `Revisa y mejora este texto para LinkedIn, manteniendo la voz del autor pero aplicando las reglas de estilo${voiceContext}:\n\n"""\n${topic}\n"""`;

    default:
      return `Escribe un post de LinkedIn sobre: ${topic}${voiceContext}`;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, context, voice_sample } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
    }

    const mode = context || 'post';
    const isArticle = mode === 'articulo';
    const userMessage = buildUserMessage(mode, topic, voice_sample);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: isArticle ? 3000 : 1500,
        temperature: 0.75
      })
    });

    if (!groqResponse.ok) {
      const groqError = await groqResponse.json();
      throw new Error(`Groq API error: ${groqError.error?.message || 'Unknown error'}`);
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices[0].message.content;

    const { content, coachNote, imagePrompt } = parseCoachResponse(rawContent);

    return res.status(200).json({ content, coach_note: coachNote, image_prompt: imagePrompt, type: mode });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function parseCoachResponse(raw) {
  const coachNoteMatch = raw.match(/---\s*🔍 NOTA DEL COACH\s*\n([\s\S]*?)(?=---)/);
  const coachNote = coachNoteMatch ? coachNoteMatch[1].trim() : '';

  const imagePromptMatch = raw.match(/---\s*🎨 PROMPT IMAGEN\s*\n([\s\S]*?)(?:---|$)/);
  const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

  let content = raw
    .replace(/---\s*📌 POST DE LINKEDIN\s*---\s*/g, '')
    .replace(/---\s*🔍 NOTA DEL COACH[\s\S]*?(?:---|$)/g, '')
    .replace(/^---\s*$/gm, '')
    .trim();

  return { content, coachNote, imagePrompt };
}
