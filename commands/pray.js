const axios = require('axios');

module.exports = {
    name: "adhan",
    alias: ["adansound", "muezzin"],
    description: "Adhan Player with Permanent Heading.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        try {
            const subCommand = args[0]?.toLowerCase();

            // 🎵 LOGIC: PLAY AUDIO (.adhan p)
            if (subCommand === 'p' || subCommand === 'play') {
                await sock.sendMessage(chatId, { react: { text: '🕋', key: message.key } });

                const adhanUrl = "https://files.catbox.moe/2uwi11.mp3";

                // Inform the user without deleting later
                await sock.sendMessage(chatId, { 
                    text: "📡 *YASEEN-ＭＤ:* Initializing spiritual audio node..." 
                });

                try {
                    const response = await axios({
                        method: 'get',
                        url: adhanUrl,
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });

                    const audioBuffer = Buffer.from(response.data);

                    // 📤 SEND AS STABLE AUDIO WITH PERMANENT HEADING
                    return await sock.sendMessage(chatId, { 
                        audio: audioBuffer, 
                        mimetype: 'audio/mpeg', 
                        ptt: false, // Standard audio for stability
                        fileName: "YASEENAdhan.mp3",
                        caption: "✨ *YASEEN-ＭＤ  ＡＤＨＡＮ  ＰＬＡＹＥＲ*\n\n> *“Hasten to success.”* 🕋"
                    }, { quoted: message });

                } catch (err) {
                    console.error("Adhan Stream Error:", err.message);
                    return await sock.sendMessage(chatId, { 
                        text: `❌ *Node Error:* Failed to fetch hosted file.\n\n_Reason: ${err.message}_`
                    });
                }
            }

            // 📜 --- ＲＥＳＴＯＲＥＤ  ＳＴＲＡＴＥＧＩＣ  ＭＡＮＵＡＬ --- 📜
            const adhanManual = `═══✦ 🛰️ ✦═══
🛰️ *ＳＴＲＡＴＥＧＩＣ  ＭＡＮＵＡＬ:*
> 1️⃣ *SHOW MANUAL:* .adhan
> 2️⃣ *PLAY AUDIO:* .adhan p
═══✦ 🛰️ ✦═══
═══✦ 📂 ✦═══
📂 *ＦＩＥＬＤ  ＩＮＴＥＬ:*
> * Link: Private Hosted (Catbox).
> * Mode: Buffer-First (Stable).
> * Node: YASEEN Synchronized.
═══✦ 📂 ✦═══

_© 2026 YAS-TECH • Spiritual Suite_`;

            await sock.sendMessage(chatId, { 
                text: adhanManual,
                contextInfo: {
                    externalAdReply: {
                        title: "YASEEN-ＭＤ | ＡＤＨＡＮ",
                        body: "Arusha Node Operational",
                        thumbnailUrl: "https://files.catbox.moe/yb43pn.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: message });

        } catch (err) {
            console.error("Adhan Command Error:", err);
        }
    }
};
