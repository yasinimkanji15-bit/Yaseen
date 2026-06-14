const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "setmenuimg",
    alias: ["setbotdp", "botdp", "changemenu"],
    description: "Update the visual thumbnail for all YAS-TECH menus.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return sock.sendMessage(chatId, { text: "❌ *Access Denied: Owner Only*" });

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.imageMessage) {
            return await sock.sendMessage(chatId, { text: "📷 *Error:* Please reply to an image with .botdp" });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            // Using the native Baileys downloader
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!global.botConfig) global.botConfig = {};
            
            // 💉 Injecting the raw Buffer
            global.botConfig.menuThumb = buffer;

            await sock.sendMessage(chatId, { text: "✅ *MENU IMAGE UPDATED*\n\n> Your new image is cool. Test it with `.menu`." });
            await sock.sendMessage(chatId, { react: { text: '🖼️', key: message.key } });

        } catch (err) {
            await sock.sendMessage(chatId, { text: "❌ *Injection Error:* " + err.message });
        }
    }
};
