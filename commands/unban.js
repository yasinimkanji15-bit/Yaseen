module.exports = {
    name: "unban",
    alias: ["pardon"],
    description: "Unban a user.",
    category: "owner",

    execute: async (sock, chatId, m, args, { isOwner }) => {
        if (!isOwner) return sock.sendMessage(chatId, { text: "❌ Owner only!" });

        let target;
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0]) {
            target = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
        }

        if (!target) return;

        if (!global.bannedUsers) global.bannedUsers = [];
        global.bannedUsers = global.bannedUsers.filter(u => u !== target);
        
        await sock.sendMessage(chatId, { text: `🔓 User @${target.split('@')[0]} has been unbanned.`, mentions: [target] });
    }
};