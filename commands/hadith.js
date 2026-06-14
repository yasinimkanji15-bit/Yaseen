const hadithList = require('./hadithlist');

module.exports = {
    name: "hadith",
    alias: ["mtume", "sunnah"],
    description: "Fetch authentic Prophetic sayings from the YAS-TECH library.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const input = args[0]?.toLowerCase();

        // 📜 --- THE EXPANDED ENGLISH MANUAL --- 📜
        if (!input) {
            const manual = `✦═════════◆═════════✦
📜  *ＨＡＤＩＴＨ  ＥＮＧＩＮＥ* 📜
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Access a collection of ${hadithList.length}+ authentic Prophetic sayings (Ahadith) from Sahih sources.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}hadith random*
_Fetches a random Sahih Hadith for daily reflection._

> 2️⃣  *${prefix}hadith list*
_View the summary of narrators in the library._

💡  *ＥＸＡＭＰＬＥ:*
> *${prefix}hadith random*

🌟  *ＢＥＮＥＦＩＴＳ:*
_“Whoever follows my Sunnah has loved me, and whoever loves me will be with me in Paradise.”_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Wisdom Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 📝 --- RANDOM HADITH LOGIC --- 📝
        if (input === 'random') {
            await sock.sendMessage(chatId, { react: { text: '📜', key: message.key } });
            
            const pick = hadithList[Math.floor(Math.random() * hadithList.length)];
            
            const response = `✦═════════◆═════════✦
📜  *ＳＡＨＩＨ  ＨＡＤＩＴＨ* 📜
✦═════════◆═════════✦

👤  *ＮＡＲＲＡＴＯＲ:*
> ${pick.n}

📖  *ＨＡＤＩＴＨ:*
> 🇬🇧 *EN:* ${pick.e}
> 🇹🇿 *SW:* ${pick.s}

📚  *ＲＥＦＥＲＥＮＣＥ:*
> ${pick.r}

✦═════════◆═════════✦
_© 2026 YAS-TECH • Wisdom Node_`;

            return await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }

        // 📋 --- LIST LOGIC --- 📋
        if (input === 'list') {
            let listText = `✦═════════◆═════════✦\n📜  *ＡＶＡＩＬＡＢＬＥ  ＮＡＲＲＡＴＯＲＳ*\n✦═════════◆═════════✦\n`;
            // Show top 20 narrators
            hadithList.slice(0, 20).forEach((item, index) => {
                listText += `> *${index + 1}.* Narrated by ${item.n}\n`;
            });
            listText += `\n*Showing top 20 of ${hadithList.length} entries.*\n*Usage:* ${prefix}hadith random\n✦═════════◆═════════✦`;
            return await sock.sendMessage(chatId, { text: listText }, { quoted: message });
        }
        
        return await sock.sendMessage(chatId, { text: `❌ *Command Error:* Use *${prefix}hadith random* or *${prefix}hadith list*.` }, { quoted: message });
    }
};
