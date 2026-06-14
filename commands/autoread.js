module.exports = {
    name: "autoread",
    alias: ["read", "seen"],
    description: "Toggle automatic message reading (Blue Ticks).",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        const from = chatId;

        // Security: Only the owner can toggle system settings
        if (!isOwner) return;

        // 🟢 MANUAL (Triggered if no arguments are provided)
        if (!args[0] || args[0] === 'manual') {
            const manual = `🛡️ *YASEEN-ＭＤ ＡＵＴＯ-ＲＥＡＤ*

> *“Control the vision. Decide when the ticks turn blue.”*

✦═════════════════════✦
1️⃣ *Usage:* .autoread [on/off]
2️⃣ *Status:* Currently ${global.botConfig.autoRead ? 'ENABLED' : 'DISABLED'}
✦═════════════════════✦

📂 *Field intel:*
> Turn this ON to mark all messages as read instantly across all chats. Turn it OFF to maintain tactical stealth.

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(from, { text: manual });
        }

        const action = args[0].toLowerCase();

        if (action === 'on') {
            global.botConfig.autoRead = true;
            await sock.sendMessage(from, { 
                text: "✅ *Auto Read is now ON.*\n\n> All incoming messages will be marked as seen instantly." 
            });
        } else if (action === 'off') {
            global.botConfig.autoRead = false;
            await sock.sendMessage(from, { 
                text: "❌ *Auto Read is now OFF.*\n\n> Messages will remain unread until you manually open them." 
            });
        } else {
            await sock.sendMessage(from, { text: "❓ *Invalid option.* Use .autoread on or .autoread off" });
        }
    }
};
