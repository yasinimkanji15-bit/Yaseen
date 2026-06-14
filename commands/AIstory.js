const axios = require('axios');

// 🧠 Persistent session settings - UPDATED TO MATCH API EXACTLY
let storySettings = {
    mode: "Any genre",
    length: "Short",
    creative: "Medium"
};

module.exports = {
    name: "storyai",
    alias: ["story", "write", "adv"],
    description: "Advanced narrative synthesis with exact parameter matching.",
    category: "ai",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const action = args[0]?.toLowerCase();

        // --- 🟢 YASEEN－ＭＤ  ＳＴＯＲＹ  ＡＩ  ＭＡＮＵＡＬ ---
        if (!args[0]) {
            const manual = `✦═══════════════════════◆
📝  *YASEEN  ＳＴＯＲＹ  ＡＩ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}storyai [topic]* ➔ Generate Story
> *${prefix}storyai smode [type]* ➔ Set Genre
> *${prefix}storyai slen [size]* ➔ Set Length
> *${prefix}storyai scred [level]* ➔ Set Creativity

⚙️  *ＣＵＲＲＥＮＴ  ＣＯＮＦＩＧ:*
> *Mode:* ${storySettings.mode} | *Len:* ${storySettings.length} | *Cred:* ${storySettings.creative}

✦═══════════════════════◆
_© 2026 YAS-TECH • Narrative Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🛠️ SETTINGS HANDLER ---
        if (action === "smode") {
            // If user types 'Any', we force it to 'Any genre' for the API
            let inputMode = args.slice(1).join(" ");
            storySettings.mode = (inputMode.toLowerCase() === "any") ? "Any genre" : inputMode;
            return sock.sendMessage(from, { text: `✅ *SYSTEM:* Genre set to _${storySettings.mode}_` });
        }
        if (action === "slen") {
            storySettings.length = args[1] || "Short";
            return sock.sendMessage(from, { text: `✅ *SYSTEM:* Length set to _${storySettings.length}_` });
        }
        if (action === "scred") {
            storySettings.creative = args[1] || "Medium";
            return sock.sendMessage(from, { text: `✅ *SYSTEM:* Creativity set to _${storySettings.creative}_` });
        }

        // --- 🚀 STORY GENERATION ---
        try {
            await sock.sendMessage(from, { react: { text: '✍️', key: message.key } });

            const query = args.join(" ");
            
            // 🛠️ USING AXIOS PARAMS FOR CLEANEST DELIVERY
            const response = await axios.get("https://apis.prexzyvilla.site/ai/advanced", {
                params: {
                    text: query,
                    mode: storySettings.mode,
                    length: storySettings.length,
                    creative: storySettings.creative
                },
                timeout: 50000 
            });
            
            if (!response.data || !response.data.data) {
                throw new Error("API returned empty data.");
            }

            const story = response.data.data.story;

            // 🛡️ FORCED SIGNATURE
            const signature = "According to my creator YASEEN, ";
            let finalOutput = story.trim();
            if (!finalOutput.toLowerCase().startsWith("according to my creator YASEEN")) {
                finalOutput = signature + finalOutput;
            }

            let report = `📝 *YASEEN  ＳＴＯＲＹ  ＡＩ  ＩＮＴＥＬ*\n\n`;
            report += `${finalOutput}\n\n`;
            report += `> 📍 *Config:* ${storySettings.mode} | ${storySettings.length} | ${storySettings.creative}\n\n`;
            report += `*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { text: report }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("StoryAI Debug:", err.response?.data || err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            
            const errorDetail = err.response?.status === 500 
                ? "Server Internal Error (Check if parameters match API expectations)." 
                : err.message;

            await sock.sendMessage(from, { 
                text: `❌ *CORE ERROR:* ${errorDetail}` 
            }, { quoted: message });
        }
    }
};
