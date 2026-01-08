export default async function handler(req, res) {
    // CORS Başlıqları - Bunu mütləq əlavə edin
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Preflight (OPTIONS) sorğusunu dərhal təsdiqləyirik
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Yalnız POST qəbul edirik
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir. Zəhmət olmasa birbaşa linkə girməyin, proqramdan istifadə edin.' });
    }

    const { message } = req.body;

    if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'API açarı tapılmadı (Backend konfiqurasiyası səhvdir)' });
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Sən faydalı bir köməkçisən." },
                    { role: "user", content: message }
                ],
                stream: false
            })
        });

        const data = await response.json();

        // DeepSeek-dən xəta gəlibsə, onu istifadəçiyə göstər
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Server xətası', details: error.message });
    }
}
