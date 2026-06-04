import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'https://ollama.com',
  headers: {
    'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
  }
});

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { topic } = JSON.parse(event.body);

    // Note: Standard serverless functions don't support partial chunk text-streaming well over basic HTTP.
    // We will fetch the full generation from Gemma 4 and return it all at once to ensure maximum compatibility.
    const response = await ollama.chat({
      model: 'gemma4:31b',
      messages: [
        {
          role: 'system',
          content: 'You are a focus assistant. Take the user thoughts and break them into a strict actionable plan.'
        },
        { role: 'user', content: topic }
      ],
      stream: false // Turn off streaming for serverless stability
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.message.content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};