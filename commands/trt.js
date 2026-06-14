const axios = require('axios');

module.exports = {
    name: "trt",
    alias: ["translate", "tafsiri", "sw"],
    description: "Translate text to Swahili or English.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        // 1. Get text from args or quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const textToTranslate = args.join(" ") || quoted?.conversation || quoted?.extendedTextMessage?.text;

        // 2. MANUAL (If no text is found)
        if (!textToTranslate) {
            const manual = `🌍 *Translator Manual (Tafsiri)*

Translate any message to Swahili or English instantly.

✦═════════◆═════════✦

*How to Use:*
> • \`.trt [text]\`
> • Reply to a message with \`.trt\`

*Examples:*
💡 \`.trt Good morning\` (Translates to Swahili)
💡 \`.trt Habari gani\` (Translates to English)

✦═════════◆═════════✦

«.trt | .tafsiri»`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🌍', key: message.key } });

            // 3. Logic: If it looks like Swahili, translate to English. Otherwise, translate to Swahili.
            // Using a free translation API
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=sw&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            let translated = res.data[0][0][0];

            // If the translation is the same as the original, it's already Swahili, so translate to English instead
            if (translated.toLowerCase() === textToTranslate.toLowerCase()) {
                const resEn = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(textToTranslate)}`);
                translated = resEn.data[0][0][0];
            }

            const resultText = `✨ *TRANSLATION* ✨\n\n*Original:* ${textToTranslate}\n*Result:* ${translated}\n\n*YAS-TECH*`;
            
            await sock.sendMessage(chatId, { text: resultText }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(chatId, { text: "❌ Connection error. Please try again later." });
        }
    }
};
