export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Only POST is accepted.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'GROQ_API_KEY is not configured in Vercel Environment Variables. Please set GROQ_API_KEY in your Vercel Project Settings.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { 
      messages, 
      model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b', 
      temperature = 0.5, 
      max_tokens = 800 
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: messages array is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sendRequest = async (targetModel) => {
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
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
      return new Response(
        JSON.stringify({ error: errData.error?.message || `Groq API returned error status ${response.status}` }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error while contacting AI Assistant.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
