// ---- Groq API Integration (FREE) ----
const GROQ_API_KEY = "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";  // Paste your actual key
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama3-8b-8192";   // Fast & free. You can also try "mixtral-8x7b-32768"

async function askXylora(prompt) {
  const loadingId = addMessage("ai", "Xylora is thinking...");
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "You are Xylora, a friendly, creative, and helpful AI assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I didn't get a response.";

    document.getElementById(loadingId)?.remove();
    addMessage("ai", reply);
  } catch (error) {
    console.error("Groq API error:", error);
    document.getElementById(loadingId)?.remove();
    addMessage("ai", "Oops! Something went wrong. Please try again.");
  }
}
