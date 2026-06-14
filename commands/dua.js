const duaList = require('./dualist');

module.exports = {
    name: "dua",
    alias: ["supplication", "maombi"],
    description: "Categorized library of daily supplications for YAS-TECH",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const subCommand = args[0]?.toLowerCase();
        const input = args.slice(1).join(" ").toLowerCase();

        // 📜 --- THE EXPANDED ENGLISH MANUAL --- 📜
        if (!subCommand) {
            const manual = `✦═════════◆═════════✦
🤲  *ＤＵＡ  ＣＥＮＴＲＡＬ* 🤲
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Access categorized supplications for specific needs and occasions.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}dua cat*
_View all available Dua categories._

> 2️⃣  *${prefix}dua list*
_View the full list of all available Duas._

> 3️⃣  *${prefix}dua view [number/title]*
_Get the full text by its list number or its name._

💡  *ＥＸＡＭＰＬＥＳ:*
> *${prefix}dua view 7*
> *${prefix}dua view travel*

✦═════════◆═════════✦
_© 2026 YAS-TECH • Heart Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 📁 --- CATEGORY LIST LOGIC --- 📁
        if (subCommand === 'cat') {
            const categories = [...new Set(duaList.map(item => item.c))];
            let catText = `✦═════════◆═════════✦\n📂  *ＤＵＡ  ＣＡＴＥＧＯＲＩＥＳ*\n✦═════════◆═════════✦\n`;
            categories.forEach(cat => catText += `> • ${cat.toUpperCase()}\n`);
            catText += `\n*Usage:* ${prefix}dua list [category]\n✦═════════◆═════════✦`;
            return await sock.sendMessage(chatId, { text: catText }, { quoted: message });
        }

        // 📋 --- DYNAMIC LIST LOGIC --- 📋
        if (subCommand === 'list') {
            const categoryInput = args[1]?.toLowerCase();
            let filtered = duaList;
            let titleHeader = "ＡＬＬ  ＡＶＡＩＬＡＢＬＥ";

            if (categoryInput && isNaN(categoryInput)) {
                filtered = duaList.filter(d => d.c === categoryInput);
                titleHeader = categoryInput.toUpperCase();
            }

            if (filtered.length === 0) return await sock.sendMessage(chatId, { text: `❌ *Error:* No Duas found.` });

            let listText = `✦═════════◆═════════✦\n🤲  *${titleHeader}  ＤＵＡＳ*\n✦═════════◆═════════✦\n`;
            filtered.forEach((item, index) => {
                listText += `> *${index + 1}.* ${item.t}\n`;
            });
            listText += `\n*Usage:* ${prefix}dua view [number]\n✦═════════◆═════════✦`;
            return await sock.sendMessage(chatId, { text: listText }, { quoted: message });
        }

        // 🔍 --- VIEW LOGIC (BY NUMBER OR TITLE) --- 🔍
        if (subCommand === 'view') {
            if (!input) return await sock.sendMessage(chatId, { text: `❌ *Error:* Please provide a number or title.` });

            let result;
            const index = parseInt(input) - 1;

            // Check if input is a Number or a String
            if (!isNaN(index)) {
                result = duaList[index];
            } else {
                result = duaList.find(d => d.t.toLowerCase() === input);
            }

            if (!result) return await sock.sendMessage(chatId, { text: "❌ *Error:* Dua not found in library." });

            const response = `✦═════════◆═════════✦
🤲  *ＤＵＡ: ${result.t.toUpperCase()}* 🤲
✦═════════◆═════════✦

📖  *ＡＲＡＢＩＣ / ＲＥＡＤＩＮＧ:*
> ${result.s}

  *ＥＮＧＬＩＳＨ:*
> ${result.e}

  *ＳＷＡＨＩＬＩ:*
> ${result.m}

✦═════════◆═════════✦
_© 2026 YAS-TECH • Heart Node_`;
            return await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }
    }
};
