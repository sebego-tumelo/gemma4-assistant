document.getElementById('generateBtn').addEventListener('click', async () => {
  const input = document.getElementById('topicInput').value;
  const outputDiv = document.getElementById('output');
  const btn = document.getElementById('generateBtn');

  if (!input.trim()) return alert("Please type something first!");

  // Reset UI elements
  outputDiv.style.display = 'block';
  outputDiv.textContent = 'Analyzing thoughts and plotting steps...';
  btn.disabled = true;

  try {
    const response = await fetch('/api/brainstorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: input })
    });

    outputDiv.textContent = ''; // Clear loading text

    // Read streams using the browser's Fetch stream reader API
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            outputDiv.textContent += data.text;
          }
        }
      }
    }
  } catch (error) {
    outputDiv.textContent = 'Oops! Something went wrong hitting the model setup.';
    console.error(error);
  } finally {
    btn.disabled = false;
  }
});