const axios = require('axios');

module.exports = {
    name: "kiss",
    alias: ["animekiss", "akiss"],
    description: "Sends multiple anime kissing images/GIFs based on the number specified.",
    category: "fun",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;

        // Kutambua nani anapewa kiss (Aliyetagged au aliyereplywa)
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*⚠️ Please tag or reply to someone you want to kiss.*\n_Example: .kiss 5 @user_" }, { quoted: msg });
        }

        const senderNumber = msg.key.participant || msg.key.remoteJid;
        const targetNumber = target.split("@")[0];
        const senderId = senderNumber.split("@")[0];

        // Kuangalia kama mtumiaji ameweka idadi ya picha (Mfano: .kiss 5)
        // Kama hajaweka namba, default inakuwa picha 1
        let count = parseInt(args[0]);
        if (isNaN(count) || count < 1) {
            count = 1; 
        }

        // Kuzuia bot isizidishe idadi kubwa sana ili isilete 'spam' au 'crash' (Max: 5)
        if (count > 5) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*⚠️ You can only request up to 5 images at once.*" }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '💋', key: msg.key } });

            const apiKey = 'wxa_f_148271fcd7';
            const apiUrl = `https://apis.xwolf.space/api/anime/kiss?key=${apiKey}`;
            
            const captionText = `❤️ @${senderId} *gave romantic kisses to* @${targetNumber} ! 🥰`;

            // Mzunguko (Loop) wa kutafuta na kutuma picha kulingana na idadi iliyoombwa
            for (let i = 0; i < count; i++) {
                const response = await axios.get(apiUrl);
                let kissImageUrl = response.data?.result || response.data?.url || response.data?.data || response.data;

                if (!kissImageUrl) continue; // Kama picha moja ikifeli, inafungua inayofuata

                // Kutuma kila faili moja baada ya nyingine
                if (kissImageUrl.endsWith('.mp4') || kissImageUrl.includes('gif')) {
                    await sock.sendMessage(from, { 
                        video: { url: kissImageUrl }, 
                        caption: i === 0 ? captionText : "", // Inaweka caption kwenye file la kwanza tu
                        gifPlayback: true,
                        mentions: [senderNumber, target]
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        image: { url: kissImageUrl }, 
                        caption: i === 0 ? captionText : "", 
                        mentions: [senderNumber, target]
                    }, { quoted: msg });
                }
                
                // Delay ndogo ya sekunde 1 kati ya picha na picha ili kuzuia WhatsApp Block/Ban
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

        } catch (error) {
            console.error("Anime Kiss Loop Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: `❌ *Error: Failed to fetch anime kiss media.*\n_Reason: ${error.message}_` }, { quoted: msg });
        }
    }
};