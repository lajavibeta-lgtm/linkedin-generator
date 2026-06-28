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

    // Run text and image generation concurrently
    const textPromise = fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        max_tokens: isArticle ? 3000 : 1500,
        temperature: 0.7
      })
    });

    const imagePromise = include_image
      ? fetchImage(topic)
      : Promise.resolve(null);

    const [groqResponse, image_url] = await Promise.all([textPromise, imagePromise]);

    if (!groqResponse.ok) {
      const groqError = await groqResponse.json();
      throw new Error(`Groq API error: ${groqError.error?.message || 'Unknown error'}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0].message.content;

    return res.status(200).json({ content, image_url, type: context });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function fetchImage(topic) {
  const encodedPrompt = encodeURIComponent(`Professional LinkedIn visual for: ${topic}, modern, clean, business`);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=768&nologo=true&seed=${seed}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'image/*' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) return url;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;

  } catch {
    // On timeout or error, return the URL so the browser can try directly
    return url;
  }
}
