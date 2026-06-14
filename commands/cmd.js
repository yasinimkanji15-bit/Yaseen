const fs = require('fs');
const path = require('path');

module.exports = {
    name: "cmd",
    alias: ["allcmds", "files", "listfiles"],
    description: "Scan all physical command files in the system.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        // Security: Only the owner should see the file structure
        if (!isOwner) return; 

        const prefix = global.botConfig.prefix || ".";

        // 🟢 Built-in Manual logic (Triggers if no arguments are given)
        if (args.length === 0) {
            const cmdManual = `📂 *YASEEN-ＭＤ ＳＹＳＴＥＭ ＳＣＡＮ*

List and verify every internal command module in your system.

✦═════════◆═════════✦
✨ *HOW TO USE:*

1️⃣ *Full Scan:*
> Type \`${prefix}cmd scan\`
> _Lists all .js files in your commands folder._

2️⃣ *Quick List:*
> Type \`${prefix}cmd all\`
> _Shows total file count and names._

*Why use this?*
> 🛠️ Check if your \`${prefix}update\` worked.
> 🛠️ Verify filenames before deleting.
> 🛠️ Monitor total active modules.

✦═════════◆═════════✦

_© 2026 YASEEN Laporte • Powered by YASEEN_`;

            return await sock.sendMessage(chatId, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" },
                caption: cmdManual 
            }, { quoted: message });
        }

        // 2. THE SCAN LOGIC (Triggers if they type .cmd scan or .cmd all)
        try {
            await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

            const dir = path.join(__dirname, '../commands'); 
            
            if (!fs.existsSync(dir)) {
                return await sock.sendMessage(chatId, { text: "❌ Commands directory not found." });
            }

            // Read directory and filter for Javascript files
            const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

            if (files.length === 0) {
                return await sock.sendMessage(chatId, { text: "📭 No command files found in directory." });
            }

            let response = `📂 *YAS-TECH SYSTEM REPORT*\n\n`;
            response += `> *Total Modules:* ${files.length} files detected ✅\n\n`;

            // Loop through files and format them as 1. .filename.js
            files.forEach((file, index) => {
                response += `${index + 1}. .${file}\n`;
            });

            response += `\n*Status:* System operational 🚀`;

            await sock.sendMessage(chatId, { 
                text: response,
                contextInfo: {
                    externalAdReply: {
                        title: "FILE EXPLORER ACTIVE",
                        body: `${files.length} Files found in /commands/`,
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/yb43pn.jpg",
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '📂', key: message.key } });

        } catch (err) {
            console.error("Scan Error:", err);
            await sock.sendMessage(chatId, { text: "❌ Error accessing the file system." });
        }
    }
};
