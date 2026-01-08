export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    // MODELLƏR: "meta-llama/Llama-3.2-1B-Instruct" və ya "mistralai/Mistral-7B-Instruct-v0.3"
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
      headers: { 
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: message,
        parameters: { max_new_tokens: 250 },
        options: { wait_for_model: true }
      }),
    });

    const data = await response.json();

    // Hugging Face bəzən massiv, bəzən obyekt qaytarır, bunu yoxlayaq:
    let aiReply = "";
    if (Array.isArray(data)) {
      aiReply = data[0].generated_text;
    } else if (data.generated_text) {
      aiReply = data.generated_text;
    } else if (data.error) {
      return res.status(500).json({ error: "HF API Xətası: " + data.error });
    }

    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    // Əgər cavab JSON deyilsə buraya düşəcək
    return res.status(500).json({ error: "Server xətası: " + error.message });
  }
}
