const axios = require('axios');

module.exports = {
    name: "adhan",
    alias: ["adansound", "muezzin"],
    description: "View Adhan manual or play the audio.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        try {
            const subCommand = args[0]?.toLowerCase();

            // 🎵 LOGIC: IF USER TYPES ".adhan p"
            if (subCommand === 'p' || subCommand === 'play') {
                await sock.sendMessage(chatId, { react: { text: '🕋', key: message.key } });

                // 🌐 STABLE AUDIO SOURCE (Mekkah Style)
                const adhanAudio = "https://www.islamcan.com/common/adhan/adhan1.mp3";

                try {
                    // SEND AS VOICE NOTE (PTT)
                    await sock.sendMessage(chatId, { 
                        audio: { url: adhanAudio }, 
                        mimetype: 'audio/mp4', 
                        ptt: true,
                        fileName: "YASEENAdhan.mp3" // Helps with internal processing
                    }, { quoted: message });

                    return await sock.sendMessage(chatId, { 
                        text: "✨ *YASEEN-ＭＤ  ＡＤＨＡＮ  ＰＬＡＹＥＲ*\n\n> *“Hasten to success.”*\n\n_Status: Streamed Successfully_ 🕋" 
                    });
                } catch (streamErr) {
                    console.error("Streaming Error:", streamErr);
                    return sock.sendMessage(chatId, { text: "❌ *Stream Failed:* The audio server is currently unreachable. Please try again in a moment." });
                }
            }

            // 📜 DEFAULT LOGIC: SHOW MANUAL
            await sock.sendMessage(chatId, { react: { text: '📜', key: message.key } });

            const adhanManual = `🕌 *YASEEN-ＭＤ  ＡＤＨＡＮ  ＳＹＳＴＥＭ*

> *“Spirituality meets Automation.”*

✦═════════════════════════════════✦
🛰️ *ＳＴＲＡＴＥＧＩＣ  ＭＡＮＵＡＬ:*
> 1️⃣ *SHOW MANUAL:* .adhan
> 2️⃣ *PLAY AUDIO:* .adhan p
> 3️⃣ *TIMINGS:* .prayer [city]
✦═════════════════════════════════✦

📂 *ＦＩＥＬＤ  ＩＮＴＥＬ:*
> * Mode: High-Fidelity PTT (Blue Mic).
> * Style: Mekkah Al-Mukarramah.
> * Node: Arusha Synchronized.

_© 2026 YAS-TECH • Spiritual Suite_`;

            await sock.sendMessage(chatId, { 
                text: adhanManual,
                contextInfo: {
                    externalAdReply: {
                        title: "YASEEN-ＭＤ  ＩＳＬＡＭＩＣ  ＣＥＮＴＥＲ",
                        body: "Adhan Module Operational",
                        thumbnailUrl: "https://files.catbox.moe/yb43pn.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: message });

        } catch (err) {
            console.error("Adhan Command Error:", err);
            sock.sendMessage(chatId, { text: "⚠️ *System Error:* Command execution failed. Check logs." });
        }
    }
};
