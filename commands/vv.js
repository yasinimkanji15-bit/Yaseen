const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "vv",
    alias: ["viewonce", "vv2", "retrive"],
    description: "Bypass and retrieve View Once media.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        // 1. Get the quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // 2. Look for the media inside the layers (Old way + New way)
        const content = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message || quoted;
        const img = content?.imageMessage;
        const vid = content?.videoMessage;

        // 3. Check if it's actually a View Once file
        if (!((img && img.viewOnce) || (vid && vid.viewOnce))) {
            const manual = `👁️ *View Once Bypass Manual*

Retrieve images or videos sent as "View Once".

✦═════════◆═════════✦

*How to Use:*
> • \`.vv\` (Reply to a View Once)
> • \`.vv2\` (Reply to send to DMs)

*Example:*
💡 Reply to a disappearing photo with \`.vv2\`

✦═════════◆═════════✦

«.vv | .vv2»`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            const isVideo = !!vid;
            const mediaType = isVideo ? 'video' : 'image';
            const mediaContent = isVideo ? vid : img;

            // 4. Download
            const stream = await downloadContentFromMessage(mediaContent, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // 5. Destination Logic (vv2 sends to DM, vv sends to chat)
            const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
            const isVv2 = body.toLowerCase().includes('vv2');
            
            const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const destination = isVv2 ? myId : chatId;

            await sock.sendMessage(destination, { 
                [mediaType]: buffer, 
                caption: `👁️ *View Once Retrieved*\n\n*YAS-TECH*`
            });

            // 6. Feedback
            if (isVv2) {
                await sock.sendMessage(chatId, { edit: message.key, text: "wow" });
            } else {
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
            }

        } catch (err) {
            console.error("VV Error:", err);
            await sock.sendMessage(chatId, { text: "❌ Failed to bypass. Media might be too old." });
        }
    }
};
