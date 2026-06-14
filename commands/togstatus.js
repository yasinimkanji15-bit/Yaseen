const { downloadContentFromMessage, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const crypto = require('crypto');

// Function ya kudownload media
async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

module.exports = {
    name: "togstatus",
    alias: ["swgc", "gstatus", "gs"],
    description: "Post a status update directly to the group.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const from = chatId;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ This command only works in groups!" });
        }

        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const textAfter = args.join(" ").trim();

            if (!quoted && !textAfter) {
                return sock.sendMessage(from, { 
                    text: "💡 *HOW TO USE:*\n\n1. Reply to an image/video/audio with *.togstatus*\n2. Or type: *.togstatus Your Message*" 
                }, { quoted: m });
            }

            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            let payload = {};
            let type = "Text";

            if (quoted) {
                if (quoted.imageMessage) {
                    type = "Image";
                    const buffer = await downloadMedia(quoted.imageMessage, 'image');
                    payload = { image: buffer, caption: textAfter || quoted.imageMessage.caption || '' };
                } else if (quoted.videoMessage) {
                    type = "Video";
                    const buffer = await downloadMedia(quoted.videoMessage, 'video');
                    payload = { video: buffer, caption: textAfter || quoted.videoMessage.caption || '' };
                } else if (quoted.audioMessage) {
                    type = "Audio";
                    const buffer = await downloadMedia(quoted.audioMessage, 'audio');
                    payload = { audio: buffer, mimetype: 'audio/mp4', ptt: quoted.audioMessage.ptt };
                } else {
                    type = "Text";
                    payload = { text: quoted.conversation || quoted.extendedTextMessage?.text || "Status Update" };
                }
            } else {
                payload = { text: textAfter };
            }

            // --- SENDING THE RELAY MESSAGE ---
            const inside = await generateWAMessageContent(payload, { upload: sock.waUploadToServer });
            const messageSecret = crypto.randomBytes(32);
            
            const groupStatus = generateWAMessageFromContent(from, {
                messageContextInfo: { messageSecret },
                groupStatusMessageV2: { 
                    message: { ...inside, messageContextInfo: { messageSecret } } 
                }
            }, {});

            await sock.relayMessage(from, groupStatus.message, { messageId: groupStatus.key.id });

            await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error("TogStatus Error:", err);
            await sock.sendMessage(from, { text: "❌ *ERROR:* Bot failed to post status." });
        }
    }
};
