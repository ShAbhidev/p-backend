import type { Request, Response } from 'express';

export const metacallback = (req: Request, res: Response) => {
  console.log('WEBHOOK HIT');
  console.log(req.query);

  const hubMode = String(req.query['hub.mode'] ?? '');
  const hubChallenge = String(req.query['hub.challenge'] ?? '');
  const verifyToken = String(req.query['hub.verify_token'] ?? '');

  const isValid = verifyToken === process.env.WHATSAPP_VERIFY_TOKEN;

  if (isValid && hubMode === 'subscribe') {
    return res.send(hubChallenge);
  }

  return res.status(403).send('not valid');
};

export const exchangeCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || '',
      client_secret: process.env.FACEBOOK_APP_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.META_REDIRECT_URI || '',
    });

    const response = await fetch(
      'https://graph.facebook.com/v25.0/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta token exchange failed:', data);
      return res.status(400).json(data);
    }

    console.log(data);
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
};