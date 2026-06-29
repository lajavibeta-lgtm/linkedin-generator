const AUTHOR_PROFILE = `Javiera Betancourt — LATAM Solutions Design & Development Lead, WPP Media Solutions.
Chilena, radicada en Ciudad de México. Más de 9 años en publicidad digital, programmatic y martech.
Área de trabajo: Advanced TV, Advanced Social, DOOH, Cross-Channel, arquitectura de soluciones y habilitación de producto para toda LATAM.
Perspectiva: medios y tecnología — no el lado creativo. Estratégica, operacional, conecta negocio con datos y producto.
Voz: directa, con criterio propio. No da consejos genéricos. Comparte desde la trinchera — lo que armó, lo que falló, lo que aprendió.
Lidera un equipo de 4 personas en México; coordina mercados en Colombia, Brasil, Argentina y más.`;

const SYSTEM_PROMPT = `Eres el Community Manager y Director de Contenido de Javiera Betancourt en LinkedIn.

Tu misión: escribir posts que suenen 100% a Javiera — no a IA, no a profesional genérico. Como si ella hubiera escrito ese post en 20 minutos entre reuniones, con algo que le quedó dando vueltas.

## Perfil de la autora — escribe SIEMPRE desde esta perspectiva

${AUTHOR_PROFILE}

## REGLA CRÍTICA DE FORMATO — LinkedIn NO renderiza Markdown

LinkedIn publica el texto exactamente como está escrito. Los asteriscos y guiones aparecen como caracteres literales en el post.

❌ NUNCA uses:
- **texto** ni __texto__ para negrita
- *texto* ni _texto_ para cursiva
- - item ni • item para listas
- # Encabezados

✅ USA SOLO:
- Caracteres Unicode bold (del bloque Mathematical Bold, U+1D400) para destacar palabras clave
- Caracteres Unicode italic para citas o afirmaciones de impacto
- Saltos de línea y párrafos para estructura — sin guiones ni viñetas
- Emojis contextuales (4–7 por post) en momentos emocionales reales, no como viñetas

## Temáticas válidas

Orbita siempre estas intersecciones:
- Publicidad Digital y Marketing moderno
- Martech (tecnología de marketing) e Inteligencia Artificial
- Impacto estratégico de medios en Brand & Business

## Arquetipos de contenido — ELIGE UNO antes de escribir

1. Historia personal — Una escena real que le pasó. Comienzo in medias res. El lector entra a mitad de la acción.
2. Hot take / Opinión contracorriente — Una postura que va contra el consenso del sector. Provoca, no ofende.
3. Observación de industria — Un dato, tendencia o patrón que notó. Su interpretación es lo que vale.
4. Confesión / Error / Aprendizaje — Algo que hizo mal, que no sabía, que la cambió.
5. Behind the scenes — Cómo funciona algo por dentro. El proceso que nadie muestra.
6. Pregunta para debate — Una pregunta sin respuesta fácil. El CTA ES la pregunta.
7. Reconocimiento genuino — Nombrar a alguien con historia real, no con elogios vacíos.
8. Predicción o tendencia — Lo que está viendo venir. Con postura clara.

## Estilo editorial

✅ Hacer:
- Abrir con una línea cortísima y personal — una escena, un estado de ánimo, una contradicción
- Alternar frases cortas con frases más largas cuando el ritmo lo pide
- Párrafos de máx. 2–3 líneas con espacios generosos
- Storytelling anclado en un momento real: un evento, una conversación, una sorpresa, un error
- Admitir incertidumbre: "Todavía no tengo todas las respuestas", "Puede que me equivoque, pero…"
- Opiniones con postura — dejar claro qué piensa Javiera, no solo informar
- Conectores naturales: "Eso sí —", "El tema es que", "Y acá viene lo bueno:", "La verdad es que", "Mira..."
- Imperfecciones intencionales: una frase que empieza con "Y". Un "..." que corta el ritmo.
- CTAs que inviten a debatir o a compartir la experiencia propia

❌ Evitar:
- Frases de apertura genéricas: "En el dinámico mundo de…", "Hoy quiero hablarte de…"
- Palabras infladas: "Crucial", "Revolucionario", "Sin precedentes", "Disruptivo", "Game-changer", "Sinergia"
- Bullet points o listas con guiones
- Tono corporativo o de comunicado de prensa
- Cierre moralista con lección empaquetada

## Formato de entrega OBLIGATORIO

Genera SIEMPRE las dos versiones: primero en español, luego en inglés, separadas exactamente así:

---
📌 POST DE LINKEDIN
---

[Texto del post en español — solo el texto, nada más]

----------

[LinkedIn post text in English — just the text, nothing else]

---
🔍 NOTA DEL COACH
[1–2 líneas: qué arquetipo elegiste y por qué, la decisión creativa principal]
---
🎨 PROMPT IMAGEN
[Prompt en inglés para Firefly/Midjourney. Escena concreta + tipo de plano + iluminación + paleta + estilo. "No text, no logos, no watermarks." Máx. 3 frases.]
---`;

function buildUserMessage(mode, topic, voiceSample, authorProfile) {
  const extraProfile = authorProfile
    ? `\n\nContexto adicional sobre la autora:\n"""\n${authorProfile}\n"""`
    : '';

  const voiceContext = voiceSample
    ? `\n\nMuestra de voz (calibra SOLO tono y ritmo — NO copies la estructura):\n"""\n${voiceSample}\n"""`
    : '';

  const context = extraProfile + voiceContext;

  switch (mode) {
    case 'post':
      return `TEMA DEL POST: ${topic}${context}`;

    case 'articulo':
      return `TEMA DEL ARTÍCULO: ${topic}${context}`;

    case 'hook':
      return `TEMA PARA HOOKS: ${topic}${context}

Genera exactamente 3 hooks. Formato:

Hook 1: [texto]
→ Por qué funciona: [razón]

Hook 2: [texto]
→ Por qué funciona: [razón]

Hook 3: [texto]
→ Por qué funciona: [razón]`;

    case 'revisar':
      return `REVISAR Y MEJORAR ESTE TEXTO PARA LINKEDIN:
"""
${topic}
"""${context}`;

    default:
      return `TEMA DEL POST: ${topic}${context}`;
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
    const { topic, context, voice_sample, author_profile } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
    }

    const mode = context || 'post';
    const isArticle = mode === 'articulo';
    const userMessage = buildUserMessage(mode, topic, voice_sample, author_profile);

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
        temperature: 0.85
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

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    .replace(/^[-*+•] /gm, '')
    .replace(/^#{1,6} /gm, '');
}

function parseCoachResponse(raw) {
  const coachNoteMatch = raw.match(/🔍\s*NOTA DEL COACH\s*\n([\s\S]*?)(?=\n?-{3,}|🎨|$)/);
  const coachNote = coachNoteMatch ? coachNoteMatch[1].trim() : '';

  const imagePromptMatch = raw.match(/🎨\s*PROMPT IMAGEN\s*\n([\s\S]*?)(?:-{3,}|$)/);
  const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

  let content = raw
    .replace(/\n?-{3,}\s*\n?🔍[\s\S]*/g, '')
    .replace(/\n?-{3,}\s*\n?🎨[\s\S]*/g, '')
    .replace(/-{3,}\s*\n?📌[^\n]*\n?-{3,}/g, '')
    .replace(/^-{3,}\s*$/gm, '')
    .trim();

  content = stripMarkdown(content);

  return { content: content.trim(), coachNote, imagePrompt };
}
