import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load server-side environment variables
  const env = { 
    ...process.env, 
    ...loadEnv(mode, process.cwd(), ''), 
    ...loadEnv(mode, path.resolve(process.cwd(), '..'), '') 
  };
  const groqApiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || '';
  const groqModel = env.GROQ_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  return {
    define: {
      '__GROQ_API_KEY__': JSON.stringify(groqApiKey),
      '__GROQ_MODEL__': JSON.stringify(groqModel),
    },
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'groq-chat-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              return next();
            }

            let rawBody = '';
            req.on('data', chunk => { rawBody += chunk; });
            req.on('end', async () => {
              try {
                const key = groqApiKey || process.env.GROQ_API_KEY;
                if (!key) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured in server environment variables.' }));
                  return;
                }

                const parsed = JSON.parse(rawBody || '{}');
                const { messages, model = env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature = 0.5, max_tokens = 800 } = parsed;

                const sendGroq = async (targetModel) => {
                  return fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${key.trim()}`,
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

                let groqRes = await sendGroq(model);

                if (!groqRes.ok && model !== 'openai/gpt-oss-120b') {
                  const errClone = await groqRes.clone().json().catch(() => ({}));
                  if (errClone.error?.message?.includes('does not exist') || errClone.error?.code === 'model_not_found') {
                    console.warn(`[Vite Dev] Model ${model} not available on Groq. Retrying with openai/gpt-oss-120b...`);
                    groqRes = await sendGroq('openai/gpt-oss-120b');
                  }
                }

                const data = await groqRes.json();
                if (!groqRes.ok) {
                  res.statusCode = groqRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: data.error?.message || `Groq error status ${groqRes.status}` }));
                  return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ content: data.choices?.[0]?.message?.content || '' }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Internal server error while calling Groq' }));
              }
            });
          });
        }
      }
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'https://path-website-production.up.railway.app',
          changeOrigin: true,
          secure: true,
          bypass(req) {
            if (req.url === '/api/chat' || req.url.startsWith('/api/chat')) {
              // Handled by groq-chat-endpoint middleware, do not forward to Railway
              return req.url;
            }
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/axios')) {
              return 'vendor-axios';
            }
          }
        }
      }
    }
  };
});
