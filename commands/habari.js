const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: "habari",
    alias: ["news", "tznews", "tanzania", "habarizote"],
    description: "Get the latest Swahili news from Tanzania (BBC, Millard Ayo, Mwananchi).",
    category: "search",

    execute: async (sock, chatId, m, args) => {
        const from = chatId;

        try {
            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            // Mpangilio wa vyanzo vya habari
            const sources = [
                { name: "BBC SWAHILI", url: "https://www.bbc.com/swahili" },
                { name: "MWANANCHI", url: "https://www.mwananchi.co.tz/mw/habari" }
            ];

            let newsMessage = `✨ *ＹＡＳＥＥＮ－ＭＤ  ＨＡＢＡＲＩ  ＴＺ* ✨\n\n`;
            let count = 1;

            // Kuzunguka kwenye kila chanzo na kuchukua habari
            for (let source of sources) {
                try {
                    const response = await axios.get(source.url, { timeout: 5000 });
                    const $ = cheerio.load(response.data);
                    
                    newsMessage += `📌 *SOURCE: ${source.name}*\n`;

                    if (source.name === "BBC SWAHILI") {
                        $('h3').slice(0, 3).each((i, el) => {
                            const title = $(el).text().trim();
                            const link = $(el).find('a').attr('href');
                            const fullUrl = link?.startsWith('http') ? link : `https://www.bbc.com${link}`;
                            if (title) newsMessage += `${count++}. ${title}\n🔗 ${fullUrl}\n\n`;
                        });
                    } 
                    else if (source.name === "MWANANCHI") {
                        $('.teaser-image-and-text').slice(0, 3).each((i, el) => {
                            const title = $(el).find('h3').text().trim();
                            const link = $(el).find('a').attr('href');
                            const fullUrl = `https://www.mwananchi.co.tz${link}`;
                            if (title) newsMessage += `${count++}. ${title}\n🔗 ${fullUrl}\n\n`;
                        });
                    }
                } catch (e) {
                    console.error(`Error fetching from ${source.name}`);
                }
            }

            if (count === 1) {
                return sock.sendMessage(from, { text: "❌ Sikuweza kupata habari kwa sasa. Jaribu tena baadae." });
            }

            newsMessage += `_© 2026 YASEEN LAPORTE TECH_`;

            // Kutumia picha ya menu uliyoseti
            const botImg = global.botConfig?.menuThumb || "https://files.catbox.moe/yb43pn.jpg";
            const isBuffer = Buffer.isBuffer(botImg);

            await sock.sendMessage(from, {
                text: newsMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "TANZANIA LATEST NEWS",
                        body: "Habari za hivi punde nchini",
                        ...(isBuffer ? { thumbnail: botImg } : { thumbnailUrl: botImg }),
                        sourceUrl: "https://www.mwananchi.co.tz/",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            await sock.sendMessage(from, { react: { text: '📰', key: m.key } });

        } catch (err) {
            console.error("News Command Error:", err);
            await sock.sendMessage(from, { text: "❌ Hitilafu imetokea. Hakikisha bot ina internet na folder la 'commands' lipo sahihi." });
        }
    }
};
