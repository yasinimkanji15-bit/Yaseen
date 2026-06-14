const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');

module.exports = {
    name: "caption",
    alias: ["meme", "textonimage"],
    description: "Burn a caption into an image or sticker.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const msg = message.message;
        const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // 1. Check for Media (Image or Sticker)
        const isMedia = msg?.imageMessage || msg?.stickerMessage;
        const isQuotedMedia = quoted?.imageMessage || quoted?.stickerMessage;
        const text = args.join(' ');

        if ((!isMedia && !isQuotedMedia) || !text) {
            const manual = `🎨 *YASEEN－ＭＤ  ＣＡＰＴＩＯＮ*

> *“Injecting data into visual media.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
Burns a custom caption into any image or sticker.
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• Reply to an image/sticker with \`.caption [text]\`
• Send an image with \`.caption [text]\`

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

            // 2. Download the Media
            const target = isMedia ? msg : quoted;
            const type = target.imageMessage ? 'image' : 'sticker';
            const stream = await downloadContentFromMessage(target[type + 'Message'], type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // 3. Upload to Catbox (to get a URL for the API)
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, { filename: `YASEEN.${type === 'image' ? 'jpg' : 'webp'}` });
            
            const catRes = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders(),
            });
            const imageUrl = catRes.data.trim();

            // 4. Use PopCat Meme API
            // This puts the text at the top (like a classic meme)
            const captionedUrl = `https://api.popcat.xyz/meme?image=${encodeURIComponent(imageUrl)}&upper=${encodeURIComponent(text)}&lower=`;

            // 5. Dispatch back to Chat
            await sock.sendMessage(chatId, { 
                image: { url: captionedUrl }, 
                caption: `🖌️ *ＣＡＰＴＩＯＮ  ＩＮＪＥＣＴＥＤ*\n\n> ${text}\n\n*🛡️ YASEEN－ＭＤ 🛡️*` 
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(chatId, { text: "❌ *NODE REJECTION:* Media buffer too heavy or API down." });
        }
    }
};
