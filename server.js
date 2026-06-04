import express from 'express';
import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const ollama = new Ollama({
  host: 'https://ollama.com',
  headers: {
    'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
  }
});

// Secure API endpoint for brainstorming
app.post('/api/brainstorm', async (req, res) => {
  const { topic } = req.body;

  // Set headers for SSE (Server-Sent Events) to allow streaming text chunks
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await ollama.chat({
      model: 'gemma4:31b',
      messages: [
        {
          role: 'system',
          content: `You are a focus and brainstorming assistant. 
          Take the user's messy thoughts, goal, or raw topic and break it down into a strict, highly actionable 3-step action plan. 
          Be incredibly concise, sharp, and practical.`
        },
        { role: 'user', content: topic }
      ],
      stream: true
    });

    for await (const chunk of response) {
      res.write(`data: ${JSON.stringify({ text: chunk.message.content })}\n\n`);
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).write(`data: ${JSON.stringify({ error: 'Failed to consult Gemma 4' })}\n\n`);
    res.end();
  }
});

// Integrate Vite to serve the front-end code seamlessly
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'html'
});
app.use(vite.middlewares);

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});