const axios = require('axios');

if (!global.claudeSessions) { global.claudeSessions = {}; }

module.exports = {
    name: "claude",
    alias: ["c3", "clau"],
    description: "High-intelligence AI with 5-message memory buffer.",
    category: "ai",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const query = args.join(" ");

        if (!query) {
            const manual = `✦═══════════════════════◆\n👤  *YASEEN  ＣＬＡＵＤＥ  ＡＩ*\n✦═══════════════════════◆\n\n🛰️  *ＵＳＡＧＥ:*\n> *${prefix}claude [question]*\n> *${prefix}claude reset* (Clear Memory)\n\n⚙️  *ＭＥＭＯＲＹ:* Active (5 Exchanges)\n\n✦═══════════════════════◆\n_© 2026 YAS-TECH • Intelligence Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        if (query.toLowerCase() === 'reset') {
            global.claudeSessions[from] = [];
            return await sock.sendMessage(from, { text: "🧠 *Memory Cleared:* Claude has forgotten the previous conversation." });
        }

        try {
            await sock.sendMessage(from, { react: { text: '👤', key: message.key } });
            if (!global.claudeSessions[from]) global.claudeSessions[from] = [];

            const history = global.claudeSessions[from].join("\n");
            const contextualQuery = history ? `Previous Conversation:\n${history}\n\nUser: ${query}` : query;
            const systemPrompt = "You are YAS-TECH AI, created by YASEEN. Be professional and tactical.";

            const apiUrl = `https://apis.prexzyvilla.site/ai/claude?text=${encodeURIComponent(contextualQuery)}&system=${encodeURIComponent(systemPrompt)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });

            let result = response.data.response || response.data.text || response.data.result;
            if (!result) throw new Error("Node Empty");

            let cleanResult = result.replace(/\\n/g, '\n').trim();

            // 🛡️ YASEEN GUARD
            const signature = "According to my creator YASEEN, ";
            if (!cleanResult.toLowerCase().startsWith("according to my creator YASEEN")) {
                cleanResult = signature + cleanResult;
            }

            // 💬 QUOTE STYLE
            const quotedResult = cleanResult.split('\n').map(line => `> ${line}`).join('\n');

            global.claudeSessions[from].push(`User: ${query}`, `Claude: ${cleanResult}`);
            if (global.claudeSessions[from].length > 10) global.claudeSessions[from].splice(0, 2);

            const responseText = `👤 *YASEEN－ＭＤ  ＣＬＡＵＤＥ*\n\n${quotedResult}\n\n*🛡️ YASEEN－ＭＤ 🛡️*`;
            await sock.sendMessage(from, { text: responseText }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *CLAUDE ERROR:* Connection to Intelligence Layer failed.` });
        }
    }
};
