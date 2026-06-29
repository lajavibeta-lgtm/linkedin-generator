export default function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send('Missing LINKEDIN_CLIENT_ID environment variable');
  }

  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const redirectUri = `${proto}://${host}/api/linkedin-callback`;

  const { randomBytes } = await import('crypto');
  const state = randomBytes(16).toString('hex');
  const isProduction = proto === 'https';
  const cookieFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=600${isProduction ? '; Secure' : ''}`;

  res.setHeader('Set-Cookie', `li_state=${state}; ${cookieFlags}`);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile w_member_social'
  });

  res.redirect(302, `https://www.linkedin.com/oauth/v2/authorization?${params}`);
}
