module.exports = {
    name: "autotyping",
    alias: ["typing", "atyping"],
    description: "Toggle automatic typing for DMs or Group Chats.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        // Security: Owner Only
        if (!isOwner) return;

        // Initialize config if not already set (prevents crashes)
        if (!global.botConfig.autoTyping) {
            global.botConfig.autoTyping = { dm: false, gc: false };
        }

        const subCommand = args[0]?.toLowerCase();
        const statusReq = args[1]?.toLowerCase();

        // 🟢 MANUAL (Triggered if no input or just .autotyping)
        if (!subCommand) {
            const statusDm = global.botConfig.autoTyping.dm ? 'ON' : 'OFF';
            const statusGc = global.botConfig.autoTyping.gc ? 'ON' : 'OFF';

            const manual = `⌨️ *YASEEN-ＭＤ ＡＵＴＯ-ＴＹＰＩＮＧ*

> *“Stay active in the shadows. Control your presence.”*

✦═════════════════════✦
1️⃣ *DMs:* \`.autotyping dm on/off\`
   > Status: ${statusDm}

2️⃣ *Groups:* \`.autotyping gc on/off\`
   > Status: ${statusGc}
✦═════════════════════✦

📂 *Field Intel:*
> Control where the 'typing...' status appears. Perfect for staying low-key in groups while appearing active in DMs.

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🔵 LOGIC FOR DM OR GC
        if (subCommand === 'dm' || subCommand === 'gc') {
            if (statusReq === 'on') {
                global.botConfig.autoTyping[subCommand] = true;
                return await sock.sendMessage(chatId, { 
                    text: `✅ *Auto-Typing for ${subCommand.toUpperCase()} is now ON.*` 
                });
            } else if (statusReq === 'off') {
                global.botConfig.autoTyping[subCommand] = false;
                return await sock.sendMessage(chatId, { 
                    text: `❌ *Auto-Typing for ${subCommand.toUpperCase()} is now OFF.*` 
                });
            } else {
                return await sock.sendMessage(chatId, { 
                    text: `❓ *Usage:* .autotyping ${subCommand} on/off` 
                });
            }
        } else {
            return await sock.sendMessage(chatId, { text: "❓ *Invalid option.* Use `dm` or `gc`." });
        }
    }
};
