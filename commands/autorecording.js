module.exports = {
    name: "autorecording",
    alias: ["recording", "rec", "arec"],
    description: "Toggle automatic recording for DMs or Group Chats.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        // Security: Owner Only
        if (!isOwner) return;

        // Initialize config objects if they don't exist
        if (!global.botConfig.autoRecording) global.botConfig.autoRecording = { dm: false, gc: false };
        if (!global.botConfig.autoTyping) global.botConfig.autoTyping = { dm: false, gc: false };

        const subCommand = args[0]?.toLowerCase();
        const statusReq = args[1]?.toLowerCase();

        // 🟢 MANUAL (Triggered if no input)
        if (!subCommand) {
            const statusDm = global.botConfig.autoRecording.dm ? 'ON' : 'OFF';
            const statusGc = global.botConfig.autoRecording.gc ? 'ON' : 'OFF';

            const manual = `🎙️ *YASEEN-ＭＤ ＡＵＴＯ-ＲＥＣＯＲＤＩＮＧ*

> *“Make every response feel like a personal note. Keep them waiting.”*

✦═════════════════════✦
1️⃣ *DMs:* \`.autorecording dm on/off\`
   > Status: ${statusDm}

2️⃣ *Groups:* \`.autorecording gc on/off\`
   > Status: ${statusGc}
✦═════════════════════✦

📂 *Field Intel:*
> Shows 'recording audio...' status. Note: Enabling this for a mode will automatically disable 'typing...' for that same mode to maintain realism.

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🔵 LOGIC FOR DM OR GC
        if (subCommand === 'dm' || subCommand === 'gc') {
            if (statusReq === 'on') {
                global.botConfig.autoRecording[subCommand] = true;
                global.botConfig.autoTyping[subCommand] = false; // 🔄 Conflict prevention
                
                return await sock.sendMessage(chatId, { 
                    text: `✅ *Auto-Recording for ${subCommand.toUpperCase()} is now ON.*` 
                });
            } else if (statusReq === 'off') {
                global.botConfig.autoRecording[subCommand] = false;
                return await sock.sendMessage(chatId, { 
                    text: `❌ *Auto-Recording for ${subCommand.toUpperCase()} is now OFF.*` 
                });
            } else {
                return await sock.sendMessage(chatId, { 
                    text: `❓ *Usage:* .autorecording ${subCommand} on/off` 
                });
            }
        } else {
            return await sock.sendMessage(chatId, { text: "❓ *Invalid option.* Use `dm` or `gc`." });
        }
    }
};
