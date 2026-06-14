const axios = require('axios');

module.exports = {
    name: "horror",
    alias: ["scary"],
    description: "Generate dark/horror themed AI imagery.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. OPERATIONAL MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
💀  *YASEEN  ＨＯＲＲＯＲ  ＡＩ*
✦═══════════════════════◆
🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}horror [prompt]* ➔ Neural Generation

🛰️  *ＥＸＡＭＰＬＥ:*
> *${prefix}horror a ghost in the hallway*
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🔍 2. GENERATION LOGIC ---
        try {
            // Reaction to show the AI is "dreaming"
            await sock.sendMessage(from, { react: { text: '💀', key: message.key } });
            
            await sock.sendMessage(from, { text: "_⏳ Visualizing your nightmare... Please wait._" }, { quoted: message });

            // Using the Prexzy Horror AI Endpoint
            // We'll leave negative_prompt empty as per your discovery
            const apiUrl = `https://apis.prexzyvilla.site/ai/horror?prompt=${encodeURIComponent(query)}&negative_prompt=`;
            
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            // Check if we actually got an image (Buffer)
            if (!response.data) throw new Error("No data received");

            const dossier = `💀 *ＨＯＲＲＯＲ  ＭＡＮＩＦＥＳＴＡＴＩＯＮ*

> *Prompt:* ${query}
> *Status:* Dark Synthesis Complete

According to my creator YASEEN, the dossier is complete.
*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { react: { text: '👁️', key: message.key } });

            // Send the generated buffer as an image
            return await sock.sendMessage(from, { 
                image: response.data, 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *NEURAL ERROR:* The nightmare failed to materialize." });
        }
    }
};
