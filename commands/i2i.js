const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "seedream",
    alias: ["img2img", "dream", "seed"],
    description: "Transforms an image using Seedream AI via David Cyril API.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 1. Locate the image message (either quoted or directly sent)
        const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
        
        // Check if it's an image message
        const imageMessage = targetMessage?.imageMessage;

        if (!query || !imageMessage) {
            const usageText = `┌◽▫️ ❖ *SEEDREAM AI ENGINE* ❖ ▫️◽\n` +
                `│ ❌ *Error:* Missing Image or Prompt!\n` +
                `│\n` +
                `│ 📝 *Usage Instructions:* \n` +
                `│ 1️⃣ Reply to an image or send an image.\n` +
                `│ 2️⃣ Add your creative transformation prompt.\n` +
                `│\n` +
                `│ ⏩ \`seedream cyberpunk style, neon lights\`\n` +
                `│ ⏩ \`seedream make it a futuristic anime\`\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© YASEEN-MD CYBER CORE*`;
            
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        try {
            // Set terminal loading reaction
            await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            // 2. Download the image stream directly using Baileys core function
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const imageBase64 = buffer.toString('base64');
            const mime = imageMessage.mimetype || 'image/jpeg';

            // 3. Querying David Cyril API
            const response = await axios.post('https://apis.davidcyril.name.ng/imageToImage/seedream', {
                image: `data:${mime};base64,${imageBase64}`,
                prompt: query
            });
            
            let resultImageUrl = response.data?.result || response.data?.url || response.data?.data;

            if (!resultImageUrl) throw new Error("Empty AI response matrix.");

            // 4. Cyber Tree-Structure Layout Box Format for Caption
            const finalCaption = `┌◽▫️ ❖ *SEEDREAM MATRIX RECONSTRUCTION* ❖ ▫️◽\n` +
                `│ 💻 *OPERATOR:* Dark Developer\n` +
                `│ 📝 *PROMPT:* ${query}\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© 2026 YASEEN LAPORTE • OPERATIONAL*`;

            // 5. Send success reaction and the processed image
            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
            await sock.sendMessage(from, { 
                image: { url: resultImageUrl }, 
                caption: finalCaption 
            }, { quoted: msg });

        } catch (error) {
            console.error("Seedream Core Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorCaption = `┌◽▫️ ❖ *SEEDREAM SYSTEM FAILURE* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Image Processing Failed\n` +
                `│ ⚠️ *Reason:* Server timeout or invalid image matrix encoding.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};