export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, access_token, person_urn } = req.body;

  if (!content || !access_token || !person_urn) {
    return res.status(400).json({ error: 'Missing required fields: content, access_token, person_urn' });
  }

  try {
    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202502',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: person_urn,
        commentary: content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      })
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      console.error('LinkedIn UGC post error:', postRes.status, errText);
      if (postRes.status === 401) {
        return res.status(401).json({ error: 'Token expirado o inválido. Reconecta tu cuenta de LinkedIn.' });
      }
      return res.status(postRes.status).json({ error: 'Error al publicar en LinkedIn', details: errText });
    }

    const postData = await postRes.json();
    return res.status(200).json({ success: true, postId: postData.id });

  } catch (err) {
    console.error('Post error:', err);
    return res.status(500).json({ error: err.message });
  }
}
