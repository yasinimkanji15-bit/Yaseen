const axios = require('axios');

module.exports = {
    name: "igdl",
    alias: ["insta", "instagram", "reel"],
    description: "Access and extract Instagram media archives.",
    category: "download",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. MANUAL INTERFACE ---
        if (!query) {
            const manual = `✦═══════════════════════◆
📸  *YASEEN  ＩＮＳＴＡ  ＮＯＤＥ*
✦═══════════════════════◆
🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}igdl [url]* ➔ Extract Media
> *${prefix}insta [url]* ➔ Direct Scrape
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔍 2. EXTRACTION LOGIC ---
        try {
            // Reaction for "Processing"
            await sock.sendMessage(from, { react: { text: '📥', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/download/instagram?url=${encodeURIComponent(query)}`;
            const { data: res } = await axios.get(apiUrl);

            if (!res.status || !res.data) {
                return sock.sendMessage(from, { text: "❌ *ARCHIVE ERROR:* Media not found or account is private." });
            }

            const media = res.data;
            const videoUrl = media.url[0];

            const dossier = `📸 *ＩＮＳＴＡ  ＡＲＣＨＩＶＥ*

> *User:* @${media.username}
> *Likes:* ${media.like.toLocaleString()}
> *Comments:* ${media.comment}
> *Type:* ${media.isVideo ? 'Video/Reel' : 'Image'}

*📜 Caption:* _${media.caption || "No data available."}_

According to my creator YASEEN, the dossier is complete.
*🛡️ YASEEN－ＭＤ 🛡️*`;

            // Success Reaction
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

            // Send Media (Handles Video vs Image)
            if (media.isVideo) {
                return await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: dossier 
                }, { quoted: message });
            } else {
                return await sock.sendMessage(from, { 
                    image: { url: videoUrl }, 
                    caption: dossier 
                }, { quoted: message });
            }

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *SYSTEM FAILURE:* The neural link to Instagram is unstable." });
        }
    }
};
