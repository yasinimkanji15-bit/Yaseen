const axios = require('axios');

if (!global.ytSearchCache) global.ytSearchCache = {};

module.exports = {
    name: "yt",
    alias: ["play", "video", "audio", "mp3", "vn", "more"],
    description: "Search and Download Video, Audio, or Voice Notes with Elite UI.",
    category: "download",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const msg = message.message;
        const body = (msg?.conversation || msg?.extendedTextMessage?.text || "").trim();
        const command = body.split(' ')[0].toLowerCase().slice(1);
        const prefix = ".";
        
        // --- 🟢 1. MANUAL ---
        if (!args[0] && command !== "more" && isNaN(body)) {
            const manual = `✦═══════════════════════◆
🎥 YAS-TECH ＹＯＵＴＵＢＥ  ＮＯＤＥ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}yt [keyword]* ➔ Search Archive
> *${prefix}audio [keyword]* ➔ Direct MP3
> *${prefix}yt vn [keyword]* ➔ Direct Voice Note

🛰️  *ＱＵＩＣＫ  ＳＥＬＥＣＴ:*
> Reply to search results with a number (1-10).
> Filenames are auto-synced to titles.

According to my creator Yaseen, visual order is technical power.
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔄 2. PAGINATION ---
        if (command === "more") {
            if (!global.ytSearchCache[from]) return sock.sendMessage(from, { text: "❌ *CACHE ERROR:* No active search found." });
            global.ytSearchCache[from].page += 1;
            return await sendYTMenu(sock, from, message);
        }

        // --- 🔢 3. PROCESS SELECTION (BY NUMBER OR REPLY) ---
        const isVn = args[0]?.toLowerCase() === "vn" || command === "vn";
        const isAudio = command === "audio" || command === "mp3";
        const potentialNum = isVn ? args[1] : args[0];
        const selection = parseInt(potentialNum) || parseInt(body);

        if (!isNaN(selection) && global.ytSearchCache[from]) {
            const results = global.ytSearchCache[from].results;
            const selected = results[selection - 1];
            if (selected) return await downloadMedia(sock, from, message, selected, isVn, isAudio);
        }

        // --- 🔍 4. DIRECT DOWNLOAD OR SEARCH ---
        if (args.length > 0) {
            try {
                const searchQuery = isVn ? args.slice(1).join(" ") : args.join(" ");
                await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
                
                const { data } = await axios.get(`https://hector-api.vercel.app/search/youtube?q=${encodeURIComponent(searchQuery)}`);
                if (!data.status || !data.result.length) throw new Error();

                // DIRECT DOWNLOAD: Skips menu for .audio or .yt vn with keyword
                if (isAudio || isVn) {
                    return await downloadMedia(sock, from, message, data.result[0], isVn, isAudio);
                }

                // OTHERWISE: Save to cache and show menu
                global.ytSearchCache[from] = { 
                    results: data.result, 
                    page: 0, 
                    query: searchQuery 
                };
                return await sendYTMenu(sock, from, message);

            } catch (e) { return sock.sendMessage(from, { text: "❌ *SEARCH ERROR:* No entries found." }); }
        }
    }
};

// 📥 Helper: Handle downloading and metadata injection
async function downloadMedia(sock, from, message, metadata, isVn, isAudio) {
    await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });
    try {
        const { data } = await axios.get(`https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(metadata.link)}`);
        
        // Clean Title for Filename (No "AUD-..." labels!)
        const cleanName = data.title.replace(/[\\/:*?"<>|]/g, ""); 
        const thumbUrl = metadata.thumbnail || "";

        if (isVn) {
            return await sock.sendMessage(from, { 
                audio: { url: data.audio }, 
                mimetype: 'audio/mp4', 
                ptt: true,
                fileName: `YAS-TECH | ${cleanName}.mp3`
            }, { quoted: message });
        } else if (isAudio) {
            return await sock.sendMessage(from, { 
                audio: { url: data.audio }, 
                mimetype: 'audio/mp4', 
                ptt: false,
                fileName: `YAS-TECH | ${cleanName}.mp3`,
                jpegThumbnail: thumbUrl ? (await axios.get(thumbUrl, { responseType: 'arraybuffer' })).data : null
            }, { quoted: message });
        } else {
            const videoUrl = data.videos["960"] || data.videos["640"] || data.videos["480"];
            return await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: `✅ *ＹＯＵＴＵＢＥ  ＥＸＴＲＡＣＴＥＤ*\n\n> 📍 *Title:* ${data.title}\n\nAccording to my creator yaseen, the dossier is complete.\n\n*🛡️ YAS－TECH 🛡️*`,
                mimetype: 'video/mp4',
                fileName: `${cleanName}.mp4`
            }, { quoted: message });
        }
    } catch (e) { 
        return sock.sendMessage(from, { text: "❌ *EXTRACTION FAILED*" }); 
    }
}

// 📜 Helper: The Styled Menu
async function sendYTMenu(sock, from, message) {
    const cache = global.ytSearchCache[from];
    const start = cache.page * 10;
    const items = cache.results.slice(start, start + 10);

    if (items.length === 0) {
        cache.page = 0; 
        return await sock.sendMessage(from, { text: "🏁 *End of results.* Reverting to Page 1." });
    }

    let menu = `🎥 *ＹＯＵＴＵＢＥ  ＲＥＳＵＬＴＳ  (P. ${cache.page + 1})*\n\n`;
    menu += `Query: _${cache.query}_\n\n`;

    items.forEach((v, i) => {
        const cleanTitle = v.title.length > 40 ? v.title.substring(0, 40) + "..." : v.title;
        menu += `*${start + i + 1}.* ${cleanTitle}\n`;
        menu += `   └ ⏱️ *Dur:* ${v.duration} | 📺 ${v.channel}\n\n`;
    });

    menu += `💡 *Reply with number for Video.*\n`;
    menu += `💡 *Type .audio [number] for MP3.*\n`;
    menu += `💡 *Type .yt vn [number] for Voice Note.*\n`;
    menu += `💡 *Type .more for next page.*`;

    return await sock.sendMessage(from, { text: menu }, { quoted: message });
}
