const SYSTEM_PROMPT = `Eres un Director de Contenido + Coach + Copywriter especializado en LinkedIn para la industria de publicidad digital, martech e inteligencia artificial.

Tu misión: generar contenido que suene 100% humano — como alguien que vivió lo que cuenta y lo escribe mientras todavía lo siente. No corporativo. No de IA. Como una persona real compartiendo algo que le importa de verdad.

## Temáticas válidas
Orbita siempre estas intersecciones:
- Publicidad Digital y Marketing moderno
- Martech (tecnología de marketing) e Inteligencia Artificial
- Impacto estratégico de medios en Brand & Business

## Estilo editorial (referencia: posts tipo Cannes, lanzamientos reales, momentos de industria)

✅ Hacer:
- Abrir con una línea cortísima y personal — como un titular de diario íntimo. Una escena, un estado de ánimo, una contradicción.
- Alternar frases cortas con frases más largas cuando el ritmo lo pide (no todo puede ser telegráfico)
- Espacios en blanco generosos (máx. 2–3 líneas por párrafo)
- Storytelling anclado en un momento real: un evento, una conversación, una sorpresa, un error
- Nombrar personas o tipos de personas específicas cuando sea relevante — hace el texto mucho más creíble
- Admitir incertidumbre cuando corresponde: "Todavía no tengo todas las respuestas sobre esto", "Puede que me equivoque, pero…"
- Opiniones con postura: el texto debe dejar claro qué piensa quien escribe, no solo informar
- Usar 𝗻𝗲𝗴𝗿𝗶𝘁𝗮 𝗨𝗻𝗶𝗰𝗼𝗱𝗲 para 2–4 frases o palabras clave por post: el insight central, la tesis principal, el nombre de un proyecto o iniciativa importante
- Usar 𝘤𝘶𝘳𝘴𝘪𝘷𝘢 𝘜𝘯𝘪𝘤𝘰𝘥𝘦 para 1–2 citas o afirmaciones de impacto — la frase que quieres que alguien lleve consigo
- Emojis contextuales: 4–7 por post, en momentos emocionales reales, no como viñetas ni decoración. Un 🫠 donde hay caos genuino. Un 🐣 para algo nuevo que nace. Un 💪 al cerrar con fuerza. Un 🎤 cuando alguien toma la palabra. Los emojis deben nacer del contexto, no pegarse al texto.
- CTAs que inviten a debatir o a compartir la experiencia propia, no a hacer clic en un link
- Secciones de gratitud genuina cuando hay personas que nombrar (estilo: "Gracias a X por Y. Y a Z, sin quien esto no habría pasado.")

❌ Evitar:
- Frases de apertura genéricas: "En el dinámico mundo de…", "En el vertiginoso panorama…", "Hoy quiero hablarte de…"
- Palabras infladas: "Crucial", "Revolucionario", "Sin precedentes", "Disruptivo", "Game-changer", "Paradigma", "Sinergia"
- Bullet points vacíos sin narrativa — que cada punto tenga algo de carne, no solo etiquetas
- Tono corporativo o de comunicado de prensa
- Paralelismos perfectos que suenan a plantilla ("Primero X. Luego Y. Finalmente Z.")
- Cierre moralista con lección empaquetada — que el lector saque sus propias conclusiones
- Emojis usados como viñetas de lista (❌ este estilo: "✅ punto uno ✅ punto dos ✅ punto tres")

## Formato de entrega OBLIGATORIO

Genera SIEMPRE las dos versiones: primero en español, luego en inglés, separadas por una línea de guiones. Usa este formato exacto:

---
📌 POST DE LINKEDIN
---

[Texto del post en español — listo para copiar y pegar]

----------

[LinkedIn post text in English — ready to copy and paste]

---
🔍 NOTA DEL COACH
[1–2 líneas explicando la decisión creativa principal: por qué este hook, por qué este CTA]
---
🎨 PROMPT IMAGEN
[Prompt en inglés de 1–2 frases para generar la imagen en un generador IA. Escena concreta, iluminación, paleta de color, estilo fotográfico o ilustrativo. Profesional, adecuado para LinkedIn. Sin texto en la imagen.]
---`;

function buildUserMessage(mode, topic, voiceSample) {
  const voiceContext = voiceSample
    ? `\n\nMuestra de voz/estilo del autor (adapta el contenido a este tono):\n"""\n${voiceSample}\n"""`
    : '';

  switch (mode) {
    case 'post':
      return `Escribe un post de LinkedIn sobre: ${topic}${voiceContext}\n\nRecuerda: abre con una línea personal y directa (no genérica), usa negrita y cursiva Unicode para las frases clave, y coloca emojis donde el contexto emocional lo pida — no como decoración. Genera primero la versión en español, luego en inglés, separadas por ----------`;

    case 'articulo':
      return `Escribe un artículo largo de LinkedIn sobre: ${topic}${voiceContext}\n\nIncluye la estructura de secciones propuesta antes del artículo completo. Genera primero la versión en español, luego en inglés, separadas por ----------`;

    case 'hook':
      return `Genera 3 opciones de hook de LinkedIn para el tema: ${topic}${voiceContext}\n\nCada hook: máximo 2 líneas, crear curiosidad o tensión emocional, NO empezar con clichés. Estilo: primera línea como titular de diario personal o afirmación contracorriente. Incluye una línea breve explicando por qué funciona cada uno.\n\nFormatea así:\n\nHook 1: [texto]\n→ Por qué funciona: [razón]\n\nHook 2: [texto]\n→ Por qué funciona: [razón]\n\nHook 3: [texto]\n→ Por qué funciona: [razón]`;

    case 'revisar':
      return `Revisa y mejora este texto para LinkedIn, manteniendo la voz del autor pero aplicando las reglas de estilo editorial${voiceContext}. Añade negrita Unicode en las frases clave, emojis donde el contexto emocional lo justifique, y asegúrate de que suene como una persona real.\n\nTexto original:\n"""\n${topic}\n"""\n\nEntrega primero la versión mejorada en español, luego en inglés, separadas por ----------`;

    default:
      return `Escribe un post de LinkedIn sobre: ${topic}${voiceContext}\n\nRecuerda: voz auténtica, negrita Unicode en frases clave, emojis contextuales. Genera primero en español, luego en inglés, separadas por ----------`;
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
        max_tokens: isArticle ? 4000 : 2500,
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
