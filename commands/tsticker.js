const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

global.tgCache = global.tgCache || {};
global.stickerPack = global.stickerPack || "〲ᴹᵃᶠⁱᵃ࿐ PACK";
global.stickerAuthor = global.stickerAuthor || "YASEEN";

const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    name: "tsticker",
    alias: ["tsti", "tstt", "tele", "tgsticker"],
    description: "Ultra-stable Telegram downloader for Katabump.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const sender = message.key.participant || message.key.remoteJid;
        const input = args[0] || "";
        const BOT_TOKEN = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';
        
        const msgText = (message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || "").toLowerCase();
        const usedCmd = msgText.split(' ')[0].slice(1);

        if (!input || input === 'help') {
            const manual = `✈️ *YASEEN-ＭＤ ＴＥＬＥＧＲＡＭ*

✦═════════════════════✦
1️⃣ *Analyze:* .tsticker [URL]
2️⃣ *Pick One:* .tsti [number]
3️⃣ *Batch:* .tstt [amount]
✦═════════════════════✦

_© 2026 YASEEN Laporte_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        if (input.includes('t.me/addstickers/')) {
            const packName = input.split('/addstickers/')[1];
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });

            try {
                const res = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${encodeURIComponent(packName)}`);
                const stickers = res.data.result.stickers;

                let totalBytes = 0;
                global.tgCache[sender] = stickers.map(s => {
                    totalBytes += (s.file_size || 0);
                    return { file_id: s.file_id, size: s.file_size };
                });

                let msg = `✈️ *PACK:* ${res.data.result.title}\n`;
                msg += `📦 *Stickers:* ${stickers.length}\n`;
                msg += `⚖️ *Size:* ${formatSize(totalBytes)}\n\n`;
                msg += `📑 *INDEX LIST:*\n`;
                const limit = Math.min(stickers.length, 10);
                for (let i = 0; i < limit; i++) {
                    msg += `> ${i + 1}. ${formatSize(stickers[i].file_size)}\n`;
                }
                if (stickers.length > 10) msg += `_...and ${stickers.length - 10} more._\n`;
                msg += `\n👉 \`.tsti [num]\` | \`.tstt [num]\`\n\n_© 2026 YASEEN Laporte_`;

                return await sock.sendMessage(from, { text: msg }, { quoted: message });
            } catch (err) {
                return sock.sendMessage(from, { text: "❌ *Pack not found.*" });
            }
        }

        const userCache = global.tgCache[sender];
        if (!userCache) return sock.sendMessage(from, { text: "❌ *Cache Empty.*" });

        let start = 0, end = 0;
        if (usedCmd === 'tsti') {
            start = parseInt(input) - 1;
            end = start + 1;
        } else if (usedCmd === 'tstt') {
            if (input.includes('-')) {
                const parts = input.split('-');
                start = parseInt(parts[0]) - 1;
                end = Math.min(parseInt(parts[1]), userCache.length);
            } else {
                start = 0;
                end = Math.min(parseInt(input), userCache.length);
            }
        }

        if (isNaN(start) || start < 0 || end <= start) return;

        await sock.sendMessage(from, { text: `🚀 *Processing ${end - start} stickers...*` });

        const processSticker = async (index) => {
            try {
                const fileInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${userCache[index].file_id}`);
                const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.data.result.file_path}`;

                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                const sticker = new Sticker(Buffer.from(response.data), {
                    pack: global.stickerPack,
                    author: global.stickerAuthor,
                    type: StickerTypes.DEFAULT, // Switched to default for better compatibility
                    quality: 30,
                    background: '#00000000'
                });

                const buffer = await sticker.toBuffer();
                return await sock.sendMessage(from, { sticker: buffer });
            } catch (e) {
                console.log(`Error @ ${index}:`, e.message);
            }
        };

        // Process in smaller bursts for Katabump stability
        const batchSize = 2; 
        for (let i = start; i < end; i += batchSize) {
            const chunk = [];
            for (let j = i; j < i + batchSize && j < end; j++) {
                chunk.push(processSticker(j));
            }
            await Promise.all(chunk);
            await new Promise(res => setTimeout(res, 1000)); // Small breather
        }

        return await sock.sendMessage(from, { text: "✅ *Complete.*" });
    }
};
