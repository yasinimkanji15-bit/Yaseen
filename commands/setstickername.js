module.exports = {
    name: "setstickername",
    alias: ["setpack", "setauthor"],
    description: "Update the global sticker metadata for all sticker commands.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const input = args.join(" ");

        // 🟢 HELP MANUAL
        if (!input || input === 'help') {
            const manual = `🏷️ *YASEEN-ＭＤ ＭＥＴＡＤＡＴＡ*

✦═════════════════════✦
✨ *HOW TO USE:*

> Type: \`.setstickername [Pack] | [Author]\`
> _Example: .setstickername Mafia | YASEEN_

ℹ️ *This updates the name shown when someone clicks on your stickers.*
✦═════════════════════✦

_Current Pack:_ *${global.stickerPack || "None"}*
_Current Author:_ *${global.stickerAuthor || "None"}*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // 🛠️ UPDATE LOGIC
        if (!input.includes("|")) {
            return sock.sendMessage(from, { 
                text: "❌ *Invalid Format!*\n\nPlease use the pipe symbol: \`.setstickername PackName | AuthorName\`" 
            });
        }

        const [pack, author] = input.split("|").map(t => t.trim());
        
        // Updating global variables used by sticker.js and stickersearch.js
        global.stickerPack = pack;
        global.stickerAuthor = author;

        const successMsg = `✅ *METADATA UPDATED!*

📦 *New Pack:* ${pack}
👤 *New Author:* ${author}

_All new stickers will now carry this name._`;

        return sock.sendMessage(from, { text: successMsg }, { quoted: message });
    }
};
