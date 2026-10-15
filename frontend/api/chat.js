export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  const isNode = res && typeof res.status === 'function';

  // Helper response sender
  const send = (status, data, headers = {}) => {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      for (const [k, v] of Object.entries(headers)) {
        res.setHeader(k, v);
      }
      return res.status(status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...headers
      }
    });
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  if (req.method !== 'POST') {
    return send(405, { error: 'Method not allowed. Only POST is accepted.' });
  }

  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    return send(500, { error: 'GROQ_API_KEY is not configured in Vercel Environment Variables.' });
  }

  try {
    let body;
    if (isNode) {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } else {
      body = await req.json().catch(() => ({}));
    }

    const {
      messages,
      model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature = 0.5,
      max_tokens = 800
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return send(400, { error: 'Invalid payload: messages array is required.' });
    }

    const sendRequest = async (targetModel) => {
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens
        })
      });
    };

    let response = await sendRequest(model);

    // Fallback if model is not available or deprecated on Groq account
    if (!response.ok && model !== 'openai/gpt-oss-120b') {
      const errClone = await response.clone().json().catch(() => ({}));
      if (errClone.error?.message?.includes('does not exist') || errClone.error?.code === 'model_not_found') {
        response = await sendRequest('openai/gpt-oss-120b');
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return send(response.status, { error: errData.error?.message || `Groq API returned error status ${response.status}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return send(200, { content });
  } catch (error) {
    return send(500, { error: error.message || 'Internal server error while contacting AI Assistant.' });
  }
}
