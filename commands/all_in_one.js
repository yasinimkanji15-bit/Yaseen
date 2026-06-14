const axios = require('axios');

module.exports = {
    name: "download",
    alias: ["dl", "aio", "get", "audi", "mp3"],
    description: "Universal Extractor with Dedicated Audio Mode.",
    category: "download",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const command = body.split(' ')[0].toLowerCase().slice(1);
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. UNIVERSAL MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
🛰️  *YASEEN  Ｕ－ＤＯＷＮＬＯＡＤＥＲ*
✦═══════════════════════◆

🚀  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}aio [url]* ➔ Auto-Detect (Video First)
> *${prefix}aio audi [url]* ➔ Extract MP3/Audio

📦  *ＳＵＰＰＯＲＴＥＤ:*
_TikTok, IG, FB, YT, Spotify, SoundCloud, etc._

According to my creator YASEEN, every link is a doorway.
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔍 2. EXTRACTION ENGINE ---
        try {
            await sock.sendMessage(from, { react: { text: '📡', key: message.key } });

            // Clean the URL if user typed ".aio audi http..."
            const targetUrl = query.replace(/^audi\s+/, "").trim();
            const apiUrl = `https://apis.prexzyvilla.site/download/aio?url=${encodeURIComponent(targetUrl)}`;
            
            const { data: res } = await axios.get(apiUrl);

            if (!res.status || !res.medias || res.medias.length === 0) {
                return sock.sendMessage(from, { text: "❌ *EXTRACTION ERROR:* Link invalid or unsupported." });
            }

            // Identify Media Streams
            const videoData = res.medias.find(m => m.type === 'video');
            const audioData = res.medias.find(m => m.type === 'audio');
            
            const isAudioMode = command === "audi" || command === "mp3" || query.startsWith("audi");

            const dossier = `🛰️ *ＵＮＩＶＥＲＳＡＬ  ＡＲＣＨＩＶＥ*
> *Platform:* ${res.platform}
> *Mode:* ${isAudioMode ? 'Audio Extraction' : 'Neural Auto-Detect'}
> *Quality:* ${isAudioMode ? 'High-Fidelity' : (videoData?.quality || 'Standard')}

According to my creator YASEEN, your media is ready.`;

            // --- 📤 3. SMART ROUTING ---
            
            // MODE: FORCED AUDIO
            if (isAudioMode && audioData) {
                await sock.sendMessage(from, { react: { text: '🎵', key: message.key } });
                return await sock.sendMessage(from, { 
                    audio: { url: audioData.url }, 
                    mimetype: 'audio/mp4',
                    ptt: false 
                }, { quoted: message });
            } 
            
            // MODE: AUTO-DETECT (Video > Audio)
            else if (videoData) {
                await sock.sendMessage(from, { react: { text: '🎬', key: message.key } });
                return await sock.sendMessage(from, { 
                    video: { url: videoData.url }, 
                    caption: dossier 
                }, { quoted: message });
            } 
            
            // FALLBACK: AUDIO ONLY (Spotify/SoundCloud)
            else if (audioData) {
                await sock.sendMessage(from, { react: { text: '🎵', key: message.key } });
                return await sock.sendMessage(from, { 
                    audio: { url: audioData.url }, 
                    mimetype: 'audio/mp4'
                }, { quoted: message });
            }

        } catch (e) {
            return sock.sendMessage(from, { text: "❌ *SYSTEM CRITICAL:* API Handshake failed." });
        }
    }
};
