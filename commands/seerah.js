const seerahList = require('./seerahlist');

module.exports = {
    name: "seerah",
    alias: ["history", "sirah"],
    description: "Chronological history of the Prophet Muhammad (SAW).",
    category: "islamic",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const subCommand = args[0]?.toLowerCase();
        const input = args.slice(1).join(" ").toLowerCase();

        // 📜 --- THE EXPANDED ENGLISH MANUAL --- 📜
        if (!subCommand) {
            const manual = `✦═════════◆═════════✦
📜  *ＳＥＥＲＡＨ  ＥＮＧＩＮＥ* 📜
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Learn the chronological milestones of the Prophet Muhammad (SAW)'s life.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}seerah list*
_View all available historical chapters._

> 2️⃣  *${prefix}seerah view [number]*
_Read the summary of a specific chapter._

💡  *ＥＸＡＭＰＬＥＳ:*
> *${prefix}seerah view 1*
> *${prefix}seerah view 7*

✦═════════◆═════════✦
_© 2026 YAS-TECH • History Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 📋 --- LIST LOGIC --- 📋
        if (subCommand === 'list') {
            let listText = `✦═════════◆═════════✦\n📜  *ＳＥＥＲＡＨ  ＣＨＡＰＴＥＲＳ*\n✦═════════◆═════════✦\n`;
            seerahList.forEach((item, index) => {
                listText += `> *${index + 1}.* ${item.t} (${item.y})\n`;
            });
            listText += `\n*Usage:* ${prefix}seerah view [number]\n✦═════════◆═════════✦`;
            return await sock.sendMessage(chatId, { text: listText }, { quoted: message });
        }

        // 🔍 --- VIEW CHAPTER LOGIC --- 🔍
        if (subCommand === 'view') {
            if (!input) return await sock.sendMessage(chatId, { text: "❌ *Error:* Please provide a chapter number." });

            const index = parseInt(input) - 1;
            const result = seerahList[index];

            if (!result) return await sock.sendMessage(chatId, { text: "❌ *Error:* Chapter not found. Use 1 to " + seerahList.length });

            const response = `✦═════════◆═════════✦
📖  *ＣＨＡＰＴＥＲ: ${result.t.toUpperCase()}* ✦═════════◆═════════✦

📅  *ＹＥＡＲ:*
> ${result.y}

  *ＥＮＧＬＩＳＨ:*
> ${result.e}

  *ＳＷＡＨＩＬＩ:*
> ${result.s}

✦═════════◆═════════✦
_© 2026 YAS-TECH • History Node_`;
            
            return await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }
    }
};
