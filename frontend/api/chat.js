export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured in Vercel Environment Variables.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      messages,
      model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature = 0.5,
      max_tokens = 800
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload: messages array is required.' });
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

    // Fallback if model is not available on user account
    if (!response.ok && model !== 'openai/gpt-oss-120b') {
      const errClone = await response.clone().json().catch(() => ({}));
      if (errClone.error?.message?.includes('does not exist') || errClone.error?.code === 'model_not_found') {
        response = await sendRequest('openai/gpt-oss-120b');
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData.error?.message || `Groq API returned error status ${response.status}`
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error while contacting AI Assistant.'
    });
  }
}
