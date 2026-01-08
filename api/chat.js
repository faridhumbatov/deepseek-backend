export default async function handler(req, res) {
  // CORS Tənzimləmələri
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    // DƏYİŞİKLİK: Daha yüngül və 100% pulsuz model (Microsoft Phi-3.5)
    const API_URL = "https://router.huggingface.co/models/microsoft/Phi-3.5-mini-instruct";
    
    const response = await fetch(API_URL, {
      headers: { 
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: message,
        parameters: { 
          max_new_tokens: 500,
          return_full_text: false 
        }
      }),
    });

    // Əgər API xəta qaytarsa
    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `HF Xətası (${response.status}): ${errorText}` });
    }

    const data = await response.json();

    // Cavabı götürürük
    let aiReply = "";
    if (Array.isArray(data) && data[0].generated_text) {
        aiReply = data[0].generated_text;
    } else if (data.generated_text) {
        aiReply = data.generated_text;
    } else {
        aiReply = "Cavab alınmadı.";
    }

    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    return res.status(500).json({ error: "Server kodu xətası: " + error.message });
  }
}
