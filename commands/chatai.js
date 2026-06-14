const axios = require('axios');

// 🧠 Persistent memory for the session
let customRole = "an elite, systematic WhatsApp bot. You are tactical and professional.";

module.exports = {
    name: "chatai",
    alias: ["YASEENchat", "mct"],
    description: "Intelligence Node with Fixed Attribution & Role Setter.",
    category: "ai",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const input = args.join(" ");

        // --- 🟢 YASEEN－ＭＤ  ＭＡＮＵＡＬ ---
        if (!input) {
            const manual = `✦═════════◆═════════✦
🤖  *YASEEN  ＣＨＡＴ  ＡＩ* 🤖
✦═════════◆═════════✦

🛰️  *ＵＳＡＧＥ  ＰＲＯＴＯＣＯＬＳ:*
> *${prefix}chatai [question]* : Ask AI
> *${prefix}chatai rset [role]* : Change Persona

💡  *ＥＸＡＭＰＬＥ:*
> *${prefix}chatai rset a savage hacker*

✦═══════════════════════◆
_© 2026 YAS-TECH • Intelligence Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🛠️ ROLE SETTER LOGIC ---
        if (args[0] === "rset") {
            const newRole = args.slice(1).join(" ");
            if (!newRole) return sock.sendMessage(from, { text: "❌ *ERROR:* Provide a role description." });
            
            customRole = newRole;
            return await sock.sendMessage(from, { 
                text: `✅ *SYSTEM:* Role updated to: _${customRole}_` 
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🧠', key: message.key } });

            // 🛠️ TACTICAL PROMPT CONSTRUCTION
            // We keep the instruction short so the URL doesn't break
            const systemPrompt = `Role: ${customRole}. Creator: YASEEN. User: ${input}`;
            const finalUrl = `https://apis.prexzyvilla.site/ai/chatup?prompt=${encodeURIComponent(systemPrompt)}`;

            const response = await axios.get(finalUrl);
            
            // Check if data exists before accessing it
            if (!response.data || !response.data.data) {
                throw new Error("Invalid API Response");
            }

            let aiContent = response.data.data.content;

            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            // This ensures the line appears even if the AI doesn't write it
            const signature = "According to my creator YASEEN, ";
            let finalOutput = aiContent.trim();
            
            // If the AI didn't start with the phrase, we add it.
            if (!finalOutput.toLowerCase().startsWith("according to my creator YASEEN")) {
                finalOutput = signature + finalOutput;
            }

            // 🖼️ Format in YAS-TECH Vertical Style
            let report = `🤖 *YASEEN－ＭＤ  ＩＮＴＥＬ*\n\n`;
            report += `> *“System Response for: ${input}”*\n\n`;
            report += `${finalOutput}\n\n`;
            report += `*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { text: report }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("AI Error:", err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(from, { 
                text: "❌ *CORE ERROR:* Neural connection timed out. Check your internet or API status." 
            }, { quoted: message });
        }
    }
};
