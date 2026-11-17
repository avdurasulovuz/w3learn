// Vercel Serverless Function: /api/chat
// Supports OpenAI (ChatGPT) and fallback contextual AI responses

export default async function handler(req, res) {
  // CORS sarlavhalari
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

  // 1. OpenAI API kalitini tekshirish (Vercel muhitidan yoki foydalanuvchi kiritganidan)
  const activeKey = apiKey || process.env.OPENAI_API_KEY;

  if (activeKey) {
    try {
      const systemPrompt = `Siz W3Learn dasturlash ta'lim platformasining shaxsiy sun'iy intellekt ustozi (AI Mentor) siz.
Hozirgi mavzu konteksti: ${pageContext || 'Umumiy dasturlash'}.
Vazifangiz:
1. O'quvchiga savollariga aniq, qisqa, sodda va o'zbek tilida javob berish.
2. Kod misollari so'ralsa, eng toza va zamonaviy sintaksisda ko'rsatish.
3. Agar kodda xato bo'lsa, xatoni tushuntirib, to'g'irlangan variantini berish.
4. Javoblaringizni markdown formatida yozing (kodlarni \`\`\` til kodi bloklariga oling).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
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
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('OpenAI Error:', errData);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  }

  // 2. Agar API kaliti kiritilmagan bo'lsa yoki xato bersa — aqlli mahalliy javob qaytarish
  const fallbackReply = generateSmartFallback(message, pageContext);
  return res.status(200).json({ reply: fallbackReply, source: 'local' });
}

function generateSmartFallback(message, context = '') {
  const q = message.toLowerCase();
  const topic = context ? context.toUpperCase() : 'DASTURLASH';

  if (q.includes('salom') || q.includes('assalom') || q.includes('qalaysan')) {
    return `Assalomu alaykum! Men W3Learn AI mentoriman. Bugun **${topic}** bo'yicha qanday mavzuni o'rganamiz yoki qaysi kodni tekshiramiz? 😊`;
  }

  if (q.includes('xato') || q.includes('ishlamayapti') || q.includes('error')) {
    return `Kodingizda xatolik bormi? Xavotir olmang! Dasturlashda eng ko'p uchraydigan 3 ta xato:\n\n1. Ochilgan teglar yoki qavslarning yopilmay qolishi (\`</teg>\` yoki \`}\`)\n2. O'zgaruvchi yoki funksiya nomidagi orfografik xatoliklar\n3. Qo'shtirnoqlar yoki nuqta-vergullarning to'g'ri qo'yilmasligi.\n\nKodingizni menga yuboring, birgalikda tekshirib beraman! 🧐`;
  }

  if (q.includes('misol') || q.includes('kod')) {
    return `Mana **${topic}** bo'yicha amaliy va toza kod namunasi:\n\n\`\`\`html\n<div class="box">\n  <h3>Salom, Dunyo!</h3>\n  <p>Bu W3Learn misoli.</p>\n</div>\n\`\`\`\n\nBuni sahifadagi kod tahrirlash oynasiga qo'yib, pastda natijasini ko'rishingiz mumkin! 🚀`;
  }

  return `Savolingiz: **"${message}"**\n\n**${topic}** bo'yicha asosiy maslahat: har bir yangi buyruqni bevosita amaliyotda yozib ko'rish eng tez o'rganish usulidir. Sahifadagi kod blokida tahrir qilib, natijani jonli kuzating!\n\n*(Agar to'liq ChatGPT ulanishini xohlasangiz, chat tepasidagi ⚙️ tugmasi orqali OpenAI API kalitingizni kiriting).*`;
}
