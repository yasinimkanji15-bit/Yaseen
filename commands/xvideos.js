const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

if (!global.xvSearchCache) global.xvSearchCache = {};

module.exports = {
    name: "xxv",
    alias: ["xxv1", "xxv2", "xd", "xget", "xvid", "xvmore"],
    description: "XV All-in-One with Heavy-Stream Support",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const msg = message.message;
        const body = (msg?.conversation || msg?.extendedTextMessage?.text || "").trim();
        const command = body.split(' ')[0].toLowerCase().slice(1);
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. MANUAL ---
        if (!query && command !== "xvmore" && !msg?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const manual = `✦═══════════════════════◆
🔞  *YASEEN  ＸＶ  ＥＸＴＲＡＣＴＯＲ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *${prefix}xxv [keyword]* ➔ Search Menu
> *${prefix}xxv [link]* ➔ Direct Download
> *${prefix}xxv [number]* ➔ Select from List
> *${prefix}xvmore* ➔ Next 10 Results

💡  *ＴＩＰ:* Reply to results with the number!
_Heavy-stream bypass active._

✦═══════════════════════◆
_© 2026 YAS-TECH • XV Node_`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        // --- 🔢 2. SELECTION LOGIC ---
        const quotedMsg = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || "";
        let selectionIndex = null;

        if (quotedText.includes("ＸＶ  ＲＥＳＵＬＴＳ")) {
            const numMatch = body.match(/\d+/); 
            if (numMatch) selectionIndex = parseInt(numMatch[0]) - 1;
        } else if (!isNaN(query) && query !== "") {
            selectionIndex = parseInt(query) - 1;
        }

        if (selectionIndex !== null && global.xvSearchCache[from]) {
            const results = global.xvSearchCache[from].results;
            if (results && results[selectionIndex]) {
                return await downloadXV(sock, from, message, results[selectionIndex].link);
            }
        }

        // --- 🔄 3. PAGINATION ---
        if (command === "xvmore") {
            if (!global.xvSearchCache[from]) return sock.sendMessage(from, { text: "❌ No active search." });
            global.xvSearchCache[from].page += 1;
            return await sendXVMenu(sock, from, message);
        }

        // --- 📥 4. DIRECT DOWNLOAD ---
        if (query.includes('xvideos.com')) {
            return await downloadXV(sock, from, message, query);
        }

        // --- 🔍 5. SEARCH ---
        if (query && isNaN(query)) {
            try {
                await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
                const { data } = await axios.get(`https://www.xvideos.com/?k=${encodeURIComponent(query)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const $ = cheerio.load(data);
                const results = [];
                $('.mozaique .thumb-block').each((i, el) => {
                    const t = $(el).find('p.title a').text().trim();
                    const h = $(el).find('p.title a').attr('href');
                    const d = $(el).find('.duration').text().trim() || "??";
                    if (t && h) results.push({ title: t, link: `https://www.xvideos.com${h}`, duration: d });
                });
                if (results.length === 0) throw new Error();
                global.xvSearchCache[from] = { results, page: 0, query };
                return await sendXVMenu(sock, from, message);
            } catch (e) { return sock.sendMessage(from, { text: "❌ Search failed." }); }
        }
    }
};

// --- HELPERS ---
async function downloadXV(sock, from, message, link) {
    await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });
    try {
        const res = await axios.get(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(res.data);
        const title = $('h2.page-title').text().trim() || 'YASEEN_MD';
        let videoUrl = "";

        $('script').each((i, el) => {
            const sc = $(el).html();
            const mH = sc.match(/setVideoUrlHigh\s*\(\s*['"](.+?)['"]\s*\)/);
            const mL = sc.match(/setVideoUrlLow\s*\(\s*['"](.+?)['"]\s*\)/);
            if (mH) { videoUrl = mH[1]; return false; }
            else if (mL) { videoUrl = mL[1]; }
        });

        if (!videoUrl) throw new Error();

        const filePath = path.join(__dirname, `xv_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await sock.sendMessage(from, { 
            video: fs.readFileSync(filePath), 
            caption: `🔞 *ＤＡＴＡ  ＩＮＪＥＣＴＥＤ*\n\n🎬 *ＴＩＴＬＥ:* ${title}\n\n*🛡️ YASEEN－ＭＤ 🛡️*` 
        }, { quoted: message });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (err) {
        return sock.sendMessage(from, { text: "❌ *ERROR:* Source too heavy or bypass blocked." });
    }
}

async function sendXVMenu(sock, from, message) {
    const cache = global.xvSearchCache[from];
    const items = cache.results.slice(cache.page * 10, (cache.page * 10) + 10);
    if (items.length === 0) return sock.sendMessage(from, { text: "🏁 End of results." });

    let menu = `🔞 *ＸＶ  ＲＥＳＵＬＴＳ  (P. ${cache.page + 1})*\n\n`;
    items.forEach((v, i) => {
        menu += `*${(cache.page * 10) + i + 1}.* ${v.title.substring(0, 45)}...\n   └ ⏱️ ${v.duration}\n\n`;
    });
    menu += `💡 *Reply with the number to download.*`;
    return await sock.sendMessage(from, { text: menu }, { quoted: message });
}
