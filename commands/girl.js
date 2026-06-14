module.exports = {
    name: "girl",
    alias: ["find", "portrait", "random", "g"],
    description: "Fetch multiple random high-quality portraits from the global archives.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        // 🗺️ --- THE REGION ARCHIVE ---
        const regions = {
            'vietnam': 'https://apis.prexzyvilla.site/random/vietnamgirl',
            'thailand': 'https://apis.prexzyvilla.site/random/thailandgirl',
            'malaysia': 'https://apis.prexzyvilla.site/random/malaysiagirl',
            'korea': 'https://apis.prexzyvilla.site/random/koreangirl',
            'japan': 'https://apis.prexzyvilla.site/random/japangirl',
            'indonesia': 'https://apis.prexzyvilla.site/random/indonesiagirl',
            'hijab': 'https://apis.prexzyvilla.site/random/hijabgirl',
            'china': 'https://apis.prexzyvilla.site/random/chinagirl'
        };

        // 🧠 --- PARSE ARGUMENTS ---
        let count = parseInt(args[0]);
        let query = args[1]?.toLowerCase();

        // If user types ".girl japan" (no number), default to 1 image
        if (isNaN(count)) {
            count = 1;
            query = args[0]?.toLowerCase();
        }

        // 📜 --- THE GHOST MANUAL (Vertical Quote Style) --- 📜
        if (!query || !regions[query]) {
            const manual = `🖼️ *YASEEN－ＭＤ  ＧＡＬＬＥＲＹ*

> *“Beauty is a universal language, captured in pixels.”*

✦═════════════════════◆
🌏 *ＡＶＡＩＬＡＢＬＥ  ＲＥＧＩＯＮＳ:*

> • \`japan\`
> • \`korea\`
> • \`china\`
> • \`vietnam\`
> • \`thailand\`
> • \`malaysia\`
> • \`indonesia\`
> • \`hijab\`
✦═════════════════════◆

*⚙️ ＵＳＡＧＥ:*
• \`.girl [region]\` -> 1 image.
• \`.girl [number] [region]\` -> Multi-fetch.
Example: \`.girl 3 japan\`

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🛡️ --- SAFETY LIMIT ---
        if (count > 10) count = 10; // Prevent spam/ban

        try {
            await sock.sendMessage(chatId, { react: { text: '📸', key: message.key } });

            for (let i = 0; i < count; i++) {
                const imageUrl = regions[query];
                
                // 🚀 --- DISPATCH IMAGES ---
                await sock.sendMessage(chatId, { 
                    image: { url: imageUrl }, 
                    caption: `> 🖼️ 𝐏𝐎𝐓𝐑𝐀𝐈𝐓 𝐅𝐄𝐓𝐂𝐇𝐄𝐃 [${i + 1}/${count}]

📍 *𝐓𝐘𝐏𝐄:* ${query.toUpperCase()}
> * 🪭 LA YASEEN－ＭＤ 🪭*` 
                });
                
                // Small delay to prevent WhatsApp rate-limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: "❌ *LINK FAILURE:* The portrait archive is offline." });
        }
    }
};
