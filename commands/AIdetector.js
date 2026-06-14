const axios = require('axios');

module.exports = {
    name: "detect",
    alias: ["checkai", "aidetect"],
    description: "Analyze text patterns to identify AI generation.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); // 🛰️ Global Prefix Detection
        const textToCheck = args.join(" ");

        // --- 🟢 YASEEN－ＭＤ  ＤＥＴＥＣＴ  ＭＡＮＵＡＬ ---
        if (!textToCheck) {
            const manual = `✦═════════◆═════════✦
🛡️  *YASEEN  ＤＥＴＥＣＴＯＲ* 🛡️
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Analyze text patterns to identify AI generation.

🛰️  *ＵＳＡＧＥ:*
> *${prefix}detect [paste long text here]*

💡  *ＨＩＮＴ:*
Provide at least 20+ characters for high accuracy.

✦═══════════════════════◆
_© 2026 YAS-TECH • Security Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });

            // 🛰️ Fetching from the Prexzy Detector Endpoint
            const response = await axios.get(`https://apis.prexzyvilla.site/ai/aidetector?text=${encodeURIComponent(textToCheck)}`);
            
            // Checking if the request was successful
            if (response.data.status === false || response.data.statusCode === 400) {
                return await sock.sendMessage(from, { 
                    text: `⚠️ *SYSTEM HINT:* ${response.data.error || "Text too short."}\n_${response.data.hint || ""}_` 
                }, { quoted: message });
            }

            // 🛠️ Updated logic to match your new JSON structure
            const result = response.data.analysis;
            const source = response.data.raw_data?.source_details;

            // 🖼️ Format in YAS-TECH Vertical Style
            let report = `🛡️ *YASEEN  ＡＩ  ＤＥＴＥＣＴＩＯＮ*\n\n`;
            report += `According to my creator YASEEN, here is the analysis of the provided frequency:\n\n`;
            report += `> 📍 *AI Probability:* ${result.ai_percentage_formatted}\n`;
            report += `> 📍 *Human Score:* ${result.human_percentage_formatted}\n`;
            report += `> 📍 *Classification:* ${result.classification.toUpperCase()}\n`;
            
            if (source) {
                report += `> 📍 *Source Type:* ${source.source}\n`;
                report += `> 📍 *Confidence:* ${source.confidence}%\n`;
            }

            report += `\n*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { text: report }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(from, { 
                text: "❌ *CORE ERROR:* The detection link is unstable or returned invalid data." 
            }, { quoted: message });
        }
    }
};
