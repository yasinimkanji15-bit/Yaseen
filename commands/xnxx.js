const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: "xnxx",
    alias: ["x1", "xn", "xnn"],
    description: "Direct URL-stream scraper with high-compatibility headers.",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            const manual = `🔞 *YASEEN－ＭＤ  ＸＮＸＸ  Ｖ５*

> *“Bypassing security protocols for direct delivery.”*

✦═════════════════════◆
📑 *ＣＯＭＭＡＮＤＳ:*
> • .xnxx [search term]
> • .xnxx [video_url]

⚙️ *ＳＴＡＴＵＳ:*
> • Mode: High-Priority Stream
> • Buffer: Direct-to-WA
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔞', key: message.key } });

            // 🚀 --- MODE A: DIRECT DOWNLOAD ---
            if (query.includes('xnxx.com/video-')) {
                const res = await fetch(query, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                        'Referer': 'https://www.xnxx.com/',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                });

                const html = await res.text();
                const $ = cheerio.load(html);
                
                let videoUrl = "";
                $('script').each((i, el) => {
                    const content = $(el).html();
                    if (content) {
                        // Priority 1: High Quality | Priority 2: Low Quality
                        const match = content.match(/html5player\.setVideoUrlHigh\(['"](.+?)['"]\)/) || 
                                      content.match(/setVideoUrlLow\(['"](.+?)['"]\)/) ||
                                      content.match(/setVideoUrlHigh\s*\(\s*['"](.+?)['"]\s*\)/);
                        if (match) videoUrl = match[1];
                    }
                });

                if (!videoUrl) {
                    return await sock.sendMessage(from, { text: "❌ *SOURCE ERROR:* Video link not found. The video might be private or removed." });
                }

                // 🛠️ --- THE STREAM PASS ---
                await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `🔞 *ＸＮＸＸ  ＤＥＬＩＶＥＲＥＤ*\n\n> ✨️ YASEEN－ＭＤ ✨️` 
                }, { quoted: message });

                return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
            }

            // 🚀 --- MODE B: SEARCH ---
            const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}`;
            const sRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const sHtml = await sRes.text();
            const s$ = cheerio.load(sHtml);

            const results = [];
            // Target the specific video result containers
            s$('.mozaique .thumb-inside').each((i, el) => {
                const linkObj = s$(el).find('a').last();
                const href = linkObj.attr('href');
                const title = linkObj.attr('title') || s$(el).find('p a').text().trim();
                
                if (href && href.includes('/video-')) {
                    const link = href.startsWith('http') ? href : `https://www.xnxx.com${href}`;
                    results.push(`*${results.length + 1}.* ${title}\n🔗 ${link}`);
                }
            });

            if (results.length === 0) return await sock.sendMessage(from, { text: "❌ No results found." });

            const report = `🔞 *YASEEN－ＭＤ  Ｘ－ＳＣＡＮ*\n\n` +
                           `${results.slice(0, 10).join('\n\n')}\n\n` +
                           `> *Use .xnxx [url] to download.*\n\n` +
                           `*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { text: report }, { quoted: message });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            // If it fails, it might be a Baileys version issue or WhatsApp file size limit
            await sock.sendMessage(from, { text: "❌ *NODE ERROR:* Remote stream failed. This usually means the video file is too large for WhatsApp's 64MB limit." });
        }
    }
};
