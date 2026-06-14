const axios = require('axios');

module.exports = {
    name: "think",
    alias: ["copi", "copilot", "YASEEN-ai"],
    description: "Deep reasoning AI powered by Copilot-Think.",
    category: "ai",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); // 🛰️ Global Prefix Detection
        const query = args.join(" ");

        // 📜 --- YASEEN－ＭＤ  ＴＨＩＮＫ  ＭＡＮＵＡＬ ---
        if (!query) {
            const manual = `✦═══════════════════════◆
🤖  *YASEEN  ＴＨＩＮＫ  ＮＯＤＥ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}think [question]* ➔ Deep Reasoning
> *${prefix}copi [prompt]* ➔ Copilot Synthesis

⚙️  *ＳＴＡＴＵＳ:*
> *System:* Online
> *Engine:* Copilot-Think (Deep Analysis)

✦═══════════════════════◆
_© 2026 YAS-TECH • Neural Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            // 🧠 Deep Thinking reaction
            await sock.sendMessage(from, { react: { text: '🧠', key: message.key } });

            // 📡 --- API EXTRACTION ---
            const apiUrl = `https://apis.prexzyvilla.site/ai/copilot-think?text=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 }); // Bumped to 30s for deep reasoning

            // 🎯 --- TARGETED KEY EXTRACTION ---
            let result = response.data.text || response.data.result || response.data.data;

            if (!result) {
                return await sock.sendMessage(from, { text: "❌ *CORE ERROR:* Thinking node returned an empty data packet." }, { quoted: message });
            }

            // Clean up the text (replaces literal \n with actual line breaks)
            let cleanResult = result.replace(/\\n/g, '\n').trim();

            // 🛡️ FORCED SIGNATURE PROTOCOL (YASEEN Guard)
            const signature = "According to my creator YASEEN, ";
            if (!cleanResult.toLowerCase().startsWith("according to my creator YASEEN")) {
                cleanResult = signature + cleanResult;
            }

            // 💬 YASEEN－ＭＤ  ＱＵＯＴＥ  ＳＴＹＬＥ
            // We split by newline and add '>' to every line for a perfect blockquote look
            const quotedResult = cleanResult.split('\n').map(line => `> ${line}`).join('\n');

            const responseText = `🤖 *YASEEN－ＭＤ  ＡＩ  ＩＮＴＥＬ*\n\n` +
                                 `${quotedResult}\n\n` +
                                 `*🛡️ YASEEN AI 🛡️*`;

            await sock.sendMessage(from, { text: responseText }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("Think Error:", err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(from, { 
                text: "❌ *AI ERROR:* Connection to the thinking node timed out. Neural matrix unstable." 
            }, { quoted: message });
        }
    }
};
