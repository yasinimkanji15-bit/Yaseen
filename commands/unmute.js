const isAdmin = require('../lib/isAdmin'); // Inaita lile file tulilotengeneza kwenye folder la lib

module.exports = {
    name: "unmute",
    alias: ["open", "unlock"],
    description: "Manually unmute the group settings.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        // 1. Hakikisha ni kwenye Group
        if (!isGroup) {
            return sock.sendMessage(chatId, { text: "❌ This command can only be used in groups." });
        }

        try {
            // 2. Kagua kama bot na anayetuma ni Admins
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

            if (!isBotAdmin) {
                return sock.sendMessage(chatId, { text: "❌ I need to be an Admin to unmute this group." }, { quoted: m });
            }

            if (!isSenderAdmin) {
                return sock.sendMessage(chatId, { text: "❌ Only group admins can use the unmute command." }, { quoted: m });
            }

            // 3. Kitendo cha kufungua Group (Unmute)
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            
            await sock.sendMessage(chatId, { 
                text: "🔓 *The group has been unmuted.* Everyone can now send messages!" 
            }, { quoted: m });

        } catch (error) {
            console.error('Error in unmute command:', error);
            await sock.sendMessage(chatId, { text: "⚠️ Failed to unmute the group. Please try again." }, { quoted: m });
        }
    }
};
