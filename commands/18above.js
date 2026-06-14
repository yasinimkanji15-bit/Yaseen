const axios = require('axios');

// 📂 --- THE SECTOR ARCHIVE ---
const nsfwSectors = [
    "ass", "pussy", "boobs", "thighs", "hentai", "milf", "blowjob", 
    "ero", "cum", "gangbang", "foot", "yuri", "masturbation"
];

async function fetchMedia(category) {
    try {
        const res = await axios.get(`https://apis.prexzyvilla.site/nsfw/${category}`, { 
            timeout: 10000, 
            responseType: 'arraybuffer' 
        });
        const contentType = res.headers['content-type'] || '';
        return { 
            buffer: Buffer.from(res.data), 
            isVideo: contentType.includes('video') || contentType.includes('mp4') 
        };
    } catch (e) { return null; }
}

module.exports = {
    name: "18things",
    alias: ["n", "nsf"],
    description: "Rapid visual extraction via .n command structure.",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const subCommand = args[0]?.toLowerCase(); 
        const countArg = args[1]; 

        if (from.endsWith('@g.us') && !global.nsfwGroups?.[from]) {
            return await sock.sendMessage(from, { text: "❌ *ACCESS DENIED:* Sector is locked. Use \`.nsfw on\`." });
        }

        if (!subCommand || subCommand === "cat") {
            const manual = `🔞 *YASEEN－ＭＤ  ＣＡＴＥＧＯＲＩＥＳ*

> *“Mapping the restricted visual sectors.”*

✦═════════════════════◆
📑 *ＡＶＡＩＬＡＢＬＥ  ＳＥＣＴＯＲＳ:*
> ${nsfwSectors.join(' | ')}

⚙️ *ＵＳＡＧＥ:*
> • .n [sector] [number]
> _Example: .n ass 3 (Sends 3 items)_
> _Example: .n ass (Sends 1 item)_
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        if (!nsfwSectors.includes(subCommand)) {
            return await sock.sendMessage(from, { text: `❌ *ERROR:* Sector '${subCommand}' not found. Type \`.n cat\` for a list.` });
        }

        let count = parseInt(countArg) || 1;
        if (count > 10) count = 10; 

        try {
            await sock.sendMessage(from, { react: { text: '🔞', key: message.key } });

            for (let i = 0; i < count; i++) {
                const data = await fetchMedia(subCommand);
                if (!data) continue;

                const caption = `🔞 *YASEEN－ＭＤ  ${subCommand.toUpperCase()}*\n\n> *“Data Packet [${i + 1}/${count}]”*`;

                if (data.isVideo) {
                    await sock.sendMessage(from, { video: data.buffer, caption });
                } else {
                    await sock.sendMessage(from, { image: data.buffer, caption });
                }

                if (count > 1 && i < count - 1) await new Promise(r => setTimeout(r, 1500));
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ *NODE ERROR:* Sector timeout." });
        }
    }
};
