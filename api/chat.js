export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Yalnız POST' });

  const { message } = req.body;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
      headers: { 
        Authorization: `Bearer ${process.env.HF_TOKEN}`, // Yeni tokeni Vercel-ə HF_TOKEN olaraq əlavə edin
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
        parameters: { max_new_tokens: 500, return_full_text: false }
      }),
    });

    const data = await response.json();
    
    // Hugging Face birbaşa mətni massiv daxilində qaytarır
    const aiResponse = data[0].generated_text;

    return res.status(200).json({ reply: aiResponse });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
