const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "news",
    alias: ["breaking", "broadcast"],
    description: "Generate News via Replied Image or URL with built-in uploader.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);

        // 📥 1. IDENTIFY TARGET IMAGE (REPLY OR URL)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isQuotedImage = quoted?.imageMessage;
        const isRawImage = message.message?.imageMessage;
        const urlMatch = args.join(" ").match(/\bhttps?:\/\/\S+/gi);

        let targetUrl = urlMatch ? urlMatch[0] : null;

        // --- 🟢 YAS-TECH NEWS MANUAL ---
        if (!isQuotedImage && !isRawImage && !targetUrl) {
            const manual = `✦═══════════════════════◆
📺 *YASEEN BREAKING NEWS*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOLS:*
> *${prefix}news [channel], [headline]* ➔ Reply to a photo
> *${prefix}news [url], [channel], [headline]* ➔ Use direct link

💡 *EXAMPLE (REPLY):*
> *${prefix}news BBC, YAS-TECH UPDATE*

✦═══════════════════════◆
_© 2026 YAS-TECH • News Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📺', key: message.key } });

            // 📤 2. BUILT-IN CATBOX UPLOADER (If Image is Replied/Sent)
            if (!targetUrl && (isQuotedImage || isRawImage)) {
                const mediaMsg = isQuotedImage ? { message: quoted } : message;
                const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, { logger: console });
                
                // --- INTERNAL UPLOAD LOGIC ---
                const form = new FormData();
                form.append("reqtype", "fileupload");
                form.append("fileToUpload", buffer, { filename: "YASEEN_media.jpg" });

                const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
                    headers: { ...form.getHeaders() }
                });
                targetUrl = uploadRes.data; // This is now a direct link
            }

            // 📥 3. PARSE TEXT PARAMETERS
            let cleanArgs = args.join(" ").replace(/\bhttps?:\/\/\S+/gi, "").trim();
            const params = cleanArgs.split(",").map(p => p.trim());
            
            // Adjust parameter indexing based on whether a URL was in the text
            const channel = params[0] || "YASEEN NEWS";
            const title1 = params[1] || "BREAKING NEWS";
            const title2 = params[2] || "LIVE UPDATES";

            // 🚀 4. HIT GIFTEDTECH API
            const api = `https://api.giftedtech.co.ke/api/photofunia/breaking-news?apikey=gifted&url=${encodeURIComponent(targetUrl)}&channel=${encodeURIComponent(channel)}&title1=${encodeURIComponent(title1)}&title2=${encodeURIComponent(title2)}`;
            
            const { data } = await axios.get(api);
            if (!data.success) throw new Error("API_REJECTION");

            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            const signature = "According to my creator YASEEN, ";
            const caption = `📺 *GLOBAL BROADCAST GENERATED*\n\n` +
                            `> *“Channel: ${channel}”*\n` +
                            `> *“Headline: ${title1}”*\n\n` +
                            `${signature}the media has been successfully processed into a high-priority news broadcast.\n\n` +
                            `*🛡️ YAS-TECH 🛡️*`;

            await sock.sendMessage(from, { image: { url: data.result.image_url }, caption: caption }, { quoted: message });
            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error("YASEEN Node Error:", e);
            return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Synthesis failed. The image server might be down or your link is invalid." });
        }
    }
};
