export default async function handler(req, res) {
  // Habilitar CORS
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
    const { topic, context, include_image } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!GROQ_API_KEY || !HF_TOKEN) {
      return res.status(500).json({ error: 'Missing API keys' });
    }

    // Determinar tipo de contenido basado en context
    const isArticle = context === 'article';
    const maxTokens = isArticle ? 3000 : 1500;

    // Llamar a Groq API directamente
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Genera un ${isArticle ? 'artículo de LinkedIn largo' : 'post de LinkedIn breve'} sobre: ${topic}\n\nLenguaje conversacional, personal y profesional. Sin emojis.`
        }],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const groqError = await groqResponse.json();
      throw new Error(`Groq API error: ${groqError.error?.message || 'Unknown error'}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0].message.content;

    let image_url = null;

    if (include_image) {
      try {
        const imageResponse = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
          headers: { Authorization: `Bearer ${HF_TOKEN}` },
          method: 'POST',
          body: JSON.stringify({ inputs: `Professional LinkedIn visual for: ${topic}` }),
        });

        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          image_url = `data:image/jpeg;base64,${base64}`;
        }
      } catch (imageError) {
        console.warn('Image generation failed:', imageError.message);
        // No fallar si la imagen no se genera
      }
    }

    return res.status(200).json({
      content,
      image_url,
      type: context
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
