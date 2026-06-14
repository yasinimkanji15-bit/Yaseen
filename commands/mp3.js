const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    name: "mp3",
    alias: ["audi", "audi2"],
    description: "Ultra-lite audio downloader (Snaptube Style).",
    category: "download",

    execute: async (sock, chatId, message, args, { prefix, pushname }) => {
        const from = chatId;
        const query = args.join(" ");

        // 📜 --- THE TACTICAL MUSIC MANUAL ---
        if (!query) {
            const manual = `🎧 *YASEEN－ＭＤ  ＬＩＴＥ  ＨＵＢ*

> *“Optimized for 2MB - 4MB file sizes.”*

✦═════════════════════◆
🔎 *ＳＥＡＲＣＨ:*
> Find any song in Lite-Format.
> • \`${prefix}play Starboy\`

📉 *ＤＡＴＡ  ＳＡＶＥＲ:*
> Uses 64kbps compression to match 
> Snaptube 'Fast' profiles.
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });

            // 1. YouTube Search
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return await sock.sendMessage(from, { text: "❌ *Error:* Song not found." });

            const videoUrl = video.url;

            // 2. Send Preview (Compact)
            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: `🎧 *YASEEN  ＬＩＴＥ  ＰＬＡＹＥＲ*\n\n> 🎵 *Title:* ${video.title}\n> ⏱️ *Duration:* ${video.timestamp}\n\n*📥 Applying 64kbps compression...*` 
            }, { quoted: message });

            let downloadUrl = null;

            // 🚀 ULTRA-LITE SERVER: Specifically requests 64kbps/low quality
            try {
                // Using an API that targets low-bitrate streams specifically
                const res = await axios.get(`https://api. giftedtech.my.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&quality=64`);
                downloadUrl = res.data?.result?.download_url || res.data?.result?.url;
            } catch (e) {
                // FALLBACK: Dipto API (Standard quality if Lite fails)
                const res2 = await axios.get(`https://noobs-api.top/dipto/ytDl3?link=${video.videoId}&format=mp3`);
                downloadUrl = res2.data?.downloadLink;
            }

            if (!downloadUrl) throw new Error("Audio servers are currently busy.");

            // 3. Send the Audio File
            await sock.sendMessage(from, { 
                audio: { url: downloadUrl }, 
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: `Lite Download Active (${video.timestamp})`,
                        thumbnailUrl: video.thumbnail,
                        sourceUrl: videoUrl,
                        mediaType: 2,
                        renderLargerThumbnail: false 
                    }
                }
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ *ERROR:* Failed to compress audio.` });
        }
    }
};
