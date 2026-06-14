module.exports = {
    name: "antidelete",
    alias: ["ad", "antidel"],
    description: "Toggle Anti-Delete and set recovery path (DM, GC, or Group).",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        // Initialize defaults if they don't exist
        if (global.botConfig.antiDelete === undefined) global.botConfig.antiDelete = false;
        if (!global.botConfig.antiDeletePath) global.botConfig.antiDeletePath = "dm";

        const config = global.botConfig;
        const action = args[0]?.toLowerCase();

        // 📜 --- CLEAN MANUAL --- 📜
        if (!action) {
            const status = config.antiDelete ? "ENABLED ✅" : "DISABLED ❌";
            const currentPath = config.antiDeletePath.toUpperCase();

            const manual = `🛡️ *ANTIDELETE CONTROL CENTER*

> *“What is deleted by man, shall be revealed by YAS-BOT.”*

✦═════════════════◆
  *STATUS:* ${status}
  *PATH:* ${currentPath}
✦═════════════════◆

*COMMANDS:*
• \`.ad on\` -> Enable system.
• \`.ad off\` -> Disable system.
• \`.ad path dm\` -> Send to your DMs.
• \`.ad path gc\` -> Send to the current Group.
• \`.ad path group\` -> Send to a group named "Antidelete".

*Note:* Owner Shield is active (Bot ignores your deletions).

*🛡️ YAS-TECH 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 1. Toggle On/Off
        if (action === 'on') {
            config.antiDelete = true;
            await sock.sendMessage(chatId, { text: "🛡️ *Anti-Delete Engine:* ONLINE" });
        } 
        else if (action === 'off') {
            config.antiDelete = false;
            await sock.sendMessage(chatId, { text: "🔓 *Anti-Delete Engine:* OFFLINE" });
        } 

        // 2. Change Path
        else if (action === 'path' && args[1]) {
            const newPath = args[1].toLowerCase();
            if (['dm', 'gc', 'group'].includes(newPath)) {
                config.antiDeletePath = newPath;
                let msg = `📍 *Recovery Path:* Set to ${newPath.toUpperCase()}`;
                if (newPath === 'group') msg += `\n⚠️ *Note:* Create a group named "Antidelete" for this to work.`;
                await sock.sendMessage(chatId, { text: msg });
            } else {
                await sock.sendMessage(chatId, { text: "❌ Valid paths: *dm*, *gc*, or *group*." });
            }
        }
    }
};
