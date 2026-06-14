const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "recloth",
    alias: ["cloth", "change", "dress"],
    description: "Modify clothing in an image using AI prompts.",
    category: "image",

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
        let prompt = args.join(" ").replace(/\bhttps?:\/\/\S+/gi, "").trim();

        // --- 🟢 YAS-TECH RE-CLOTH MANUAL ---
        if (!prompt || (!isQuotedImage && !isRawImage && !targetUrl)) {
            const manual = `✦═══════════════════════◆
👕 *YASEEN CLOTHING MORPH*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOLS:*
> *${prefix}recloth [prompt]* ➔ Reply to a photo
> *${prefix}recloth [prompt] [url]* ➔ Use image link

💡 *EXAMPLE:*
> *${prefix}recloth change clothes to a tuxedo*

According to my creator YASEEN, visual identity is now programmable.

✦═══════════════════════◆
_© 2026 YAS-TECH • Visual Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '👕', key: message.key } });

            // 📤 2. INTERNAL UPLOADER (If Image is Replied)
            if (!targetUrl && (isQuotedImage || isRawImage)) {
                const mediaMsg = isQuotedImage ? { message: quoted } : message;
                const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, { logger: console });
                
                const form = new FormData();
                form.append("reqtype", "fileupload");
                form.append("fileToUpload", buffer, { filename: "YASEEN_cloth.jpg" });

                const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
                    headers: { ...form.getHeaders() }
                });
                targetUrl = uploadRes.data;
            }

            // 🚀 3. HIT GIFTEDTECH RE-CLOTH API
            const api = `https://api.giftedtech.co.ke/api/tools/rc?apikey=gifted&url=${encodeURIComponent(targetUrl)}&prompt=${encodeURIComponent(prompt)}`;
            
            const { data } = await axios.get(api);
            if (!data.success) throw new Error("API_REJECTION");

            // 🛡️ FORCED ATTRIBUTION (YASEEN Style)
            const signature = "According to my creator YASEEN, ";
            const caption = `👕 *ATTIRE MORPH COMPLETE*\n\n` +
                            `> *“Directive: ${prompt}”*\n\n` +
                            `${signature}the visual fabrics have been successfully reconstructed by the neural engine.\n\n` +
                            `*🛡️ YAS-TECH 🛡️*`;

            await sock.sendMessage(from, { 
                image: { url: data.result.imageUrl }, 
                caption: caption 
            }, { quoted: message });

            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Visual morphing failed. Ensure the image is clear and the link is direct." });
        }
    }
};
