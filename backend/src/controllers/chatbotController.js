const generateChatResponse = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    // Filter and map messages to Gemini roles ('user' or 'model')
    // Ensure the conversation alternates and starts with 'user'
    let contents = [];
    
    // Inject system instruction if it's a new conversation or ensure it's there
    // For simplicity, we just add it to the start of history
    contents.push({
      role: "user",
      parts: [{ text: "SYSTEM: You are Placify AI, a smart career and placement assistant. Respond concisely, use bullet points, and provide markdown formatting." }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I am Placify AI. How can I assist you today?" }]
    });

    for (const msg of messages) {
      const role = msg.role === "bot" ? "model" : "user";
      const lastRole = contents.length > 0 ? contents[contents.length - 1].role : null;
      
      if (role === lastRole) {
          // If the role is the same, append text to previous part to maintain alternation
          contents[contents.length - 1].parts[0].text += "\n" + msg.text;
      } else {
          contents.push({
            role: role,
            parts: [{ text: msg.text }]
          });
      }
    }

    // Direct REST API call using the v1beta endpoint (most stable for 1.5 models)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Detail:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response at the moment.";
    
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
};

module.exports = { generateChatResponse };
