module.exports = {
    name: "autoreact",
    alias: ["react", "autojoji"],
    description: "Toggle auto-reaction for GC or DM and set emojis.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        const config = global.botConfig;
        const action = args[0]?.toLowerCase();

        // 📜 --- MINIMALIST MANUAL --- 📜
        if (!action) {
            const manual = `🎭 *YASEEN-ＭＤ  ＡＵＴＯ-ＲＥＡＣＴ*

> *“Emotional intelligence, automated.”*

✦═════════════════════◆
*⚙️ ＣＯＮＴＲＯＬＳ:*
• \`.react gc on/off\` -> Toggle for Groups.
• \`.react dm on/off\` -> Toggle for Private DMs.
• \`.react set [emojis]\` -> Set reaction list.

*💡 ＥＸＡＭＰＬＥ:*
> _.react set 🔥,💀,✨_make sure you separate your set emojis by comma 
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 1. 🟢 TOGGLE LOGIC (GC/DM)
        if (action === 'gc' || action === 'dm') {
            const target = action === 'gc' ? 'autoReactGC' : 'autoReactDM';
            const state = args[1]?.toLowerCase();

            if (state === 'on') {
                config[target] = true;
                await sock.sendMessage(chatId, { text: `✅ *Auto-React [${action.toUpperCase()}] is now ON.*` });
            } else if (state === 'off') {
                config[target] = false;
                await sock.sendMessage(chatId, { text: `❌ *Auto-React [${action.toUpperCase()}] is now OFF.*` });
            } else {
                await sock.sendMessage(chatId, { text: `❓ Use: \`.react ${action} on\` or \`.react ${action} off\`` });
            }
        } 

        // 2. 🟢 SET EMOJIS
        else if (action === 'set') {
            let emojiInput = args.slice(1).join(" ");
            if (!emojiInput) return sock.sendMessage(chatId, { text: "❌ *Provide emojis!*" });

            const newEmojis = emojiInput.split(',').map(e => e.trim()).filter(e => e !== "");
            config.reactEmojis = newEmojis;

            await sock.sendMessage(chatId, { 
                text: `✅ *EMOJIS UPDATED*\n\n> *Active Set:* ${newEmojis.join(" ")}` 
            });
        }
    }
};
