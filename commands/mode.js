module.exports = {
    name: "mode",
    alias: ["public", "private", "botmode"],
    description: "Switch the bot between Public and Private mode (Default: Private).",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner, body }) => {
        // 🟢 OWNER CHECK
        if (!isOwner) return;

        // 🟢 INITIALIZE DEFAULT (Private)
        if (global.botConfig.isPublic === undefined) {
            global.botConfig.isPublic = false; // Default is now Private
        }

        const command = body.split(" ")[0].toLowerCase();

        // 1. Logic for .public
        if (command.includes("public")) {
            global.botConfig.isPublic = true;
            return await sock.sendMessage(chatId, { 
                text: "🔓 *ＢＯＴ  ＭＯＤＥ:  ＰＵＢＬＩＣ*\n\n> System unlocked. All users may now interface with YAS-TECH" 
            });
        }

        // 2. Logic for .private
        if (command.includes("private")) {
            global.botConfig.isPublic = false;
            return await sock.sendMessage(chatId, { 
                text: "🔒 *ＢＯＴ  ＭＯＤＥ:  ＰＲＩＶＡＴＥ*\n\n> System locked. YAS-TECH will now only respond to the Owner." 
            });
        }

        // 3. Logic for .mode (The Manual)
        const currentMode = global.botConfig.isPublic ? "PUBLIC 🔓" : "PRIVATE 🔒";
        
        const manual = `⚙️ *YASEEN－ＭＯＤＥ  ＩＮＴＥＬ*

> *“Control who accesses the neural network.”*

✦═════════════════◆
  *ＣＵＲＲＥＮＴ  ＳＴＡＴＵＳ:* ${currentMode}
✦═════════════════◆

*ＣＯＭＭＡＮＤＳ:*
• \`.public\`  -> Open access for all users.
• \`.private\` -> Restricted to Owner only (Default).

*🛡️ YASEEN－ＭＤ 🛡️*`;

        await sock.sendMessage(chatId, { text: manual }, { quoted: message });
    }
};
