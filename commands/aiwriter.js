const axios = require('axios');

module.exports = {
    name: "writer",
    alias: ["dalle", "aw"],
    description: "Professional image generation with prompt revision.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const prompt = args.join(" ");

        if (!prompt) {
            const manual = `✍️ *YASEEN－ＭＤ  ＷＲＩＴＥＲ*\n\n> *“DALL-E 3 Precision Rendering.”*\n\n✦═════════════════════◆\n📑 *ＣＯＭＭＡＮＤＳ:*\n> • .writer [description]\n\n⚙️ *ＥＮＧＩＮＥ:* AI-Writer (DALL-E 3)\n✦═════════════════════◆\n\n*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '✍️', key: message.key } });
            const apiUrl = `https://apis.prexzyvilla.site/ai/aiwriter-image?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl, { timeout: 45000 });

            // Deep extraction for AI-Writer structure
            const data = response.data.result?.data;
            const imageUrl = data?.url;
            const revised = data?.revised_prompt;

            if (!imageUrl) throw new Error("Key Mismatch: " + JSON.stringify(response.data).slice(0, 100));

            let caption = `✍️ *YASEEN－ＭＤ  ＷＲＩＴＥＲ*\n\n> *“${prompt}”*`;
            if (revised) caption += `\n\n📝 *Revised:* _${revised.slice(0, 200)}..._`;
            caption += `\n\n> ⚡ *Status:* High-Def Rendering`;

            await sock.sendMessage(from, { image: { url: imageUrl }, caption }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *WRITER ERROR:* ${err.message}` });
        }
    }
};
