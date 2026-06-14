const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');

// Function to upload the image buffer to ImgBB API
async function uploadToImgBB(buffer) {
    try {
        const form = new FormData();
        form.append('image', buffer, { filename: `madrin_${Date.now()}.jpg` });

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=bbc0c59714520ebcd0af58caf995bd08`, form, {
            headers: form.getHeaders(),
        });

        const hostedUrl = response.data?.data?.url;
        if (!hostedUrl) {
            throw new Error("ImgBB engine response did not contain a valid asset URL link.");
        }
        return hostedUrl;
    } catch (e) {
        console.error("ImgBB Upload Error:", e.response?.data || e.message);
        throw new Error('Failed to upload image to ImgBB hosting server.');
    }
}

module.exports = {
    name: "tourl",
    alias: ["url", "image2url", "img2url"],
    description: "Convert a replied image into a permanent web URL link using ImgBB.",
    category: "tools",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;

        // 1. Tafuta kwa usahihi ujumbe uliotajwa
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Angalia kama picha ipo kwenye ujumbe wa sasa au ule uliorepliwa
        const isImage = msg.message?.imageMessage || quoted?.imageMessage;

        if (!isImage) {
            return sock.sendMessage(from, { 
                text: "📸 *Please reply/tag an image* with the command `.tourl` to generate its link." 
            }, { quoted: msg });
        }

        // 2. Chagua kitu sahihi cha ku-download
        const downloadTarget = msg.message?.imageMessage ? msg.message.imageMessage : quoted.imageMessage;

        try {
            // Weka loading reaction
            await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            // 3. Download kwa kutumia stream ya uhakika
            const stream = await downloadContentFromMessage(downloadTarget, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Kama faili limekuja tupu kwa sababu yoyote ile
            if (buffer.length === 0) throw new Error("Downloaded buffer is empty");

            // 4. Pakia picha mtandaoni kwa ImgBB
            const resultUrl = await uploadToImgBB(buffer);

            // 5. Tuma majibu ya URL
            const caption = `🌐 *IMAGE TO URL CONVERTER* 🌐\n\n` +
                `› *Image Link:* ${resultUrl.trim()}\n` +
                `› *Host:* ImgBB\n` +
                `› *Expiration:* Never expires\n\n` +
                `*🛡️ YASEEN-MD • TOOLS 🛡️*`;

            await sock.sendMessage(from, { text: caption }, { quoted: msg });
            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error("Tourl Detailed Error:", error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { 
                text: `❌ *Error:* ${error.message || "Failed to process the image. Make sure the media is fully downloaded on your phone before replying."}` 
            }, { quoted: msg });
        }
    }
};