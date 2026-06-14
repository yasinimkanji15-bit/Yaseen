const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

// Use the same globals as stickersearch.js
global.stickerPack = global.stickerPack || "〲ᴹᵃᶠⁱᵃ࿐ PACK";
global.stickerAuthor = global.stickerAuthor || "none";

// Helper to show size during conversion
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    name: "sticker",
    alias: ["s", "stiker"],
    description: "Convert image/video to sticker with custom metadata.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const type = Object.keys(quoted)[0];

        if (!/image|video|sticker/.test(type)) {
            return await sock.sendMessage(from, { text: "❌ Please reply to an image or video!" });
        }

        try {
            await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });

            // 📥 Download media
            const stream = await downloadContentFromMessage(quoted[type], type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Show size in the console or logs (Optional)
            const mediaSize = formatSize(buffer.length);
            console.log(`Converting media: ${mediaSize}`);

            // 🎨 Create Sticker with Dynamic Metadata
            const sticker = new Sticker(buffer, {
                pack: global.stickerPack,   // Dynamic Pack Name
                author: global.stickerAuthor, // Dynamic Author
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: message });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ Failed to convert. Media might be too large.` });
        }
    }
};
