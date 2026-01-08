export default async function handler(req, res) {
  // 1. CORS İcazələri
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    // YENİ URL: router.huggingface.co istifadə edirik
    // Model: Meta Llama 3.2 3B Instruct (Daha yüngül və sürətlidir)
    const API_URL = "https://router.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct";
    
    const response = await fetch(API_URL, {
      headers: { 
        "Authorization": `Bearer ${process.env.HF_TOKEN}`, // Token mütləq olmalıdır
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: message,
        parameters: { 
          max_new_tokens: 500,
          return_full_text: false 
        },
        options: { 
          wait_for_model: true, // Model soyuqdursa gözləsin
          use_cache: false 
        }
      }),
    });

    // Əgər API-dən xəta gəlsə, onu mətn kimi oxuyub ekrana verək
    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `HF Xətası (${response.status}): ${errorText}` });
    }

    const data = await response.json();

    // Cavab formatını yoxlayıb götürürük
    let aiReply = "";
    if (Array.isArray(data) && data[0].generated_text) {
        aiReply = data[0].generated_text;
    } else if (data.generated_text) {
        aiReply = data.generated_text;
    } else {
        // Əgər cavabın içində generated_text yoxdursa
        aiReply = JSON.stringify(data);
    }

    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    return res.status(500).json({ error: "Server kodu xətası: " + error.message });
  }
}
