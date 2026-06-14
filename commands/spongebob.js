const axios = require('axios');

module.exports = {
    name: "spongebob",
    alias: ["sbob", "meme"],
    description: "Generate a Spongebob 'Mocking' meme with custom text.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const text = args.join(" ");

        // --- 🟢 YASEEN－ＭＤ  ＭＥＭＥ  ＭＡＮＵＡＬ ---
        if (!text) {
            const manual = `✦═══════════════════════◆
🧽  *YASEEN  ＭＥＭＥ  ＧＥＮ*
✦═══════════════════════◆

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Create a Spongebob mocking meme.

🛰️  *ＵＳＡＧＥ:*
> *${prefix}spongebob [your text]*

💡  *ＥＸＡＭＰＬＥ:*
> *${prefix}spongebob i am a professional hacker*

✦═══════════════════════◆
_© 2026 YAS-TECH • Visual Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            // 🛰️ The URL you found
            const imageURL = `https://apis.prexzyvilla.site/imagecreator/spongebob?text=${encodeURIComponent(text)}`;

            // 🖼️ Caption with forced signature
            const caption = `🧽 *YASEEN  ＭＥＭＥ  ＲＥＰＯＲＴ*\n\n` +
                            `According to my creator YASEEN, your request has been processed into a visual mockery.\n\n` +
                            `> 📍 *Text:* ${text}\n` +
                            `*🛡️ YASEEN－ＭＤ 🛡️*`;

            // 🚀 Send the Image directly via the URL
            await sock.sendMessage(from, { 
                image: { url: imageURL }, 
                caption: caption 
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("Meme Error:", err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(from, { 
                text: "❌ *CORE ERROR:* Visual synthesis failed. The meme server is offline." 
            }, { quoted: message });
        }
    }
};
