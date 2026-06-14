const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: "xnxximg",
    alias: ["xg", "nxpic"],
    description: "Scrape a specific amount of preview images from XNXX.",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // 📜 --- THE GHOST MANUAL ---
        if (args.length === 0) {
            const manual = `🔞 *YASEEN－ＭＤ  ＩＭＡＧＥＳ*

> *“Dynamic visual node extraction.”*

✦═════════════════════◆
📑 *ＵＳＡＧＥ:*
> • .ximg [query] (Sends 1 photo)
> • .ximg [query] [number] (Sends X photos)

💡 *ＥＸＡＭＰＬＥＳ:*
> .ximg big ass
> .ximg big ass 3
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📸', key: message.key } });

            // 🛠️ --- SMART COUNT LOGIC ---
            let count = 1; // Default
            let queryArr = [...args];
            
            // Check if the last argument is a number
            const lastArg = queryArr[queryArr.length - 1];
            if (!isNaN(lastArg) && lastArg.length <= 2) {
                count = parseInt(queryArr.pop()); // Remove number from query and set count
            }
            
            const query = queryArr.join(" ");
            const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}`;
            
            const res = await fetch(searchUrl, { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
            });
            const html = await res.text();
            const $ = cheerio.load(html);

            const images = [];
            $('.mozaique .thumb-inside img').each((i, el) => {
                const imgUrl = $(el).attr('data-src') || $(el).attr('src');
                const title = $(el).attr('alt') || `Image ${i + 1}`;
                
                if (imgUrl && !imgUrl.includes('loading.gif')) {
                    images.push({ url: imgUrl, title });
                }
            });

            if (images.length === 0) {
                return await sock.sendMessage(from, { text: "❌ No visual data found for that query." });
            }

            // Cap the count to prevent spam/crashes (Max 10)
            const finalCount = Math.min(count, 10);
            const selection = images.slice(0, finalCount);

            for (let img of selection) {
                await sock.sendMessage(from, { 
                    image: { url: img.url }, 
                    caption: `🔞 *Search:* ${query}\n\n> 🚷 YASEEN－ＭＤ 🚷*`
                });
            }

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ *IMAGE NODE ERROR:* Connection reset." });
        }
    }
};
