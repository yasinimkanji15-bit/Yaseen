const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    name: "play",
    alias: ["song", "music"],
    description: "Search and download audio from YouTube automatically.",
    category: "download",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const query = args.join(" ");
        const start = Date.now();

        // 📜 --- MANUAL --- 📜
        if (!query) {
            const manual = `✦═════════◆═════════✦
🎵  *YASEEN  ＰＬＡＹＥＲ* 🎵
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Search for any song and download it as MP3.

🛰️  *ＵＳＡＧＥ:*
> *${prefix}play [song name]*

💡  *ＥＸＡＭＰＬＥ:*
> *${prefix}play Calm Down Rema*

✦═════════◆═════════✦
_© 2026 YAS-TECH • Audio Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            // ⏳ Reaction: Processing
            await sock.sendMessage(chatId, { react: { text: '🎧', key: message.key } });

            // 🔎 Step 1: Search YouTube
            const search = await yts(query);
            const video = search.videos[0];

            if (!video) {
                return await sock.sendMessage(chatId, { text: `❌ *No results found for:* "${query}"` }, { quoted: message });
            }

            // 🖼️ Step 2: Send Preview Message
            const previewMsg = `✦═════════◆═════════✦
🎵  *ＳＯＮＧ  ＦＯＵＮＤ*
✦═════════◆═════════✦

> 📝 *Title:* ${video.title}
> ⏱️ *Duration:* ${video.timestamp}
> 👤 *Channel:* ${video.author.name}
> 📅 *Uploaded:* ${video.ago}

⏳ *Processing high-quality audio...*
✦═════════◆═════════✦
_© 2026 YAS-TECH_`;

            await sock.sendMessage(chatId, { 
                image: { url: video.thumbnail }, 
                caption: previewMsg 
            }, { quoted: message });

            // 📥 Step 3: Fetch Download Link (Using the Noobs-API you found)
            const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;
            const response = await axios.get(apiURL);
            let downloadLink = response.data.downloadLink;

            // 🛡️ Fallback API (In case the first one fails)
            if (!downloadLink) {
                const fallback = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(video.url)}`);
                downloadLink = fallback.data?.data?.download;
            }

            if (!downloadLink) {
                throw new Error("Download link not generated.");
            }

            // 🚀 Step 4: Send the Audio File
            const elapsed = Date.now() - start;
            const fileName = `${video.title.replace(/[\\/:*?"<>|]/g, '')}.mp3`;

            await sock.sendMessage(chatId, {
                audio: { url: downloadLink },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: `YAS-TECH • Response: ${elapsed}ms`,
                        thumbnailUrl: video.thumbnail,
                        sourceUrl: video.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: message });

            // ✅ Final Success Reaction
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, { text: `⚠️ *Download Failed:* The audio servers are currently busy. Please try again in a moment.` }, { quoted: message });
        }
    }
};
