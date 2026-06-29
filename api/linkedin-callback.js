export default async function handler(req, res) {
  const { code, state, error: oauthError, error_description } = req.query;

  if (oauthError) {
    return res.redirect(302, `/?linkedin_error=${encodeURIComponent(error_description || oauthError)}`);
  }

  const cookieState = parseCookies(req.headers.cookie)['li_state'];
  if (!state || state !== cookieState) {
    return res.redirect(302, '/?linkedin_error=invalid_state');
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect(302, '/?linkedin_error=missing_server_config');
  }

  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const redirectUri = `${proto}://${host}/api/linkedin-callback`;
  const isProduction = proto === 'https';

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token exchange error:', err);
      return res.redirect(302, '/?linkedin_error=token_exchange_failed');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return res.redirect(302, '/?linkedin_error=userinfo_failed');
    }

    const userInfo = await userRes.json();
    const personUrn = `urn:li:person:${userInfo.sub}`;
    const name = userInfo.name || userInfo.given_name || '';

    const clearCookie = `li_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${isProduction ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', clearCookie);

    const params = new URLSearchParams({
      linkedin_token: accessToken,
      linkedin_urn: personUrn,
      linkedin_name: name
    });
    res.redirect(302, `/#${params}`);

  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(302, '/?linkedin_error=internal_error');
  }
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}
