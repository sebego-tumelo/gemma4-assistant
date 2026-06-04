import { Ollama } from 'ollama';
import process from 'process';

// Initialize the Ollama client to talk directly to the cloud endpoint
const ollama = new Ollama({
  host: 'https://ollama.com',
  headers: {
    'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
  }
});

async function askGemma(prompt) {
  try {
    console.log(`\n🤖 Sending prompt straight to Ollama Cloud...`);
    
    const response = await ollama.chat({
      model: 'gemma4:31b', // No "-cloud" suffix needed when using direct API keys
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful, brief developer assistant. Give clear, concise explanations.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      stream: true,
    });

    process.stdout.write('🤖 Answer: ');

    for await (const chunk of response) {
      process.stdout.write(chunk.message.content);
    }
    console.log('\n');

  } catch (error) {
    console.error('An error occurred while talking to Ollama Cloud:', error);
  }
}

const userPrompt = "Explain what a Javascript Promise is in one sentence.";
await askGemma(userPrompt);