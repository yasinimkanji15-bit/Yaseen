const axios = require('axios');

module.exports = {
    name: "tnd",
    alias: ["truth", "dare", "tod"],
    description: "Get Truth or Dare questions with difficulty levels.",
    category: "games",

    execute: async (sock, chatId, message, args) => {
        const type = args[0]?.toLowerCase(); // truth or dare
        const level = args[1]?.toLowerCase(); // pg or r

        // 🟢 THE NEW IMPROVED MANUAL
        if (!type || (type !== 'truth' && type !== 'dare')) {
            const manual = `🎭 *Truth or Dare: Multi-Level* 🎭

Choose your game mode and the "heat" level!

✦═════════◆═════════✦

*1. NORMAL MODE (Safe for everyone)*
> • \`.tnd truth pg\`
> • \`.tnd dare pg\`

*2. MATURE MODE (18+ / Spicy)*
> • \`.tnd truth r\`
> • \`.tnd dare r\`

✦═════════◆═════════✦

_Tip: If you don't specify a level, it defaults to Normal (PG)._

«.tnd truth pg | .tnd dare r»`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // Set default rating to PG if user forgets to type it
        const rating = (level === 'r' || level === 'mature') ? 'r' : 'pg';

        try {
            await sock.sendMessage(chatId, { react: { text: '🎲', key: message.key } });

            // Fetching from API with the selected rating
            const apiUrl = `https://api.truthordarebot.xyz/v1/${type}?rating=${rating}`;
            const response = await axios.get(apiUrl);
            
            if (!response.data || !response.data.question) {
                throw new Error("Invalid API response");
            }

            const question = response.data.question;
            const modeName = rating === 'r' ? '🔥 MATURE' : '✅ NORMAL';

            let replyText = `> 🎭 *${type.toUpperCase()} - ${modeName}* 🎭\n\n`;
            replyText += `✨ ${question}\n\n`;
            replyText += `───────────────────\n`;
            replyText += `*YAS-TECH*`;

            await sock.sendMessage(chatId, { text: replyText }, { quoted: message });
            
            // Success reaction based on level
            const reactEmoji = rating === 'r' ? '🌶️' : '🎮';
            await sock.sendMessage(chatId, { react: { text: reactEmoji, key: message.key } });

        } catch (error) {
            console.error("TND API Error:", error.message);
            await sock.sendMessage(chatId, { text: "❌ API Connection Error. Try again in a moment." });
        }
    }
};
