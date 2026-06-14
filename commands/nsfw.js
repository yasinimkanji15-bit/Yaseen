const axios = require('axios');

// 📡 --- MULTI-SOURCE FETCH ENGINE ---
async function fetchNsfwContent(category) {
    const sources = [
        { url: `https://apis.prexzyvilla.site/nsfw/${category}`, type: 'direct' },
        { url: `https://api.waifu.pics/nsfw/${category}`, type: 'json_url' },
        { url: `https://nekos.best/api/v2/${category}`, type: 'json_results' }
    ];

    for (const source of sources) {
        try {
            const res = await axios.get(source.url, { 
                timeout: 15000, 
                responseType: source.type === 'direct' ? 'arraybuffer' : 'json',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (source.type === 'direct') {
                const contentType = res.headers['content-type'] || '';
                return { 
                    buffer: Buffer.from(res.data), 
                    isVideo: contentType.includes('video') || contentType.includes('mp4'),
                    isGif: contentType.includes('gif')
                };
            }

            const url = source.type === 'json_url' ? res.data.url : res.data.results?.[0]?.url;
            if (url) {
                const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
                return { buffer: Buffer.from(imgRes.data), isVideo: false, isGif: url.includes('.gif') };
            }
        } catch (e) { continue; }
    }
    return null;
}

// 📜 --- THE GHOST MANUAL (STRICTLY VERTICAL) ---
const manual = `🔞 *YASEEN－ＭＤ  ＮＳＦＷ  ＭＡＮＵＡＬ*

> *“Navigating the deep-web archives.”*

✦═════════════════════◆
📑 *ＡＶＡＩＬＡＢＬＥ  ＳＥＣＴＯＲＳ:*

> .ass
> .pussy
> .boobs
> .hentai
> .milf
> .blowjob

⚙️ *ＣＯＮＴＲＯＬＳ:*
> .nsfw on  (Enable Sector)
> .nsfw off (Disable Sector)
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;

module.exports = {
    name: "nsfw",
    alias: ["ass", "pussy", "boobs", "thighs", "hentai", "milf", "yuri", "yaoi", "blowjob"],
    description: "Access the restricted NSFW archives.",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const prefix = global.botConfig?.prefix || ".";
        
        // Extract command name from the message
        const body = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || "";
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

        // 🟢 --- SETTINGS / MANUAL MODE ---
        if (command === "nsfw") {
            const opt = args[0]?.toLowerCase();
            if (!opt) return await sock.sendMessage(from, { text: manual }, { quoted: message });
            
            if (!global.nsfwGroups) global.nsfwGroups = {};
            
            if (opt === 'on') {
                global.nsfwGroups[from] = true;
                return await sock.sendMessage(from, { text: "✅ *NSFW Sector:* Enabled." });
            } else if (opt === 'off') {
                global.nsfwGroups[from] = false;
                return await sock.sendMessage(from, { text: "❌ *NSFW Sector:* Disabled." });
            }
            return;
        }

        // 🛡️ --- GROUP SAFETY CHECK ---
        if (from.endsWith('@g.us') && !global.nsfwGroups?.[from]) {
            return await sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED:* NSFW nodes are disabled in this group.\n\nType `.nsfw on` to unlock." 
            });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔞', key: message.key } });
            
            const data = await fetchNsfwContent(command);
            if (!data) throw new Error("Nodes Offline");

            const caption = `🔞 *YASEEN－ＭＤ  ${command.toUpperCase()}*\n\n> *“Restricted visual data extracted.”*\n\n*🔞 YASEEN－ＭＤ 🔞*`;

            if (data.isVideo || data.isGif) {
                await sock.sendMessage(from, { 
                    video: data.buffer, 
                    gifPlayback: data.isGif, 
                    caption 
                }, { quoted: message });
            } else {
                await sock.sendMessage(from, { 
                    image: data.buffer, 
                    caption 
                }, { quoted: message });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ *DATA ERROR:* Sector timed out." });
        }
    }
};
