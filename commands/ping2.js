const fs = require('fs');
const path = require('path');

module.exports = {
    name: "ping",
    alias: ["p", "speed"],
    execute: async (sock, chatId, msg, args, { pushname }) => {
        try {
            const start = Date.now();
            await sock.sendMessage(chatId, { react: { text: '🎴', key: msg.key } });
            const end = Date.now();
            const pingSpeed = end - start;

            const cmdDir = path.join(__dirname, '../commands'); 
            const totalCommands = fs.readdirSync(cmdDir).filter(file => file.endsWith('.js')).length;

            const response = `> 📍*YOU ARE ALWAYS GENIUS, BELIEVE IT!*📍`;

            await sock.sendMessage(chatId, {
                text: response,
                contextInfo: {
                    externalAdReply: {
                        // 🟢 PUTTING THE MOST IMPORTANT INFO IN THE TITLE
                        title: `𓃦 [${totalCommands} items] & Speed: ${pingSpeed} ms`, 
                        
                        // 🟢 KEEPING THE BODY TO ONE SHORT LINE TO STOP THE "..."
                        body: `👤 ${pushname} | 〄 YAS-TECH`, 
                        
                        thumbnailUrl: "https://files.catbox.moe/voxbkb.jpg",
                        sourceUrl: " ",
                        mediaType: 1,
                        renderLargerThumbnail: false, 
                        showAdAttribution: false 
                    }
                }
            }); 

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "❌ *ＰＵＬＳＥ  ＥＲＲＯＲ*" });
        }
    }
};
