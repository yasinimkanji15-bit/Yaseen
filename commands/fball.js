const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: "fball",
    alias: ["football", "ball", "uefa"],
    description: "Get live football tables and the latest 2026 news.",
    category: "sports",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const prefix = global.botConfig.prefix || ".";
        const arg = args[0] ? args[0].toLowerCase() : "";
        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';

        // 🟢 HELP & MANUAL
        if (!args[0] || args[0] === 'help') {
            const manual = `⚽ *YASEEN-ＭＤ ＦＯＯＴＢＡＬＬ*

✦═════════◆═════════✦
✨ *HOW TO USE:*

1️⃣ *League Tables:*
> Type \`${prefix}fball tpl\` (Premier League)
> Type \`${prefix}fball tlaliga\` (La Liga)
> Type \`${prefix}fball tseriea\` (Serie A)

2️⃣ *Latest News:*
> Type \`${prefix}fball news\`
> Type \`${prefix}fball [topic]\`
✦═════════◆═════════✦

_© 2026 YASEEN Laporte_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // 🔵 LIVE LEAGUE TABLES
        if (arg.startsWith('t')) {
            await sock.sendMessage(from, { react: { text: '📊', key: message.key } });
            let url = "";
            let leagueTitle = "";

            if (arg === 'tlaliga') {
                url = "https://www.bbc.com/sport/football/spanish-la-liga/table";
                leagueTitle = "LA LIGA STANDINGS";
            } else if (arg === 'tpl') {
                url = "https://www.bbc.com/sport/football/premier-league/table";
                leagueTitle = "PREMIER LEAGUE STANDINGS";
            } else if (arg === 'tseriea') {
                url = "https://www.bbc.com/sport/football/italian-serie-a/table";
                leagueTitle = "SERIE A STANDINGS";
            } else {
                return await sock.sendMessage(from, { text: "❌ League not supported. Try: tlaliga, tpl, or tseriea." });
            }

            try {
                const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
                const $ = cheerio.load(data);
                let tableRows = "";

                $('tbody tr').slice(0, 10).each((i, el) => {
                    const rank = $(el).find('td').eq(0).text().trim() || (i + 1);
                    const team = $(el).find('td').eq(2).text().trim() || $(el).find('th').text().trim();
                    const points = $(el).find('td').last().text().trim();
                    if (team) tableRows += `${rank}. ${team} - ${points} pts\n`;
                });

                let msg = `📊 *${leagueTitle}*\n`;
                msg += `_Real-time 2026 Standings_\n\n`;
                msg += `> ${tableRows.replace(/\n/g, "\n> ")}\n\n`;
                msg += `_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀᴅʀɪɴ-ᴍᴅ_`;

                return await sock.sendMessage(from, { text: msg }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(from, { text: "❌ Error fetching the table. Pitch is frozen!" });
            }
        }

        // 🔴 NEWS LOGIC (AUTO-CLEANED)
        await sock.sendMessage(from, { react: { text: '⚽', key: message.key } });
        try {
            const query = args.join(" ") === "news" ? "football" : args.join(" ");
            const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
            const { data: searchData } = await axios.get(searchUrl);
            const articles = searchData.articles;

            if (!articles || articles.length === 0) return sock.sendMessage(from, { text: "❌ No news found." });

            let fballReport = `⚽ *YASEEN-ＭＤ ＦＯＯＴＢＡＬＬ*\n\n`;

            for (let i = 0; i < articles.length; i++) {
                const art = articles[i];
                let deepText = "";

                try {
                    const { data: pageData } = await axios.get(art.url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 });
                    const $ = cheerio.load(pageData);
                    $('p').slice(0, 2).each((_, el) => {
                        // 🛠️ THE CLEANER: Fixes gaps and extra spaces
                        let cleanTxt = $(el).text().replace(/\s+/g, ' ').trim(); 
                        if (cleanTxt.length > 40) deepText += `> ${cleanTxt}\n>\n`;
                    });
                } catch (e) {
                    deepText = `> ${art.description.replace(/\s+/g, ' ').trim()}\n`;
                }

                fballReport += `*${i + 1}. ${art.title.toUpperCase()}*\n`;
                fballReport += `${deepText}───◆───\n\n`;
            }

            await sock.sendMessage(from, { 
                text: fballReport + `_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀᴅʀɪɴ-ᴍᴅ_`,
                contextInfo: { externalAdReply: { title: "2026 FOOTBALL HUB", mediaType: 1, thumbnailUrl: articles[0].urlToImage }}
            }, { quoted: message });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ Error connecting to the news server." });
        }
    }
};
