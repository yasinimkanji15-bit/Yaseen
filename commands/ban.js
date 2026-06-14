const isAdmin = require('../lib/isAdmin');

module.exports = {
    name: "ban",
    alias: ["banuser", "blockuser"],
    description: "Ban a user from sending messages (Auto-delete their texts).",
    category: "owner",

    execute: async (sock, chatId, m, args, { isOwner }) => {
        // Tunahakikisha ni Owner tu anayeweza ku-ban watu
        if (!isOwner) return sock.sendMessage(chatId, { text: "❌ This command is for the Bot Owner only!" });

        // Tunapata namba ya mtu (aidha kwa ku-tag, ku-reply, au kuandika namba)
        let target;
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0]) {
            target = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
        }

        if (!target) return sock.sendMessage(chatId, { text: "❓ Please tag or reply to the user you want to ban." });

        // Tunahifadhi kwenye global list (In-memory)
        if (!global.bannedUsers) global.bannedUsers = [];
        
        if (global.bannedUsers.includes(target)) {
            return sock.sendMessage(chatId, { text: `⚠️ User @${target.split('@')[0]} is already banned.`, mentions: [target] });
        }

        global.bannedUsers.push(target);
        await sock.sendMessage(chatId, { text: `✅ User @${target.split('@')[0]} has been banned. Their messages will be auto-deleted.`, mentions: [target] });
    }
};