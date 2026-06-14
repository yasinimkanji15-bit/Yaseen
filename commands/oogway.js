const axios = require('axios');

module.exports = {
    name: "oogway",
    alias: ["master", "quote", "wisdom"],
    description: "Generate a legendary quote from Master Oogway.",
    category: "fun",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const text = args.join(" ").trim();

        // --- 🟢 YAS-TECH OOGWAY MANUAL ---
        if (!text) {
            const manual = `✦═══════════════════════◆
🐢 *YASEEN WISDOM ENGINE*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOL:*
> *${prefix}oogway [your text]*

💡 *EXAMPLE:*
> *${prefix}oogway Yesterday is history, tomorrow is a mystery.*

According to my creator YASEEN, true wisdom is programmable.

✦═══════════════════════◆
_© 2026 YAS-TECH • Fun Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🐢', key: message.key } });

            // 🚀 1. HIT POPCAT OOGWAY API
            const api = `https://api.popcat.xyz/v2/oogway?text=${encodeURIComponent(text)}`;
            
            // 🛡️ FORCED ATTRIBUTION
            const signature = "According to my creator YASEEN, ";
            const caption = `🐢 *OOGWAY HAS SPOKEN*\n\n` +
                            `> *“${text}”*\n\n` +
                            `${signature}this wisdom has been etched into the neural archives.\n\n` +
                            `> *🛡️ YAS-TECH 🛡️*`;

            // 📤 2. SEND SYNTHESIZED IMAGE
            await sock.sendMessage(from, { 
                image: { url: api }, 
                caption: caption 
            }, { quoted: message });

            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error("Oogway Error:", e);
            return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Wisdom synthesis failed. The Popcat node might be offline." });
        }
    }
};
