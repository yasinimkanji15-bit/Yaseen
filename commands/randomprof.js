const axios = require('axios');

module.exports = {
    name: "rapics",
    alias: ["randompic"],
    description: "Get random aesthetic profile pictures.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;

        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0) || "."; 
        const input = args[0]?.toLowerCase();

        // 🟢 1. THE MANUAL (If no arguments provided)
        if (!args[0]) {
            const manual = `🖼️ *YASEEN-ＭＤ ＰＦＰ ＥＮＧＩＮＥ*

> *“Upgrade your presence with a single command.”*

✦═════════════════════✦
1️⃣ *Quick Pick (1 Pic):*
   > ${prefix}rapics s (only one profile pic)

2️⃣ *Custom Amount:*
   > ${prefix}rapics 20
   > _(Self-chat limit: 25 pics)_
✦═════════════════════✦

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // 🔵 2. LOGIC FOR QUANTITY
        let count = 1; 
        if (input === 's') {
            count = 1;
        } else if (!isNaN(parseInt(input))) {
            // Increased limit to 25 for your personal use
            count = Math.min(parseInt(input), 25); 
        } else {
            return sock.sendMessage(from, { text: `❌ Invalid input. Use \`${prefix}rapics s\` or a number.` });
        }

        await sock.sendMessage(from, { react: { text: '🚚', key: message.key } });

        try {
            // 🟠 3. THE IMAGE LOOP
            for (let i = 0; i < count; i++) {
                const apiUrl = `https://apis.prexzyvilla.site/random/profilepics?t=${Date.now() + i}`;

                await sock.sendMessage(from, { 
                    image: { url: apiUrl }, 
                    caption: `🖼️ *YASEEN-ＭＤ ＰＦＰ*\n✨ *Pick #${i + 1} of ${count}*\n_© 2026 YAS-TECH_` 
                });

                // ⏱️ SAFETY DELAY: 500ms between each send to keep the panel stable
                if (count > 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (count > 5) {
                await sock.sendMessage(from, { text: `✅ *Batch Complete:* ${count} images delivered.` });
            }

        } catch (e) {
            console.error("PFP Error:", e);
            await sock.sendMessage(from, { text: "❌ *Error:* The image delivery stream was interrupted." });
        }
    }
};
