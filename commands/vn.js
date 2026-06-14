const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "vn",
    alias: ["ptt", "vnote"],
    description: "Convert audio to voice note or forward as voice note.",
    category: "utility",

    execute: async (sock, chatId, message, args) => {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mime = quoted?.audioMessage?.mimetype || message.message?.audioMessage?.mimetype;
        const prefix = global.botConfig.prefix || ".";

        // 🟢 Built-in Manual logic
        if (!quoted || !mime) {
            const vnManual = `🎙️ *YASEEN-ＭＤ ＶＮ ＭＡＮＵＡＬ*

Convert any audio file into a realistic WhatsApp Voice Note (Green Mic).

✦═════════◆═════════✦
✨ *HOW TO USE:*

1️⃣ *Convert in Chat:*
> Reply to an audio/song with \`${prefix}vn\`

2️⃣ *Forward to Secretly:*
> Reply to an audio and type \`${prefix}vn [number]\`
> _The receiver will see it as a fresh recording with no forward tag!_

*Example:*
💡 \`${prefix}vn 255789661031\`
✦═════════◆═════════✦

_© 2026 YASEEN Laporte_`;

            return await sock.sendMessage(chatId, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" },
                caption: vnManual 
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🎙️', key: message.key } });

            // Download the audio
            const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Determine Target: Current chat or a specific number
            let targetJid = chatId;
            const inputNumber = args[0]?.replace(/[^0-9]/g, '');
            
            if (inputNumber) {
                targetJid = inputNumber + "@s.whatsapp.net";
            }

            // Send as Voice Note (PTT: true makes it green and removes forward tag)
            await sock.sendMessage(targetJid, { 
                audio: buffer, 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: targetJid === chatId ? message : null });

            if (targetJid !== chatId) {
                await sock.sendMessage(chatId, { text: `✅ *Voice Note sent successfully to:* ${inputNumber}` });
            }

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("VN Error:", err);
            await sock.sendMessage(chatId, { text: "❌ *Failed to convert audio.*" });
        }
    }
};
