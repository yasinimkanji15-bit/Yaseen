const mumaker = require('mumaker');

module.exports = {
    name: "logo",
    alias: ["gfx", "textgen", "design", "phub", "marvel", "netflix", "glitch"],
    description: "The complete YAS-TECH visual identity engine.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const prefix = "."; 
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

        let style = args[0]?.toLowerCase();
        let text = args.slice(1).join(' ');

        if (["phub", "netflix", "glitch", "marvel"].includes(command)) {
            style = command;
            text = args.join(' ');
        }

        const styles = {
            'maker': 'https://apis.prexzyvilla.site/logomaker?text=',
            'sand': 'https://apis.prexzyvilla.site/sandsummer?text=',
            'light': 'https://apis.prexzyvilla.site/lighteffects?text=',
            'write': 'https://apis.prexzyvilla.site/writetext?text=',
            'typo': 'https://apis.prexzyvilla.site/typographytext?text=',
            'delete': 'https://apis.prexzyvilla.site/deletingtext?text=',
            'glow': 'https://apis.prexzyvilla.site/glowingtext?text=',
            'water': 'https://apis.prexzyvilla.site/underwatertext?text=',
            'cartoon': 'https://apis.prexzyvilla.site/cartoonstyle?text=',
            'neon': 'https://apis.prexzyvilla.site/neonlight?text=',
            'phub': 'https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html',
            'netflix': 'https://en.ephoto360.com/create-netflix-style-video-logo-online-608.html',
            'glitch': 'https://en.ephoto360.com/create-a-glitch-text-effect-online-free-441.html',
            'magma': 'https://en.ephoto360.com/create-a-magma-hot-text-effect-online-491.html',
            'marvel': 'https://omegatech-api.dixonomega.tech/api/Maker/avengers'
        };

        // 📜 --- THE GHOST MANUAL (STRICTLY VERTICAL) ---
        if (!style || !styles[style] || !text) {
            const manual = `🎨 *YASEEN－ＭＤ  ＧＦＸ  ＥＮＧＩＮＥ*

> *“Synthesizing visual data streams.”*

✦═════════════════════◆
🖌️ *ＰＲＯ  ＬＯＧＯＳ:*
> • .netflix [text]
> • .marvel [text1,text2]
> • .phub [text1,text2]

✨ *ＥＦＦＥＣＴＳ:*
> • .logo glow
> • .logo maker
> • .logo sand
> • .logo water
> • .logo glitch
> • .logo magma
> • .logo cartoon
> • .logo light
> • .logo typo
> • .logo write
> • .logo delete
> • .logo neon

⚙️ *ＵＳＡＧＥ:*
> Type \`.logo [style] [text]\`
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🖌️', key: message.key } });
            let finalImageUrl = "";

            if (style === 'marvel') {
                if (!text.includes(',')) return await sock.sendMessage(chatId, { text: "❌ *FORMAT ERROR:* Use a comma ( \`,\` ) for Marvel.\nExample: \`.marvel Marvel, Studios\`" });
                const [t1, t2] = text.split(',').map(t => t.trim());
                finalImageUrl = `${styles.marvel}?text1=${encodeURIComponent(t1)}&text2=${encodeURIComponent(t2)}`;
            } 
            else if (['phub', 'netflix', 'glitch', 'magma'].includes(style)) {
                let inputs = text.split(',').map(t => t.trim());
                const res = await mumaker.textpro(styles[style], inputs);
                finalImageUrl = res.image;
            } 
            else {
                finalImageUrl = styles[style] + encodeURIComponent(text);
            }

            await sock.sendMessage(chatId, { 
                image: { url: finalImageUrl }, 
                caption: `🎨 *ＬＯＧＯ  ＧＥＮＥＲＡＴＥＤ*\n\n> ✨️ YASEEN－ＭＤ ✨️`
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(chatId, { text: "❌ *RENDER ERROR:* Node timed out or input was invalid." });
        }
    }
};
