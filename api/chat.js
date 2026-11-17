// Vercel Serverless Function: /api/chat
// Supports Google Gemini API, OpenAI ChatGPT, and Smart Fallback

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

  const { message, pageContext, apiKey } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Xabar kiritilmadi' });
  }

  const activeKey = (apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

  const systemPrompt = `Siz W3Learn dasturlash platformasining shaxsiy sun'iy intellekt ustozi (AI Mentor) siz.
Mavzu konteksti: ${pageContext || 'Umumiy dasturlash'}.
Qoidalar:
1. O'quvchiga aniq, samimiy, sodda va toza o'zbek tilida javob bering.
2. Kod so'ralsa yoki xato ko'rsatilsa, eng zamonaviy va tushunarli formatda ko'rsating.
3. Javoblarni chiroyli Markdown formatida qaytaring (kodlarni \`\`\`til ... \`\`\` bloklariga oling).`;

  // 1. Google Gemini API (agar kalit AIza bilan boshlansa yoki Gemini sozlangan bo'lsa)
  if (activeKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
    const geminiKey = activeKey.startsWith('AIza') ? activeKey : process.env.GEMINI_API_KEY;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nFoydalanuvchi savoli: ${message}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
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
    } catch (e) {
      console.error('Gemini fetch error:', e);
    }
  }

  // 2. OpenAI (agar sk- bilan boshlansa)
  if (activeKey.startsWith('sk-') || process.env.OPENAI_API_KEY) {
    const openaiKey = activeKey.startsWith('sk-') ? activeKey : process.env.OPENAI_API_KEY;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, source: 'openai' });
        }
      }
    } catch (e) {
      console.error('OpenAI fetch error:', e);
    }
  }

  // 3. Fallback: Kengaytirilgan o'zbekcha dasturchi AI javobi
  const fallback = generateSmartFallback(message, pageContext);
  return res.status(200).json({ reply: fallback, source: 'local' });
}

function generateSmartFallback(message, context = '') {
  const q = message.toLowerCase();
  const topic = context ? context.toUpperCase() : 'DASTURLASH';

  if (q.includes('salom') || q.includes('assalom') || q.includes('qalaysan')) {
    return `Assalomu alaykum! Men W3Learn AI mentoriman (Gemini). Bugun **${topic}** bo'yicha qanday kod yozamiz yoki qaysi savolingizga javob beray? 😊`;
  }

  if (q.includes('xato') || q.includes('ishlamayapti') || q.includes('error')) {
    return `Kodingizda xatolik bormi? Xavotir olmang! Dasturlashda eng ko'p uchraydigan 3 ta sabab:\n\n1. Ochilgan teglar yoki qavslarning to'g'ri yopilmay qolishi (\`</teg>\` yoki \`}\`)\n2. O'zgaruvchi yoki klass nomidagi imlo xatolar\n3. Qo'shtirnoqlar juft emasligi.\n\nKodingizni menga yuboring, birgalikda to'g'rilaymiz! 🧐`;
  }

  if (q.includes('misol') || q.includes('kod') || q.includes('namuna')) {
    return `Mana **${topic}** bo'yicha toza va zamonaviy kod namunasi:\n\n\`\`\`html\n<div style="background:#04AA6D;color:#fff;padding:20px;border-radius:12px;text-align:center;">\n  <h2>Salom, W3Learn! 👋</h2>\n  <p>Bu jonli ishlaydigan kod namunasi.</p>\n  <button style="padding:10px 20px;background:#fff;color:#04AA6D;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">Bosing</button>\n</div>\n\`\`\`\n\nBuni sahifadagi kod tahrirlash oynasiga qo'yib ko'ring, natija pastda bir zumda aks etadi! 🚀`;
  }

  return `Savolingiz: **"${message}"**\n\n**${topic}** bo'yicha tavsiya: dasturlashda eng samarali o'rganish yo'li — kodni sahifadagi tahrirlagichda o'zgartirib, natijani jonli sinab ko'rishdir. \n\n*(Gemini API kalitingiz bo'lsa, chat tepasidagi 🔑 tugmasiga kiritishingiz mumkin, mutlaqo bepul!)*`;
}
