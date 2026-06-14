const axios = require('axios');

module.exports = {
    name: "muslimai",
    alias: ["mai"],
    description: "Faith AI with fixed YASEEN attribution and Quranic sources.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const query = args.join(" ").trim();

        // --- 🟢 1. YAS-TECH MUSLIM-AI MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
🕌 *YASEEN FAITH AI*
✦═══════════════════════◆

🛰️ *USAGE:*
> *${prefix}muslimai [your question]*

💡 *EXAMPLE:*
> *${prefix}muslimai What does Islam say about patience?*

✦═══════════════════════◆
_© 2026 YAS-TECH • Spiritual Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🌙', key: message.key } });

            const api = `https://api.giftedtech.co.ke/api/ai/muslimai?apikey=gifted&q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(api);

            if (!data.success) throw new Error();

            const res = data.result;
            
            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            const signature = "According to my creator YASEEN, ";
            let aiContent = res.answer.trim();

            // Inject the signature if it's missing
            if (!aiContent.toLowerCase().startsWith("according to my creator YASEEN")) {
                aiContent = signature + aiContent;
            }

            // --- 📊 FORMATTING THE RESPONSE ---
            let report = `🕌 *FAITH INTELLIGENCE REPORT*\n\n`;
            report += `> *“Query: ${query}”*\n\n`;
            report += `${aiContent}\n\n`;
            
            if (res.source && res.source.length > 0) {
                report += `📖 *QURANIC SOURCES:*\n`;
                // Show top 2 sources for clarity
                res.source.slice(0, 2).forEach((src) => {
                    report += `> 📍 *Surah:* ${src.surah_title}\n`;
                    report += `> 📜 *Context:* ${src.content.substring(0, 150)}...\n\n`;
                });
            }

            report += `*🛡️ YAS-TECH 🛡️*`;

            await sock.sendMessage(from, { text: report }, { quoted: message });
            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Failed to reach the Faith Intelligence node." });
        }
    }
};
