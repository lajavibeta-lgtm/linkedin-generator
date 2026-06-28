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
    const { topic, context, include_image } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
    }

    const isArticle = context === 'article';
    const maxTokens = isArticle ? 3000 : 1500;

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
      const encodedPrompt = encodeURIComponent(`Professional LinkedIn visual for: ${topic}, modern, clean, business`);
      const seed = Math.floor(Math.random() * 999999);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=768&nologo=true&seed=${seed}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const imgResponse = await fetch(pollinationsUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'image/*' }
        });

        clearTimeout(timeoutId);

        if (imgResponse.ok) {
          const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await imgResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          image_url = `data:${contentType};base64,${base64}`;
        } else {
          image_url = pollinationsUrl;
        }
      } catch (imgError) {
        console.error('Image fetch error:', imgError.message);
        // Fall back to the URL so the browser can try directly
        image_url = pollinationsUrl;
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
