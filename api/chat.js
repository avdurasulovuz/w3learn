// Vercel Serverless Function: /api/chat
// Powered by Google Gemini 1.5 Flash (Rasmiy integratsiya)

const GEMINI_SERVER_KEY = "AIzaSyCbt9gFAN2HBA-w6OYvaTzNR8D5OPN7gCI";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Faqat POST so\'rov qabul qilinadi' });
  }

  const { message, pageContext } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Xabar kiritilmadi' });
  }

  const systemPrompt = `Siz W3Learn (O'zbek dasturlash o'quv platformasi)ning rasmiy Sun'iy Intellekt Ustozi (AI Mentor) siz.
Hozirgi o'rganilayotgan dars: ${pageContext || 'Dasturlash'}.
Asosiy qoidalar:
1. Har doim o'zbek tilida, do'stona, aniq va tushunarli javob bering.
2. Agar o'quvchi biror teg (masalan, <div>, <span>), funksiya yoki sintaksis haqida so'rasa, uning vazifasini sodda tilda tushuntiring va kichik amaliy kod namunasi bering.
3. Koddagi xatoni so'rasa, xatoni qayerdaligini ko'rsatib, to'g'ri variantini taqdim eting.
4. Javoblarni chiroyli Markdown formatida yozing (kodlarni \`\`\`html ... \`\`\` bloklariga oling).`;

  // 1. Google Gemini API chaqiruvi
  try {
    const key = process.env.GEMINI_API_KEY || GEMINI_SERVER_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nO'quvchi savoli: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200
          }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return res.status(200).json({ reply, source: 'gemini' });
      }
    } else {
      const err = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', err);
    }
  } catch (err) {
    console.error('Gemini Fetch Error:', err);
  }

  // 2. Favqulodda aqlli mahalliy zaxira (Fallback)
  const fallback = generateSmartFallback(message, pageContext);
  return res.status(200).json({ reply: fallback, source: 'fallback' });
}

function generateSmartFallback(message, context = '') {
  const q = message.toLowerCase();
  const topic = context ? context.toUpperCase() : 'DASTURLASH';

  if (q.includes('div')) {
    return `**HTML \`<div>\` elementi haqida:**\n\n\`<div>\` (division - bo'lim) — HTML dagi eng asosiy **blokli konteyner** tegi hisoblanadi. U boshqa elementlarni (matnlar, rasmlar, tugmalar) bitta blokga guruhlash va ularga CSS orqali stil berish uchun ishlatiladi.\n\n\`\`\`html\n<div style="background:#1e293b; color:#fff; padding:15px; border-radius:8px;">\n  <h3>Bu sarlavha</h3>\n  <p>Bu div konteyner ichidagi matn.</p>\n</div>\n\`\`\`\n\nUni sahifadagi kod tahrirlash oynasiga qo'yib, natijasini jonli ko'rishingiz mumkin! 🚀`;
  }

  if (q.includes('span')) {
    return `**HTML \`<span>\` elementi:**\n\n\`<span>\` — **qatorli (inline)** konteyner bo'lib, butun blokni emas, matnning aynan ma'lum bir so'zi yoki qismiga stil (masalan, alohida rang) berish uchun ishlatiladi.\n\n\`\`\`html\n<p>Bu matnda <span style="color:#04AA6D; font-weight:bold;">yashil so'z</span> mavjud.</p>\n\`\`\``;
  }

  if (q.includes('salom') || q.includes('assalom') || q.includes('qalaysan')) {
    return `Assalomu alaykum! Men sizning **${topic}** bo'yicha sun'iy intellekt ustozingizman. Qanday savolingiz bor? 😊`;
  }

  return `Savolingiz: **"${message}"**\n\n**${topic}** darsida har bir kodni to'g'ridan-to'g'ri tahrirlab ko'rishingiz mumkin. Natija pastdagi oynada bir zumda aks etadi! 💡`;
}
